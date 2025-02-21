import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class VarianteMedicamento {
  @Prop({ required: true, ref: 'Medicamento' })
  principio_activo: Types.ObjectId;

  @Prop({ required: true, ref: 'CustomFile' })
  foto: Types.ObjectId;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  presentacion: string;

  @Prop({ required: true })
  numero_tabletas: string;

  @Prop({ default: false })
  importado: boolean;

  @Prop({})
  descripcion: string;
  @Prop({})
  documento_requerido: string;
  @Prop({default:false})
  deleted: boolean;
}

export const VarianteMedicamentoSchema = SchemaFactory.createForClass(VarianteMedicamento);
