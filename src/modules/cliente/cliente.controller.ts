import { Controller, Get, Param } from '@nestjs/common';
import { ClienteService } from './cliente.service';

@Controller('cliente')
export class ClienteController {
  constructor(private clienteService: ClienteService) {}

  @Get(':cedula')
  async buscarClientePorCedula(@Param('cedula') cedula) {
    return await this.clienteService.buscarClientePorCedula(cedula);
  }
  
}
