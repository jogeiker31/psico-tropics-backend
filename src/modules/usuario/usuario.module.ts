import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordModule } from '../record/record.module';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema';
import { JwtStrategy } from 'src/jwt.strategy';

@Module({
  controllers: [UsuarioController],
  imports: [
    RecordModule,
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
  ],
  providers: [UsuarioService, JwtStrategy],
  exports: [MongooseModule, UsuarioService],
})
export class UsuarioModule {}
