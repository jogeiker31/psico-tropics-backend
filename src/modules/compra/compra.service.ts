import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Counter } from './schemas/counter.schema';
import { Model, Types } from 'mongoose';
import { Compra, TipoCliente } from './schemas/compra.schema';
import { Medicamento } from '../medicamento/schema/medicamento.schema';
import { VarianteMedicamento } from '../medicamento/schema/varianteMedicamento.schema';
import { Cliente } from '../cliente/schemas/cliente.schema';

@Injectable()
export class CompraService {
  constructor(
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
    @InjectModel(Compra.name) private compraModel: Model<Compra>,
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(VarianteMedicamento.name)
    private varianteMedicamentoModel: Model<VarianteMedicamento>,
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
  ) {}

  async generarNumeroOrden(): Promise<string> {
    const counter = await this.counterModel.findOneAndUpdate(
      { name: 'orden' },
      { $inc: { value: 1 } },
      { new: true, upsert: true },
    );

    return counter.value.toString().padStart(5, '0'); // Asegura que tenga 5 dígitos con ceros
  }

  async obtenerCompras() {
    return this.compraModel
      .find()
      .populate('cliente doctor')

      .populate({
        path: 'medicamentos.id',
        select: 'principio_activo marca',
        populate: { path: 'principio_activo', select: 'principio_activo' },
      });
  }

