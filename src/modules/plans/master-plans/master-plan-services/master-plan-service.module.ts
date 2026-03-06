import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterPlanServiceController } from './master-plan-service.controller';
import { MasterPlanServiceService } from './master-plan-service.service';
import { MasterPlanService } from './master-plan-service.entity';
import { MasterPlan } from '../master-plan.entity';
import { MasterService } from '../services/master-services/master-service.entity';

@Module({
    imports: [
        // the mapping entity plus the two sides of the relation are required so
        // the service can perform lookups/validation when creating a mapping.
        TypeOrmModule.forFeature([MasterPlanService, MasterPlan, MasterService]),
    ],
    controllers: [MasterPlanServiceController],
    providers: [MasterPlanServiceService],
    exports: [MasterPlanServiceService],
})
export class MasterPlanServiceModule {}
