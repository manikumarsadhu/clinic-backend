import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MasterPlanServiceService } from "./master-plan-service.service";
import { Roles } from "src/auth/roles.decorator";
import { CreateMasterPlanServiceDto } from "./dto/create-master-plan-service.dto";

@Controller('master-plan-services')
@UseGuards(AuthGuard('jwt'))
export class MasterPlanServiceController {

    constructor(private readonly service: MasterPlanServiceService) { }

    @Post()
    @Roles('SUPER_ADMIN')
    create(@Body() dto: CreateMasterPlanServiceDto) {
        return this.service.create(dto);
    }

    @Get(':planId')
    findByPlan(@Param('planId') planId: string) {
        return this.service.findByPlan(planId);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN')
    remove(@Param('id') id: string) {
        return this.service.softDelete(id);
    }
}
