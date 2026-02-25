import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // SUPER_ADMIN → View only their clinics
  @Roles(UserRole.SUPER_ADMIN)
  @Get('clinics')
  findMyClinics(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.usersService.findMyClinics(req.user.sub);
  }

  // SUPER_ADMIN → View only clients under their clinics
  @Roles(UserRole.SUPER_ADMIN)
  @Get('clients')
  findClientsUnderSuperAdmin(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.usersService.findClientsUnderSuperAdmin(req.user.sub);
  }

  // CLINIC → View only its own clients
  @Roles(UserRole.CLINIC)
  @Get('my-clients')
  findMyClients(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.usersService.findClientsOfClinic(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT)
  @Get('my-profile')
  getMyProfile(@Req() req: any) {
    console.log(req.user);
    return this.usersService.findOne(req.user.sub);
  }
}
