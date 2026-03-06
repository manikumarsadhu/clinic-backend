import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { AppointmentStatus } from './enums/appointment-status.enum';

@Entity('appointments')
export class Appointment extends BaseEntity {

    @Column('uuid')
    clinic_id: string;

    @Column('uuid')
    client_id: string;

    @Column('uuid')
    doctor_id: string;

    @Column('date')
    appointment_date: Date;

    @Column('time')
    start_time: string;

    @Column('time')
    end_time: string;

    @Column('uuid', { nullable: true })
    service_id: string;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.BOOKED,
    })
    status: AppointmentStatus;

    @Column({ nullable: true })
    notes: string;

    @Column('uuid')
    created_by: string;
}
