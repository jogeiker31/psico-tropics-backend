// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from './modules/usuario/usuario.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usuarioService: UsuarioService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del encabezado
      secretOrKey: 'secretKey', // Asegúrate de usar la misma clave secreta que en JwtModule
    });
  }

  async validate(payload: any) {
    const user: any = await this.usuarioService.obtenerPorNombreUsuario(
      payload.nombre_usuario,
    ); // Busca el usuario por email

    const { password, ...result } = user.toObject();
    return result; // Devuelve el usuario para que esté disponible en la solicitud
  }
}
