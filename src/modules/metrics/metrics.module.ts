import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { ClienteModule } from '../cliente/cliente.module';
import { CompraModule } from '../compra/compra.module';
import { MedicamentoModule } from '../medicamento/medicamento.module';

@Module({
  imports: [ClienteModule, CompraModule, MedicamentoModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
