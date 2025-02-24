import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from 'src/jwt-auth.guard';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @UseGuards(JwtAuthGuard) // Protege este endpoint
  @Get('')
  getMetrics() {
    return this.metricsService.getmetrics();
  }
  @UseGuards(JwtAuthGuard) // Protege este endpoint
  @Get('by-month/:date')
  getMetricsByMonth(@Param('date') date) {
    const newDate = new Date(date);
    return this.metricsService.getMedicamentosVendidosEnMes(
      newDate.getMonth() + 1,
      newDate.getFullYear(),
    );
  }
}
