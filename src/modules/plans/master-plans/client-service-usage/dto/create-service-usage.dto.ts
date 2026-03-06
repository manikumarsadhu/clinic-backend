import { IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateServiceUsageDto {

    @IsUUID()
    client_id: string;

    @IsUUID()
    master_service_id: string;

    @IsOptional()
    @IsNumber()
    discount_applied?: number;
}
