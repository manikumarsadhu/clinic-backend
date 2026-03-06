import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanCategory } from './plan-category.entity';
import { PlanCategoryController } from './plan-category.controller';
import { PlanCategoryService } from './plan-category.service';

@Module({
    imports: [TypeOrmModule.forFeature([PlanCategory])],
    controllers: [PlanCategoryController],
    providers: [PlanCategoryService],
    exports: [PlanCategoryService],
})
export class PlanCategoryModule { }
