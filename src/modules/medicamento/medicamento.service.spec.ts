import { Test, TestingModule } from '@nestjs/testing';
import { MedicamentoService } from './medicamento.service';

describe('MedicamentoService', () => {
  let service: MedicamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicamentoService],
    }).compile();

    service = module.get<MedicamentoService>(MedicamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
