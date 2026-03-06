import {
    IsUUID,
    IsNumber,
    IsOptional,
    IsBoolean,
} from 'class-validator';

export class CreateMasterPlanServiceDto {

    @IsUUID()
    master_plan_id: string;

    @IsUUID()
    master_service_id: string;

    @IsOptional()
    @IsNumber()
    included_sessions_count?: number;

    @IsOptional()
    @IsBoolean()
    included_free?: boolean;

    @IsOptional()
    @IsNumber()
    discounted_price?: number;

    @IsOptional()
    @IsNumber()
    usage_limit?: number;
}