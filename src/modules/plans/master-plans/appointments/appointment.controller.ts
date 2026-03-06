import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';

import { AppointmentService } from './appointment.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentDto } from './dto/list-appointment.dto';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { Roles } from 'src/auth/roles.decorator';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentController {
    constructor(private readonly service: AppointmentService) { }

    @Post()
    @Roles('CLINIC_ADMIN', 'DOCTOR', 'STAFF')
    create(@Body() dto: CreateAppointmentDto, @Req() req) {
        return this.service.create(dto, req.user.id, req.user.id);
    }

    @Get()
    findAll(@Query() query: ListAppointmentDto, @Req() req) {
        return this.service.findAll(req.user.id, query);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: AppointmentStatus,
    ) {
        return this.service.updateStatus(id, status);
    }

    @Get('doctor/:doctorId/slots')
    getDoctorSlots(
        @Param('doctorId') doctorId: string,
        @Query('date') date: string,
    ) {
        return this.service.getDoctorAvailableSlots(doctorId, date);
    }
}
