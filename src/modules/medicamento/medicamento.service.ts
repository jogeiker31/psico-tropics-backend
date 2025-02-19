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
  async obtenerMedicamentos() {
    const data = await this.medicamentoModel.find();
    return data;
  }

  async obtenerMedicamentosConVariantes() {
    return this.varianteMedicamento.aggregate([
      {
        $lookup: {
          from: 'medicamentos', // Nombre de la colección de medicamentos en MongoDB
          localField: 'principio_activo',
          foreignField: '_id',
          as: 'medicamento',
        },
      },
      { $unwind: '$medicamento' }, // Desestructura el array de medicamento
      {
        $group: {
          _id: '$medicamento._id',
          principio_activo: { $first: '$medicamento.principio_activo' },
          limite: { $first: '$medicamento.limite' },
          variantes: {
            $push: {
              _id: '$_id',
              marca: '$marca',
              presentacion: '$presentacion',
              numero_tabletas: '$numero_tabletas',
              importado: '$importado',
              descripcion: '$descripcion',
              documento_requerido: '$documento_requerido',
            },
          },
        },
      },
      { $sort: { principio_activo: 1 } }, // Ordena por principio activo
    ]);
  }
}

