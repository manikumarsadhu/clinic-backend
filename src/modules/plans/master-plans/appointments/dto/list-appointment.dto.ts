import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AppointmentStatus } from '../enums/appointment-status.enum';

export class ListAppointmentDto {

    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @IsOptional()
    @IsDateString()
    appointment_date?: Date;

}
