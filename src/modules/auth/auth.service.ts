import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { RecordService } from 'src/modules/record/record.service';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class AuthService {
  constructor(
    private usuarioService: UsuarioService,
    private recordService: RecordService,
    private jwtService: JwtService,
  ) {}

  async validateUser(usuario: string, password: string): Promise<any> {
    const user = await this.usuarioService.obtenerPorNombreUsuario(usuario); // Asegúrate de tener este método en UserService
    if (user && user.codigo_colaborador == password) {
      return user;
    }
    throw new UnauthorizedException(['invalid_credentials']); // Lanzar excepción si las credenciales son incorrectas
  }

  async login(usuario: string, password: string) {
    const user = await this.validateUser(usuario, password);
    const payload = { nombre_usuario: user.nombre_usuario, sub: user._id };
    this.recordService.create({
      user: user._id,
      action: 'Ingreso al sistema',
    });
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
