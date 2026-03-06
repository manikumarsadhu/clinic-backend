import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, ParseBoolPipe } from "@nestjs/common";
import { MasterPlanService } from "./master-plan.service";
import { Roles } from "src/auth/roles.decorator";
import { CreateMasterPlanDto } from "./dto/create-master-plan.dto";
import { ListMasterPlanDto } from "./dto/list-master-plan.dto";
import { UpdateMasterPlanDto } from "./dto/update-master-plan.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('master-plans')
@UseGuards(AuthGuard('jwt'))
export class MasterPlanController {
    constructor(private readonly service: MasterPlanService) { }

    @Post()
    @Roles('SUPER_ADMIN')
    create(
        @Body() dto: CreateMasterPlanDto,
        @Req() req,
    ) {
        console.log("USER:", req.user);
        return this.service.create(dto, req.user.id);
    }

    @Get()
    findAll(@Query() query: ListMasterPlanDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @Roles('SUPER_ADMIN')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateMasterPlanDto,
        @Req() req,
    ) {
        return this.service.update(id, dto, req.user.id);
    }

    @Patch(':id/status')
    @Roles('SUPER_ADMIN')
    toggleStatus(
        @Param('id') id: string,
        @Body('is_active') is_active: boolean,
    ) {
        return this.service.toggleStatus(id, is_active);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN')
    delete(@Param('id') id: string) {
        return this.service.softDelete(id);
    }

    @Patch(':id/publish')
    publishPlan(@Param('id') id: string) {
        return this.service.publishPlan(id);
    }
}