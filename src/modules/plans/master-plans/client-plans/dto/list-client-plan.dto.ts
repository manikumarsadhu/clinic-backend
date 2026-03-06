import {
    IsOptional,
    IsEnum,
    IsNumberString,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientPlanStatus } from '../client-plan.entity';

export class ListClientPlanDto {

    @IsOptional()
    @IsEnum(ClientPlanStatus)
    status?: ClientPlanStatus;

    @IsOptional()
    @IsString()
    search?: string; // client name search

    @IsOptional()
    @Type(() => Number)
    @IsNumberString()
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumberString()
    limit?: number;
}
