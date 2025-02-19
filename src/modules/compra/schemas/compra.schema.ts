import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
export enum TipoCliente {
  Titular = 'Titular',
  Representante = 'Representante',
  Mascota = 'Mascota',
}
class MedicamentoCompra {
  @Prop({ required: true, ref: 'VarianteMedicamento' })
  id: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  cantidad: number;
}

@Schema({ timestamps: true })
export class Compra {
  @Prop({ required: true, ref: 'Usuario' })
  doctor: Types.ObjectId;

  @Prop({ required: true, ref: 'Cliente' })
  cliente: Types.ObjectId;

  @Prop({ default: TipoCliente.Titular })
  tipoCliente: TipoCliente;

  
  @Prop({ required: true, type: [MedicamentoCompra] })
  medicamentos: MedicamentoCompra[];

  @Prop({ required: true, unique: true })
  numero_orden: string;
}

export const CompraSchema = SchemaFactory.createForClass(Compra);
