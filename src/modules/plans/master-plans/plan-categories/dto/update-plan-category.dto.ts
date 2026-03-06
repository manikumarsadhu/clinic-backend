import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanCategoryDto } from './create-plan-category.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanCategoryDto extends PartialType(
    CreatePlanCategoryDto,
) {

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}