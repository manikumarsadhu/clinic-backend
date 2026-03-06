import { IsOptional, IsNumberString, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListPlanCategoryDto {

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