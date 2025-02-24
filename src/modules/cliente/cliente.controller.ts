import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClienteService } from './cliente.service';

@Controller('cliente')
export class ClienteController {
  constructor(private clienteService: ClienteService) {}

  @Get('cedula/:cedula')
  async buscarClientePorCedula(@Param('cedula') cedula) {
    return await this.clienteService.buscarClientePorCedula(cedula);
  }
  @Get('buscar')
  async buscarClientes(@Query('query') query?: string) {
    return await this.clienteService.buscarClientes(query);
  }
  @Get('id/:id')
  async buscarClientesPorId (@Param('id') id: string) {
    return await this.clienteService.buscarClientePorId(id);
  }
}
