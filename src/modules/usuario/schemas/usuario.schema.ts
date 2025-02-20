import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  DOCTOR = 'DOCTOR',
}
@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true })
  nombre_apellido: string;

  @Prop({ required: true, unique: true })
  cedula: string;

  @Prop({ required: true, unique: true })
  codigo_farmaceutico: string;

  @Prop({ required: true, unique: true })
  codigo_colaborador: string;
  
  @Prop({ required: true, unique: true })
  nombre_usuario: string;

  @Prop({ default: UserRole.DOCTOR })
  role: UserRole;

  
  @Prop({ default: false })
  deleted: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
