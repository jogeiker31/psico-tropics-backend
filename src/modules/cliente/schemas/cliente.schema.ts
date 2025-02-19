import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Cliente {
  @Prop({ required: false })
  nombre_apellido: string;

  @Prop({ required: true, unique: true })
  cedula: string;

  @Prop({ required: false })
  direccion: string;

  @Prop({ required: false })
  telefono: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
