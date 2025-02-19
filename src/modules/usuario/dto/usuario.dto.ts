import {
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../schemas/usuario.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre_apellido: string;

  @IsString()
  @IsNotEmpty()
  cedula: string;

  @IsString()
  @IsNotEmpty()
  codigo_farmaceutico: string;

  @IsString()
  @IsNotEmpty()
  codigo_colaborador: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'role debe ser ADMINISTRADOR o DOCTOR' })
  role?: UserRole;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre_apellido?: string;
  @IsOptional()
  @IsString()
  cedula?: string;
  @IsOptional()
  @IsString()
  codigo_farmaceutico?: string;
  @IsOptional()
  @IsString()
  codigo_colaborador?: string;

  @IsOptional()
  @IsString()
  nombre_usuario?: string;
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
