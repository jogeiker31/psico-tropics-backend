import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { RecordService } from '../record/record.service';
import { CreateUserDto, UpdateUserDto } from './dto/usuario.dto';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(
    private usuarioService: UsuarioService,
    private recordService: RecordService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body(new ValidationPipe()) data: CreateUserDto, @Req() req) {
    return this.usuarioService
      .create(data)
      .then((usuario) => {
        this.recordService.create({
          user: req.user._id,
          action: `Creo el usuario \"${usuario.nombre_usuario}\"`,
        });
        return usuario;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  editar(
    @Body(new ValidationPipe()) data: UpdateUserDto,
    @Param('id') id,
    @Req() req,
  ) {
    return this.usuarioService
      .actualizarUsuario(id, data)
      .then((usuario) => {
        this.recordService.create({
          user: req.user._id,
          action: `Edito la información del usuario \"${usuario.nombre_usuario}\"`,
        });
        return usuario;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Get(':id')
  obtenerPorId(@Param('id') id, @Req() req) {
    return this.usuarioService
      .obtenerUsuarioPorId(id)
      .then((usuario) => {
        return usuario;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Get('')
  obtenerUsuarios(@Req() req) {
    return this.usuarioService
      .obtenerTodosLosUsuarios()
      .then((usuarios) => {
        return usuarios;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  eliminarUsuario(@Param('id') id, @Req() req) {
    return this.usuarioService
      .eliminarUsuario(id)
      .then((data) => {
        this.recordService.create({
          user: req.user._id,
          action: `Elimino al usuario \"${data.nombre_usuario}\"`,
        });
        return data;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }
}
