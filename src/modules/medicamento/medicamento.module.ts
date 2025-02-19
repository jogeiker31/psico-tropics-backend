import { Module } from '@nestjs/common';
import { MedicamentoService } from './medicamento.service';
import { MedicamentoController } from './medicamento.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Medicamento, MedicamentoSchema } from './schema/medicamento.schema';
import {
  VarianteMedicamento,
  VarianteMedicamentoSchema,
} from './schema/varianteMedicamento.schema';
import { RecordModule } from '../record/record.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medicamento.name, schema: MedicamentoSchema },
      { name: VarianteMedicamento.name, schema: VarianteMedicamentoSchema },
    ]),
    RecordModule
  ],
  providers: [MedicamentoService],
  controllers: [MedicamentoController],
  exports: [MongooseModule],
})
export class MedicamentoModule {}
