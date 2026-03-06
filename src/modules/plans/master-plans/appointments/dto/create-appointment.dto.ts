import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {

    @IsUUID()
    client_id: string;

    @IsUUID()
    doctor_id: string;

    @IsDateString()
    appointment_date: Date;

    @IsString()
    start_time: string;

    @IsString()
    end_time: string;

    @IsOptional()
    @IsUUID()
    service_id?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
