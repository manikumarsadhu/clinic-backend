import { Module } from '@nestjs/common';
import { MasterServiceController } from './master-service.controller';
import { MasterServiceService } from './master-service.service';
import { MasterService } from './master-service.entity';
import { PlanCategory } from '../../plan-categories/plan-category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([MasterService, PlanCategory]),
    ],
    controllers: [MasterServiceController],
    providers: [MasterServiceService],
})
export class MasterServiceModule { }
