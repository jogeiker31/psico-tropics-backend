import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsuarioService } from './modules/usuario/usuario.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private usuarioService: UsuarioService) {}
  getHello(): string {
    return 'Hello World!';
  }
  async onModuleInit() {
    console.log('🔥 El servidor NestJS ha iniciado correctamente.');

    await this.ejecutarTareaAutomatica();
  }

  private async ejecutarTareaAutomatica() {
    await this.usuarioService.crearAdministrador();
  }
}
