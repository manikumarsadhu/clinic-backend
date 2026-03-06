import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterPlan } from './master-plan.entity';
import { PlanCategory } from './plan-categories/plan-category.entity';
import { MasterPlanService as MasterPlanServiceEntity } from './master-plan-services/master-plan-service.entity';

import { MasterPlanController } from './master-plan.controller';
import { MasterPlanService } from './master-plan.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MasterPlan, PlanCategory, MasterPlanServiceEntity]),
  ],
  controllers: [MasterPlanController],
  providers: [MasterPlanService],
})
export class MasterPlanModule {}
