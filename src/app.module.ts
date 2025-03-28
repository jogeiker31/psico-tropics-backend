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
import { CompraModule } from './modules/compra/compra.module';
var databaseurldev = "mongodb://localhost/psico-tropics"
var databaseurlqa = "mongodb://mongo:wTzqrSMYbxsSOAcXvFJgxesKmLEzOtST@mainline.proxy.rlwy.net:19525"

@Module({
  imports: [
    MongooseModule.forRoot(databaseurldev),

    AuthModule,

    RecordModule,
    FilesModule,

    MetricsModule,
    DatabaseModule,
    UsuarioModule,
    ClienteModule,
    MedicamentoModule,
    CompraModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
