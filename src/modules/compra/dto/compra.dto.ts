import {
  IsMongoId,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

import { TipoCliente } from '../schemas/compra.schema';
import { Type } from 'class-transformer';

export class ClienteDto {
  @IsString()
  @IsNotEmpty()
  cedula: string; // Identificador único del cliente

  @IsString()
  @IsOptional()
  nombre_apellido?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}

class MedicamentoCompraDto {
  @IsMongoId()
  id: string; // ID del medicamento

  @IsInt()
  @Min(1)
  cantidad: number; // Cantidad a comprar
}
export class CompraDto {
  @IsNotEmpty()
  cliente: ClienteDto; // Ahora recibe un objeto con los datos del cliente

  @IsEnum(TipoCliente)
  tipoCliente: TipoCliente;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentoCompraDto)
  medicamentos: MedicamentoCompraDto[];
}
