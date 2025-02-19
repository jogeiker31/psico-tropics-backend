import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MedicamentoService } from './medicamento.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import {
  CreateMedicamentoDto,
  CreateMedicamentoVarianteDto,
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
}
