import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { RecordModule } from './modules/record/record.module';
import { FilesModule } from './modules/files/files.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { DatabaseModule } from './modules/database/database.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { MedicamentoModule } from './modules/medicamento/medicamento.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/psico-tropics'),

    AuthModule,

    RecordModule,
    FilesModule,

    MetricsModule,
    DatabaseModule,
    UsuarioModule,
    ClienteModule,
    MedicamentoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
