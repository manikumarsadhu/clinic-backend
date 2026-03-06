import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsArray,
} from 'class-validator';
import { AgeGroup, PlanType } from '../master-plan.entity';

export class CreateMasterPlanDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    category_id: string;

    @IsEnum(AgeGroup)
    age_group: AgeGroup;

    @IsEnum(PlanType)
    plan_type: PlanType;

    @IsNumber()
    base_price: number;

    @IsOptional()
    @IsNumber()
    discount_percentage?: number;

    @IsOptional()
    @IsNumber()
    max_discount_allowed?: number;

    @IsOptional()
    @IsString()
    logo_url?: string;

    @IsOptional()
    @IsArray()
    media?: string[];

    @IsOptional()
    is_upgradeable?: boolean;
}