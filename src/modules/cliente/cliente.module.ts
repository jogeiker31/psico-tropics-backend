import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cliente, ClienteSchema } from './schemas/cliente.schema';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cliente.name, schema: ClienteSchema }]),
  ],
  exports: [MongooseModule, ClienteService],
  providers: [ClienteService],
  controllers: [ClienteController],
})
export class ClienteModule {}
