import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CompraService } from './compra.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import { CompraDto } from './dto/compra.dto';
import { RecordService } from '../record/record.service';
import { TipoCliente } from './schemas/compra.schema';

@Controller('compra')
export class CompraController {
  constructor(
    private compraService: CompraService,
    private recordService: RecordService,
  ) {}

  @Get('validar')
  async validarCompra(
    @Query('cedula') cedula: string,
    @Query('varianteId') varianteId: string,
    @Query('cantidad') cantidad: number,
    @Query('tipoCliente') tipoCliente: TipoCliente,
  ) {
    if (!cedula || !tipoCliente || !varianteId || !cantidad || cantidad <= 0) {
      throw new BadRequestException(
        'Cédula, varianteId y cantidad son obligatorios y cantidad debe ser mayor a 0.',
      );
    }

    const puedeComprar = await this.compraService.validarCompraPorCedula(
      cedula,
      varianteId,
      Number(cantidad),
      tipoCliente,
    );

    return { puedeComprar };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(new ValidationPipe()) data: CompraDto, @Req() req) {
    return this.compraService
      .crearCompra({ ...data, doctor: req.user._id })
      .then((result) => {
        this.recordService.create({
          user: req.user._id,
          action: `Registro la compra \"${result.numero_orden}\"`,
        });
        return result;
      })
      .catch((error) => {
        throw new BadRequestException([error.toString()]);
      });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  obtenerCompras(@Req() req) {
    return this.compraService
      .obtenerCompras()
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw new BadRequestException([error.toString()]);
      });
  }
  @Get('numero-orden/:numero_orden')
  @UseGuards(JwtAuthGuard)
  obtenerCompraPorNumeroOrden(@Param('numero_orden') numero_orden, @Req() req) {
    return this.compraService
      .obtenerCompraPorNumeroDeOrden(numero_orden)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw new BadRequestException([error.toString()]);
      });
  }
}
