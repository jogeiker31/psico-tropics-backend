// dtos/login.dto.ts
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  usuario: string;

  @IsNotEmpty()
  password: string;
}
