import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentDto } from './dto/list-appointment.dto';
import { AppointmentStatus } from './enums/appointment-status.enum';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(Appointment)
        private readonly repo: Repository<Appointment>,
    ) { }

    async create(dto: CreateAppointmentDto, clinicId: string, userId: string) {

        // Prevent doctor time conflict
        const conflict = await this.repo
            .createQueryBuilder('a')
            .where('a.doctor_id = :doctorId', { doctorId: dto.doctor_id })
            .andWhere('a.appointment_date = :date', { date: dto.appointment_date })
            .andWhere('a.status NOT IN (:...blocked)', {
                blocked: ['CANCELLED', 'NO_SHOW'],
            })
            .andWhere(
                `(:start_time < a.end_time AND :end_time > a.start_time)`,
                {
                    start_time: dto.start_time,
                    end_time: dto.end_time,
                },
            )
            .getOne();

        if (conflict) {
            throw new BadRequestException(
                'Doctor already has appointment in this time slot',
            );
        }

        const appointment = this.repo.create({
            ...dto,
            clinic_id: clinicId,
            created_by: userId,
        });

        return this.repo.save(appointment);
    }

    async findAll(clinicId: string, query: ListAppointmentDto) {

        const qb = this.repo.createQueryBuilder('a');

        qb.where('a.clinic_id = :clinicId', { clinicId });

        if (query.status) {
            qb.andWhere('a.status = :status', { status: query.status });
        }

        if (query.appointment_date) {
            qb.andWhere('a.appointment_date = :date', {
                date: query.appointment_date,
            });
        }

        qb.orderBy('a.appointment_date', 'ASC');

        return qb.getMany();
    }

    async update(id: string, dto: UpdateAppointmentDto) {

        const appointment = await this.repo.findOne({
            where: { id },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        Object.assign(appointment, dto);

        return this.repo.save(appointment);
    }

    async updateStatus(id: string, status: AppointmentStatus) {

        const appointment = await this.repo.findOne({
            where: { id },
        });

        if (!appointment) {
            throw new NotFoundException('Appointment not found');
        }

        appointment.status = status;

        return this.repo.save(appointment);
    }

    async getDoctorAvailableSlots(
        doctorId: string,
        date: string,
    ) {

        const slotDuration = 30; // minutes

        const startHour = 9;
        const endHour = 18;

        const slots: string[] = [];

        // generate slots
        let current = new Date(`${date}T${startHour}:00:00`);

        const endTime = new Date(`${date}T${endHour}:00:00`);

        while (current < endTime) {
            const hours = current.getHours().toString().padStart(2, '0');
            const minutes = current.getMinutes().toString().padStart(2, '0');

            slots.push(`${hours}:${minutes}`);

            current.setMinutes(current.getMinutes() + slotDuration);
        }

        // get existing appointments
        const appointments = await this.repo.find({
            where: {
                doctor_id: doctorId,
                appointment_date: new Date(date),
            },
        });

        const bookedSlots = appointments.map((a) => a.start_time);

        // remove booked slots
        const availableSlots = slots.filter(
            (slot) => !bookedSlots.includes(slot),
        );

        return availableSlots;
    }
}
