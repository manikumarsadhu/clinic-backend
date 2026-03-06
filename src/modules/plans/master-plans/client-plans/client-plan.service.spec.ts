import { Test, TestingModule } from '@nestjs/testing';
import { ClientPlanService } from './client-plan.service';

describe('ClientPlanService', () => {
  let service: ClientPlanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientPlanService],
    }).compile();

    service = module.get<ClientPlanService>(ClientPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
