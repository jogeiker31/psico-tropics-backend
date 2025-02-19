import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearClienteDto {
  @IsNotEmpty({ message: 'El nombre y apellido es obligatorio' })
  @IsString({ message: 'El nombre y apellido debe ser una cadena de texto' })
  nombre_apellido: string;

  @IsNotEmpty({ message: 'La cédula es obligatoria' })
  @IsString({ message: 'La cédula debe ser una cadena de texto' })
  cedula: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;
}


export class EditarClienteDto {
    @IsOptional()
    @IsString({ message: 'El nombre y apellido debe ser una cadena de texto' })
    nombre_apellido?: string;
  
    @IsOptional()
    @IsString({ message: 'La dirección debe ser una cadena de texto' })
    direccion?: string;
  
    @IsOptional()
    @IsString({ message: 'El teléfono debe ser una cadena de texto' })
    telefono?: string;
  }