  async obtenerComprasPorCliente(clienteId: string) {
    const comprasAgrupadas = await this.compraModel.aggregate([
      { $match: { cliente: new Types.ObjectId(clienteId) } }, // Filtra por cliente
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          compras: { $push: '$$ROOT' }, // Guarda todas las compras de ese mes/año
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: '$_id.month' },
              '/',
              { $toString: '$_id.year' },
            ],
          },
          compras: 1,
        },
      },
      { $sort: { date: -1 } }, // Ordena desde el mes más reciente al más antiguo
    ]);

    for (const grupo of comprasAgrupadas) {
      grupo.compras = await this.compraModel.populate(grupo.compras, [
        { path: 'doctor', model: 'Usuario', select: 'nombre_apellido cedula' },

        {
          path: 'medicamentos.id',
          model: 'VarianteMedicamento',
          select: 'principio_activo marca',
          populate: {
            path: 'principio_activo',
            model: 'Medicamento',
            select: 'principio_activo',
          },
        },
      ]);
    }

    return comprasAgrupadas;
  }

  async obtenerCompraPorNumeroDeOrden(numero_orden: string) {
    return this.compraModel
      .findOne({ numero_orden })
      .populate('cliente doctor')

      .populate({
        path: 'medicamentos.id',

        populate: { path: 'principio_activo' },
      });
  }

  async crearCompra(dto: any): Promise<Compra> {
    // Buscar o crear cliente
    let clienteExistente = await this.clienteModel.findOne({
      cedula: dto.cliente.cedula,
    });

    if (clienteExistente) {
      // Actualizar datos del cliente si han cambiado
      await this.clienteModel.updateOne(
        { cedula: dto.cliente.cedula },
        dto.cliente,
      );
    } else {
      // Crear nuevo cliente
      clienteExistente = await this.clienteModel.create(dto.cliente);
    }

    // Validar si puede comprar este medicamento según su tipoCliente y medicamentos
    const puedeComprar = await this.validarCompra(
      clienteExistente._id,
      dto.tipoCliente,
      dto.medicamentos,
    );

    if (!puedeComprar) {
      throw new Error('No puedes comprar más de este medicamento este mes.');
    }
    const numeroOrden = await this.generarNumeroOrden();
    // Crear la compra con el cliente asociado
    const nuevaCompra = new this.compraModel({
      ...dto,
      medicamentos: dto.medicamentos.map((e) => {
        return {
          id: new Types.ObjectId(e.id),
          cantidad: e.cantidad,
        };
      }),
      cliente: clienteExistente._id, // Asegurar que sea ObjectId
      numero_orden: numeroOrden,
    });

    return nuevaCompra.save();
  }

  async validarCompra(
    clienteId: Types.ObjectId,
    tipoCliente: TipoCliente,
    medicamentos: { id: Types.ObjectId; cantidad: number }[],
  ): Promise<boolean> {
    // Buscamos los principios activos de los medicamentos que se quieren comprar
    const variantes = await this.varianteMedicamentoModel
      .find({ _id: { $in: medicamentos.map((m) => m.id) } })
      .populate('principio_activo');

    // Extraemos el principio activo y su límite
    const limites = new Map();
    for (const variante of variantes) {
      if (!limites.has(variante.principio_activo['principio_activo'])) {
        limites.set(
          variante.principio_activo['principio_activo'],
          variante.principio_activo['limite'],
        );
      }
    }

    // Fecha de inicio y fin del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    // Buscamos todas las compras del cliente en el mes actual
    const compras = await this.compraModel.aggregate([
      {
        $match: {
          cliente: clienteId,
          tipoCliente: tipoCliente,
          createdAt: { $gte: inicioMes, $lte: finMes },
        },
      },
      { $unwind: '$medicamentos' },
      {
        $lookup: {
          from: 'variantemedicamentos',
          localField: 'medicamentos.id',
          foreignField: '_id',
          as: 'varianteInfo',
        },
      },
      { $unwind: '$varianteInfo' },
      {
        $lookup: {
          from: 'medicamentos',
          localField: 'varianteInfo.principio_activo',
          foreignField: '_id',
          as: 'medicamentoInfo',
        },
      },
      { $unwind: '$medicamentoInfo' },
      {
        $group: {
          _id: '$medicamentoInfo.principio_activo',
          totalComprado: { $sum: '$medicamentos.cantidad' }, // Sumamos las cantidades
        },
      },
    ]);

    // Sumamos también la cantidad de medicamentos en la compra actual
    const compraActual = new Map();
    for (const med of medicamentos) {
      const variante = variantes.find((v) => v._id.equals(med.id));
      if (!variante) continue;

      const principioActivo = variante.principio_activo['principio_activo'];
      compraActual.set(
        principioActivo,
        (compraActual.get(principioActivo) || 0) + med.cantidad,
      );
    }

    // Validamos si se supera el límite mensual
    for (const [principioActivo, cantidad] of compraActual.entries()) {
      const limite = limites.get(principioActivo) || 0;
      const comprado =
        compras.find((c) => c._id === principioActivo)?.totalComprado || 0;

      if (comprado + cantidad > limite) {
        return false; // No puede comprar más de este medicamento este mes
      }
    }

    return true;
  }

  async validarCompraPorCedula(
    cedula: string,
    varianteId: string,
    cantidadDeseada: number,
    tipoCliente: TipoCliente,
  ): Promise<number> {
    // 1. Buscar el cliente por su cédula
    const cliente = await this.clienteModel.findOne({ cedula });
    if (!cliente) {
      throw new NotFoundException(
        `No se encontró un cliente con la cédula ${cedula}`,
      );
    }

    // 2. Obtener la variante y su principio activo
    const variante = await this.varianteMedicamentoModel
      .findById(varianteId)
      .populate('principio_activo');
    if (!variante) {
      throw new NotFoundException(
        `No se encontró la variante de medicamento con ID ${varianteId}`,
      );
    }

    const principioActivo = variante.principio_activo['principio_activo'];
    const limitePermitido = variante.principio_activo['limite'];

    // 3. Determinar el rango de fechas del mes actual
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const finMes = new Date();
    finMes.setMonth(finMes.getMonth() + 1);
    finMes.setDate(0);
    finMes.setHours(23, 59, 59, 999);

    // 4. Consultar todas las compras del cliente en el mes actual para ese principio activo
    const compras = await this.compraModel.aggregate([
      {
        $match: {
          cliente: new Types.ObjectId(cliente._id),
          createdAt: { $gte: inicioMes, $lte: finMes },
          tipoCliente: tipoCliente,
        },
      },
      { $unwind: '$medicamentos' },
      {
        $lookup: {
          from: 'variantemedicamentos',
          localField: 'medicamentos.id',
          foreignField: '_id',
          as: 'varianteInfo',
        },
      },
      { $unwind: '$varianteInfo' },
      {
        $lookup: {
          from: 'medicamentos',
          localField: 'varianteInfo.principio_activo',
          foreignField: '_id',
          as: 'medicamentoInfo',
        },
      },
      { $unwind: '$medicamentoInfo' },
      {
        $group: {
          _id: '$medicamentoInfo.principio_activo',
          totalComprado: { $sum: '$medicamentos.cantidad' }, // Sumamos la cantidad comprada
        },
      },
    ]);

    // 5. Verificar si el cliente ya alcanzó su límite
    const compraExistente = compras.find(
      (c) => c._id.toString() === principioActivo.toString(),
    );
    const cantidadActual = compraExistente ? compraExistente.totalComprado : 0;
    return limitePermitido - cantidadActual; // Puede comprar
  }

  async obtenerMedicamentosMasComprados(clienteId: string) {
    const resultado = await this.compraModel.aggregate([
      { $match: { cliente: new Types.ObjectId(clienteId) } }, // Filtrar por cliente

      { $unwind: '$medicamentos' }, // Descomponer el array de medicamentos

      {
        $group: {
          _id: '$medicamentos.id',
          cantidadTotal: { $sum: '$medicamentos.cantidad' }, // Sumar la cantidad de cada medicamento
        },
      },

      { $sort: { cantidadTotal: -1 } }, // Ordenar de mayor a menor

      // Lookup para obtener la variante del medicamento
      {
        $lookup: {
          from: 'variantemedicamentos', // Colección de variantes
          localField: '_id',
          foreignField: '_id',
          as: 'variante',
        },
      },
      { $unwind: '$variante' },

      // Lookup para obtener el medicamento principal y su principio activo
      {
        $lookup: {
          from: 'medicamentos', // Colección principal de medicamentos
          localField: 'variante.principio_activo',
          foreignField: '_id',
          as: 'medicamento',
        },
      },
      { $unwind: '$medicamento' },
      {
        $group: {
          _id: '$medicamento.principio_activo',
          cantidadTotal: { $sum: '$cantidadTotal' }, // Sumar correctamente todas las variantes
        },
      },

      { $sort: { cantidadTotal: -1 } },
      {
        $project: {
          _id: 0, // No mostrar el _id de MongoDB
          principioActivo: '$_id', // Mostrar el principio activo correctamente
          cantidadTotal: 1,
        },
      },
    ]);

    return resultado;
  }
}
