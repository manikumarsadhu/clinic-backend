import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { ServiceUsageService } from './service-usage.service';
import { CreateServiceUsageDto } from './dto/create-service-usage.dto';

@Controller('service-usage')
@UseGuards(AuthGuard('jwt'))
export class ServiceUsageController {
    constructor(private readonly service: ServiceUsageService) {}

    @Post()
    @Roles('CLINIC', 'DOCTOR', 'STAFF')
    useService(
        @Body() dto: CreateServiceUsageDto,
        @Req() req,
    ) {
        const clinicId = req.user.id;
        const userId = req.user.id;

        return this.service.useService(dto, clinicId, userId);
    }
}
