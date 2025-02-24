import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Medicamento {
  @Prop({ required: true })
  principio_activo: string;

  @Prop({ required: true })
  limite: number;
  @Prop({ default: false })
  deleted: boolean;
}

export const MedicamentoSchema = SchemaFactory.createForClass(Medicamento);
