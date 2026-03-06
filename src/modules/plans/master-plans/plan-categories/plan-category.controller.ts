import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseBoolPipe,
} from '@nestjs/common';
import { PlanCategoryService } from './plan-category.service';
import { CreatePlanCategoryDto } from './dto/create-plan-category.dto';
import { UpdatePlanCategoryDto } from './dto/update-plan-category.dto';
import { ListPlanCategoryDto } from './dto/list-plan-category.dto';
import { Roles } from 'src/common/roles.decorator';

@Controller('plan-categories')
export class PlanCategoryController {
    constructor(private readonly service: PlanCategoryService) { }

    @Post()
    @Roles('SUPER_ADMIN')
    create(@Body() dto: CreatePlanCategoryDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll(@Query() query: ListPlanCategoryDto) {
        return this.service.findAll(query);
    }

    @Patch(':id')
    @Roles('SUPER_ADMIN')
    update(
        @Param('id') id: string,
        @Body() dto: UpdatePlanCategoryDto,
    ) {
        return this.service.update(id, dto);
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