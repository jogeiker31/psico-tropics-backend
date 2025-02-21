import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateMedicamentoDto {
  @IsString()
  @IsNotEmpty()
  principio_activo: string;

  @IsNumber()
  @IsNotEmpty()
  limite: number;
}

export class CreateMedicamentoVarianteDto {
  @IsMongoId()
  @IsNotEmpty()
  foto: string;

  @IsMongoId()
  @IsNotEmpty()
  principio_activo: Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  presentacion: string;

  @IsString()
  @IsNotEmpty()
  numero_tabletas: string;

  @IsBoolean()
  @IsOptional()
  importado?: boolean;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  documento_requerido?: string;
}
export class EditarMedicamentoVarianteDto {
  @IsMongoId()
  @IsOptional()
  foto?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  presentacion?: string;

  @IsString()
  @IsOptional()
  numero_tabletas?: string;

  @IsBoolean()
  @IsOptional()
  importado?: boolean;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  documento_requerido?: string;
}
