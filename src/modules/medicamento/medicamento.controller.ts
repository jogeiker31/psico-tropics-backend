import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MedicamentoService } from './medicamento.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import {
  CreateMedicamentoDto,
  CreateMedicamentoVarianteDto,
  EditarMedicamentoVarianteDto,
} from './dto/medicamento.dto';
import { RecordService } from '../record/record.service';

@Controller('medicamento')
export class MedicamentoController {
  constructor(
    private medicamentoService: MedicamentoService,
    private recordService: RecordService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  create(@Body(new ValidationPipe()) data: CreateMedicamentoDto, @Req() req) {
    return this.medicamentoService
      .create(data)
      .then((medicamento) => {
        this.recordService.create({
          user: req.user._id,
          action: `Creo el medicamento \"${medicamento.principio_activo}\"`,
        });
        return medicamento;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Post('variante')
  @UseGuards(JwtAuthGuard)
  createVariante(
    @Body(new ValidationPipe()) data: CreateMedicamentoVarianteDto,

    @Req() req,
  ) {
    return this.medicamentoService
      .createVariante(data)
      .then(async (data) => {
        await data.populate('principio_activo');
        const medicamento = data['principio_activo'] as any;
        this.recordService.create({
          user: req.user._id,
          action: `Creo la variante \"${data.marca}\" del medicamento "${medicamento.principio_activo}"`,
        });
        return data;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }
  @Patch('variante/:id')
  @UseGuards(JwtAuthGuard)
  editarVariante(
    @Body(new ValidationPipe()) data: EditarMedicamentoVarianteDto,
    @Param('id') id,

    @Req() req,
  ) {
    return this.medicamentoService
      .editarVariante(id, data)
      .then(async (data) => {
        await data.populate('principio_activo');
        const medicamento = data['principio_activo'] as any;
        this.recordService.create({
          user: req.user._id,
          action: `Edito la variante \"${data.marca}\" del medicamento "${medicamento.principio_activo}"`,
        });
        return data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  @Delete('variante/:id')
  @UseGuards(JwtAuthGuard)
  eliminarVariante(
    @Param('id') id,

    @Req() req,
  ) {
    return this.medicamentoService
      .eliminarVariante(id)
      .then(async (data) => {
        await data.populate('principio_activo');
        const medicamento = data['principio_activo'] as any;
        this.recordService.create({
          user: req.user._id,
          action: `Elimino la variante \"${data.marca}\" del medicamento "${medicamento.principio_activo}"`,
        });
        return data;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  obtenerMedicamentos(@Req() req) {
    return this.medicamentoService
      .obtenerMedicamentos()
      .then(async (data) => {
        return data;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Get('variantes')
  @UseGuards(JwtAuthGuard)
  obtenerMedicamentosConVariantes(@Req() req) {
    return this.medicamentoService
      .obtenerMedicamentosConVariantes()
      .then(async (data) => {
        return data;
      })
      .catch((error) => {
        throw new BadRequestException([error]);
      });
  }

  @Get('buscar')
  async buscarVariantes(@Query('query') query: string) {
    return this.medicamentoService.buscarVariantes(query);
  }
}
