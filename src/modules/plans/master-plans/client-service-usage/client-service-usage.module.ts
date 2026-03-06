import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceUsageController } from './service-usage.controller';
import { ServiceUsageService } from './service-usage.service';

import { ClientPlan } from '../client-plans/client-plan.entity';
import { ClientPlanService as ClientPlanServiceEntity } from '../client-plan-services/client-plan-service.entity';
import { ClientServiceTransaction } from './client-service-transaction.entity';
import { MasterService } from '../services/master-services/master-service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientPlan,
      ClientPlanServiceEntity,
      ClientServiceTransaction,
      MasterService,
    ]),
  ],
  controllers: [ServiceUsageController],
  providers: [ServiceUsageService],
})
export class ClientServiceUsageModule {}
