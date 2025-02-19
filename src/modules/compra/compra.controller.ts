import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CompraService } from './compra.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';
import { CompraDto } from './dto/compra.dto';
import { RecordService } from '../record/record.service';

@Controller('compra')
export class CompraController {
  constructor(
    private compraService: CompraService,
    private recordService: RecordService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(new ValidationPipe()) data: CompraDto, @Req() req) {
    console.log(data);
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
}
