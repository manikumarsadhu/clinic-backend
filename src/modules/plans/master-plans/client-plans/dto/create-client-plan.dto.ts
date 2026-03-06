import {
    IsUUID,
    IsNumber,
    IsOptional,
    IsEnum,
} from 'class-validator';
import { PaymentStatus } from '../client-plan.entity';

export class CreateClientPlanDto {

    @IsUUID()
    client_id: string;

    // @IsUUID()
    // clinic_id: string;

    @IsUUID()
    master_plan_id: string;

    @IsNumber()
    subscribed_amount: number;

    @IsOptional()
    @IsNumber()
    discount_applied?: number;

    @IsOptional()
    @IsEnum(PaymentStatus)
    payment_status?: PaymentStatus;
}
