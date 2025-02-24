import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Medicamento } from './schema/medicamento.schema';
import { Model, Types } from 'mongoose';
import { VarianteMedicamento } from './schema/varianteMedicamento.schema';

@Injectable()
export class MedicamentoService {
  constructor(
    @InjectModel(Medicamento.name) private medicamentoModel: Model<Medicamento>,
    @InjectModel(VarianteMedicamento.name)
    private varianteMedicamento: Model<VarianteMedicamento>,
  ) {}

  async create(medicamento) {
    const data = new this.medicamentoModel(medicamento);
    return await data.save();
  }
  async createVariante(variante) {
    const data = new this.varianteMedicamento({
      ...variante,
      principio_activo: new Types.ObjectId(variante.principio_activo),
    });
    return await data.save();
  }
  async editarVariante(id, variante) {
    const data = await this.varianteMedicamento.findByIdAndUpdate(id, variante);
    return data;
  }
  async editarMedicamento(id, medicamento) {
    const data = await this.medicamentoModel.findByIdAndUpdate(id, medicamento);
    return data;
  }

  async eliminarVariante(id) {
    const data = await this.varianteMedicamento.findByIdAndUpdate(id, {
      deleted: true,
    });
    return data;
  }
  async eliminarMedicamento(id) {
    const data = await this.medicamentoModel.findByIdAndUpdate(id, [
      {
        $set: {
          deleted: true,
          principio_activo: {
            $concat: [
              '___',
              '$principio_activo',
              new Date().getMilliseconds().toString().substring(-3),
            ],
          }, // Agregar el prefijo
        },
      },
    ]);

    return data;
  }

  async obtenerVariantesDemedicamento(id: string) {
    const data = await this.varianteMedicamento.find({
      principio_activo: new Types.ObjectId(id ),
      deleted: false,
    });
    return data;
  }
  async obtenerMedicamentos() {
    const data = await this.medicamentoModel.find({ deleted: false });
    return data;
  }

  async obtenerMedicamentosConVariantes() {
    return this.medicamentoModel.aggregate([
      {
        $lookup: {
          from: 'variantemedicamentos', // Nombre de la colección de variantes
          let: { medicamentoId: '$_id' }, // Definir variable para el ID del medicamento
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$principio_activo', '$$medicamentoId'] }, // Relacionar con medicamento
                    { $ne: ['$deleted', true] }, // Excluir variantes eliminadas
                  ],
                },
              },
            },
          ],
          as: 'variantes',
        },
      },
      {
        $sort: { principio_activo: 1 },
      },
    ]);
  }

  async buscarVariantes(query: string) {
    const regex = new RegExp(query, 'i'); // Búsqueda insensible a mayúsculas/minúsculas

    // Buscar los medicamentos cuyo principio activo coincida con la query
    const medicamentos = await this.medicamentoModel.find({
      principio_activo: regex,
    });

    // Obtener sus IDs para usarlos en la búsqueda de variantes
    const medicamentoIds = medicamentos.map((med) => med._id);

    // Buscar en VarianteMedicamento donde:
    // - La marca, presentación o descripción coincidan con la query
    // - O el principio_activo (referenciado a Medicamento) esté en la lista de medicamentos encontrados
    const variantes = await this.varianteMedicamento
      .find({
        $or: [
          { marca: regex },
          { presentacion: regex },
          { descripcion: regex },
          { principio_activo: { $in: medicamentoIds } }, // Coincidencia por principio activo
        ],
        deleted: false, // Excluye variantes eliminadas
      })
      .populate('principio_activo'); // Popula la referencia de medicamento

    return variantes; // Solo retorna variantes
  }
}
