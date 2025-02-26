import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole, Usuario } from './schemas/usuario.schema';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
  ) {}

  private generarNombreUsuario(nombre_apellido: string): string {
    const partes = nombre_apellido.trim().split(/\s+/); // Divide por espacios
    const inicial = partes[0].charAt(0).toLowerCase();

    let usuarioBase = '';

    if (partes.length > 1) {
      // Si hay apellido, usar la inicial del nombre + el apellido
      usuarioBase = `${inicial}.${partes[1]}`;
    } else {
      // Si no hay apellido, usar la inicial del nombre + el nombre completo
      usuarioBase = `${inicial}.${partes[0]}`;
    }

    return usuarioBase;
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  async create(data) {
    const { nombre_apellido } = data;

    const ciExist = await this.usuarioModel.exists({ cedula: data.cedula });
    if (ciExist) {
      throw { type: 'custom', message: 'Existe un doctor con esta cedula' };
    }

    const cfExist = await this.usuarioModel.exists({
      codigo_farmaceutico: data.codigo_farmaceutico,
    });
    const ccExist = await this.usuarioModel.exists({
      codigo_colaborador: data.codigo_colaborador,
    });
    if (cfExist) {
      throw {
        type: 'custom',
        message: 'Existe un doctor con este código de farmaceutico',
      };
    }
    if (ccExist) {
      throw {
        type: 'custom',
        message: 'Existe un doctor con este código de colaborador',
      };
    }
    // Generar el nombre de usuario
    let nombre_usuario = this.generarNombreUsuario(nombre_apellido);

    // Verificar si ya existe en la base de datos
    let existe = await this.usuarioModel.exists({ nombre_usuario });

    // Si existe, agregar un número aleatorio hasta que sea único
    while (existe) {
      const randomNum = Math.floor(1000 + Math.random() * 9000); // Número entre 1000 y 9999
      nombre_usuario = `${this.generarNombreUsuario(nombre_apellido)}${randomNum}`;
      existe = await this.usuarioModel.exists({ nombre_usuario });
    }

    const user = new this.usuarioModel({
      ...data,
      nombre_usuario,
    });

    return user.save();
  }

  async obtenerUsuarioPorId(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }
  async obtenerTodosLosUsuarios(): Promise<Usuario[]> {
    return this.usuarioModel.find({ deleted: false }).exec();
  }
  async obtenerPorNombreUsuario(nombre_usuario): Promise<Usuario> {
    return this.usuarioModel.findOne({ nombre_usuario }).exec();
  }
  async actualizarUsuario(id: string, data: UpdateUserDto): Promise<Usuario> {
    const ciExist = await this.usuarioModel.exists({
      _id: { $ne: id },
      cedula: data.cedula,
    });
    if (ciExist) {
      throw { type: 'custom', message: 'Existe un doctor con esta cedula' };
    }

    const cfExist = await this.usuarioModel.exists({
      _id: { $ne: id },
      codigo_farmaceutico: data.codigo_farmaceutico,
    });
    const ccExist = await this.usuarioModel.exists({
      _id: { $ne: id },
      codigo_colaborador: data.codigo_colaborador,
    });
    if (cfExist) {
      throw {
        type: 'custom',
        message: 'Existe un doctor con este código de farmaceutico',
      };
    }
    if (ccExist) {
      throw {
        type: 'custom',
        message: 'Existe un doctor con este código de colaborador',
      };
    }

    const usuarioActualizado = await this.usuarioModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!usuarioActualizado) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuarioActualizado;
  }

  async eliminarUsuario(id: string): Promise<Usuario> {
    const usuario = await this.usuarioModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Modificar los valores únicos agregando "_xxx"

    const string = new Date().getMilliseconds().toString().substring(-4);

    usuario.cedula += '_xxx' + string;
    usuario.codigo_farmaceutico += '_xxx'  + string;
    usuario.codigo_colaborador += '_xxx'  + string;
    usuario.nombre_usuario += '_xxx'  + string;
    usuario.deleted = true;

    const resultado = await usuario.save();
    return resultado;
  }

  async crearAdministrador() {
    const existe = await this.usuarioModel.exists({
      nombre_usuario: 'administrador',
    });

    if (!existe) {
      const administrador = new this.usuarioModel({
        nombre_apellido: 'Administrador',
        nombre_usuario: 'administrador',
        codigo_colaborador: 'admin*2025',
        codigo_farmaceutico: '00000',
        cedula: 'x000000',
        role: UserRole.ADMINISTRADOR,
      });
      await administrador.save();
      return { mensaje: 'Administrador Creado' };
    } else {
      return { mensaje: 'Administrador existe' };
    }
  }
}
