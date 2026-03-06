import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, ParseBoolPipe, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MasterServiceService } from "./master-service.service";
import { Roles } from "src/auth/roles.decorator";
import { CreateMasterServiceDto } from "./dto/create-master-service.dto";
import { UpdateMasterServiceDto } from "./dto/update-master-service.dto";

@Controller('master-services')
@UseGuards(AuthGuard('jwt'))
export class MasterServiceController {
    constructor(private readonly service: MasterServiceService) { }

    @Post()
    @Roles('SUPER_ADMIN')
    create(@Body() dto: CreateMasterServiceDto, @Req() req) {
        return this.service.create(dto, req.user.id);
    }

    @Get()
    findAll(@Query() query) {
        return this.service.findAll(query);
    }

    @Patch(':id')
    @Roles('SUPER_ADMIN')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateMasterServiceDto,
        @Req() req,
    ) {
        return this.service.update(id, dto, req.user.id);
    }

    @Patch(':id/status')
    @Roles('SUPER_ADMIN')
    toggleStatus(
        @Param('id') id: string,
        @Body('is_active', ParseBoolPipe) is_active: boolean,
    ) {
        return this.service.toggleStatus(id, is_active);
    }

    @Delete(':id')
    @Roles('SUPER_ADMIN')
    delete(@Param('id') id: string) {
        return this.service.softDelete(id);
    }
}
