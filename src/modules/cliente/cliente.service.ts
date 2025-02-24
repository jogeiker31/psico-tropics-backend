import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cliente } from './schemas/cliente.schema';
import { Model } from 'mongoose';

@Injectable()
export class ClienteService {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<Cliente>,
  ) {}

  async buscarClientePorCedula(cedula: string) {
    const existe = await this.clienteModel.findOne({ cedula });
    if (existe) {
      return existe;
    } else {
      const nuevoCliente = await new this.clienteModel({ cedula }).save();
      return nuevoCliente;
    }
  }
  async buscarClientePorId(id: string) {
    return await this.clienteModel.findById(id);
  }

  async buscarClientes(query?: string) {
    query = query || '';
    return await this.clienteModel.find({
      $or: [
        { cedula: { $regex: query, $options: 'i' } },
        { nombre_apellido: { $regex: query, $options: 'i' } },
        { direccion: { $regex: query, $options: 'i' } },
        { telefono: { $regex: query, $options: 'i' } },
      ],
    });
  }
}
