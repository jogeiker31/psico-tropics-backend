import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Cliente } from '../cliente/schemas/cliente.schema';
import { Medicamento } from '../medicamento/schema/medicamento.schema';
import { VarianteMedicamento } from '../medicamento/schema/varianteMedicamento.schema';
import { Compra } from '../compra/schemas/compra.schema';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(VarianteMedicamento.name)
    private varianteMedicamentoModel: Model<VarianteMedicamento>,
    @InjectModel(Compra.name) private compraModel: Model<Compra>,
  ) {}

  async getmetrics() {
    const clientes = await this.clienteModel.countDocuments();
    const medicamentos = await this.medicamentoModel.countDocuments({
      deleted: false,
    });
    const variantes = await this.varianteMedicamentoModel.countDocuments({
      deleted: false,
    });
    const compras = await this.compraModel.countDocuments();
    const medicamentoMasVendido =
      await this.getRankingMedicamentosMasVendidos();
    const compradores = await this.getRankingClientesMasCompradores();

    return {
      clientes,
      medicamentos,
      variantes,
      compras,
      medicamentoMasVendido,
      compradores,
    };
  }

  async getRankingMedicamentosMasVendidos() {
    const resultado = await this.compraModel.aggregate([
      { $unwind: '$medicamentos' }, // Descomponer el array de medicamentos

      {
        $group: {
          _id: '$medicamentos.id', // Agrupar por ID de variante de medicamento
          cantidadTotal: { $sum: '$medicamentos.cantidad' }, // Sumar la cantidad vendida
        },
      },

      {
        $lookup: {
          from: 'variantemedicamentos', // Colección de variantes
          localField: '_id',
          foreignField: '_id',
          as: 'variante',
        },
      },
      { $unwind: '$variante' },

      {
        $lookup: {
          from: 'medicamentos', // Colección de medicamentos principales
          localField: 'variante.principio_activo',
          foreignField: '_id',
          as: 'medicamento',
        },
      },
      { $unwind: '$medicamento' },

      // Agrupar nuevamente por el principio activo para consolidar variantes
      {
        $group: {
          _id: '$medicamento.principio_activo', // Agrupar por principio activo
          cantidadTotal: { $sum: '$cantidadTotal' }, // Sumar todas las variantes
        },
      },

      { $sort: { cantidadTotal: -1 } }, // Ordenar de mayor a menor

      { $limit: 5 }, // Obtener los 5 más vendidos

      {
        $project: {
          _id: 0, // Ocultar _id
          principioActivo: '$_id',
          cantidadTotal: 1,
        },
      },
    ]);

    return resultado;
  }

  async getRankingClientesMasCompradores() {
    const resultado = await this.compraModel.aggregate([
      {
        $group: {
          _id: '$cliente', // Agrupar por cliente
          totalCompras: { $sum: 1 }, // Contar el número de compras
        },
      },

      { $sort: { totalCompras: -1 } }, // Ordenar de mayor a menor

      { $limit: 5 }, // Obtener los 5 clientes con más compras

      {
        $lookup: {
          from: 'clientes', // Colección de clientes
          localField: '_id',
          foreignField: '_id',
          as: 'cliente',
        },
      },
      { $unwind: '$cliente' },

      {
        $project: {
          _id: '$cliente._id',
          nombre: '$cliente.nombre_apellido', // Obtener el nombre del cliente
          cedula: '$cliente.cedula', // Obtener la cédula del cliente
          totalCompras: 1,
        },
      },
    ]);

    return resultado;
  }

  async getMedicamentosVendidosEnMes(mes: number, anio: number) {
    const resultado = await this.compraModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(anio, mes - 1, 1), // Primer día del mes
            $lt: new Date(anio, mes, 1), // Primer día del siguiente mes
          },
        },
      },
      { $unwind: '$medicamentos' }, // Descomponer el array de medicamentos
      {
        $group: {
          _id: '$medicamentos.id', // Agrupar por ID del medicamento
          cantidadTotal: { $sum: '$medicamentos.cantidad' }, // Sumar la cantidad vendida
        },
      },
      {
        $lookup: {
          from: 'variantemedicamentos', // Colección de variantes
          localField: '_id',
          foreignField: '_id',
          as: 'variante',
        },
      },
      { $unwind: '$variante' },
      {
        $lookup: {
          from: 'medicamentos', // Colección de medicamentos principales
          localField: 'variante.principio_activo',
          foreignField: '_id',
          as: 'medicamento',
        },
      },
      { $unwind: '$medicamento' },
      {
        $group: {
          _id: '$medicamento.principio_activo', // Agrupar por el nombre del medicamento
          cantidad: { $sum: '$cantidadTotal' }, // Sumar cantidades del mismo medicamento
        },
      },
      {
        $project: {
          _id: 0,
          nombre: '$_id', // Asignar el nombre correcto
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } }, // Ordenar de mayor a menor
    ]);

    // Calcular el total de medicamentos vendidos
    const totalMedicamentos = resultado.reduce(
      (acc, item) => acc + item.cantidad,
      0,
    );

    return {
      totalMedicamentos,
      detalle: resultado,
    };
  }
}
