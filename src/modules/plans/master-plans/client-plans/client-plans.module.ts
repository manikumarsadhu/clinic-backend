import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClientPlan } from './client-plan.entity';
import { ClientPlanService as ClientPlanServiceEntity } from '../client-plan-services/client-plan-service.entity';
import { MasterPlan } from '../master-plan.entity';
import { MasterPlanService as MasterPlanServiceEntity } from '../master-plan-services/master-plan-service.entity';
import { User } from 'src/users/entities/user.entity';

import { ClientPlanController } from './client-plan.controller';
import { ClientPlanService } from './client-plan.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientPlan,
      ClientPlanServiceEntity,
      MasterPlan,
      MasterPlanServiceEntity,
      User,
    ]),
  ],
  controllers: [ClientPlanController],
  providers: [ClientPlanService],
})
export class ClientPlansModule {}
