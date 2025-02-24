import { Module } from '@nestjs/common';
import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Compra, CompraSchema } from './schemas/compra.schema';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { MedicamentoModule } from '../medicamento/medicamento.module';
import { ClienteModule } from '../cliente/cliente.module';
import { RecordModule } from '../record/record.module';

@Module({
  controllers: [CompraController],
  imports: [
    MongooseModule.forFeature([
      {
        name: Compra.name,
        schema: CompraSchema,
      },
      {
        name: Counter.name,
        schema: CounterSchema,
      },
    ]),
    MedicamentoModule,
    ClienteModule,
    RecordModule
  ],
  providers: [CompraService],
  exports:[MongooseModule]
})
export class CompraModule {}
