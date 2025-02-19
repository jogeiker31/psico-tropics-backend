import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
