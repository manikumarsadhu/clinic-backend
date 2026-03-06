import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { ClientPlanService } from './client-plan.service';
import { CreateClientPlanDto } from './dto/create-client-plan.dto';
import { ListClientPlanDto } from './dto/list-client-plan.dto';
import { UpgradeClientPlanDto } from './dto/upgrade-client-plan.dto';

@Controller('client-plans')
@UseGuards(AuthGuard('jwt'))
export class ClientPlanController {
  constructor(private readonly service: ClientPlanService) {}

  @Post('assign')
  @Roles('CLINIC', 'SUPER_ADMIN')
  assignPlan(@Body() dto: CreateClientPlanDto, @Req() req) {
    const clinicId = req.user.sub;
    return this.service.assignPlan(dto, clinicId);
  }

  @Get()
  @Roles('CLINIC', 'SUPER_ADMIN')
  listSubscriptions(@Query() query: ListClientPlanDto, @Req() req) {
    const clinicId = req.user.sub;
    return this.service.listSubscriptions(clinicId, query);
  }

  @Post('upgrade')
  @Roles('CLINIC', 'SUPER_ADMIN')
  upgradePlan(@Body() dto: UpgradeClientPlanDto, @Req() req) {
    const clinicId = req.user.sub;
    const userId = req.user.sub;
    return this.service.upgradePlan(dto, clinicId, userId);
  }

  @Get('client/:clientId/plans')
  @Roles('CLINIC', 'SUPER_ADMIN')
  getClientPlans(@Param('clientId') clientId: string, @Req() req) {
    const clinicId = req.user.sub;
    return this.service.getClientPlans(clientId, clinicId);
  }

}
