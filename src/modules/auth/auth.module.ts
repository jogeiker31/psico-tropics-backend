import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/jwt.strategy';
import { RecordModule } from 'src/modules/record/record.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    RecordModule,
    JwtModule.register({
      secret: 'secretKey', // Cambia esto a tu clave secreta
    }),

    UsuarioModule
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
