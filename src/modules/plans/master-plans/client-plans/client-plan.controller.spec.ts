import { Test, TestingModule } from '@nestjs/testing';
import { ClientPlanController } from './client-plan.controller';

describe('ClientPlanController', () => {
  let controller: ClientPlanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientPlanController],
      providers: [
        {
          provide: 'ClientPlanService',
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ClientPlanController>(ClientPlanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
