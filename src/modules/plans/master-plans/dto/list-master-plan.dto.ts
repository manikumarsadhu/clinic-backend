import { IsOptional, IsEnum, IsBooleanString, IsNumberString, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AgeGroup } from '../master-plan.entity';

export class ListMasterPlanDto {
    @IsOptional()
    @IsEnum(AgeGroup)
    age_group?: AgeGroup;

    @IsOptional()
    @IsString()
    category_id?: string;

    @IsOptional()
    @IsBooleanString()
    is_active?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumberString()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumberString()
    limit?: number;
}