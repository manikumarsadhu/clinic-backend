import { Controller, Get, UseGuards, Req, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './entities/user.entity';
import { PaginationDto } from 'src/auth/dto/pagination.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  //  LIST CLINICS
  @Roles(UserRole.SUPER_ADMIN)
  @Get('clinics')
  findMyClinics(@Req() req: any, @Query() paginationDto: PaginationDto,) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.usersService.findMyClinics(req.user.id, paginationDto.page, paginationDto.limit,);
  }

  //  ADD CLINIC
  @Roles(UserRole.SUPER_ADMIN)
  @Post('clinic')
  addClinic(@Req() req: any, @Body() body: any) {
    return this.usersService.createClinic(req.user.id, body);
  }

  //  UPDATE CLINIC
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('clinic/:id')
  updateClinic(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateClinic(id, body);
  }

  //  SOFT DELETE
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('clinic/:id/delete')
  deleteClinic(@Param('id') id: string) {
    return this.usersService.softDeleteClinic(id);
  }

  //  ENABLE / DISABLE
  @Roles(UserRole.SUPER_ADMIN)
  @Patch('clinic/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.toggleClinicStatus(id, isActive);
  }

  // SUPER_ADMIN → View only clients under their clinics
  @Roles(UserRole.SUPER_ADMIN)
  @Get('clients')
  findClientsUnderSuperAdmin(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.usersService.findClientsUnderSuperAdmin(req.user.id);
  }

  // CLINIC → View only its own clients
  @Roles(UserRole.CLINIC)
  @Get('my-clients')
  findMyClients(
    @Req() req: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.findClientsOfClinic(
      req.user.id,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Roles(UserRole.CLINIC)
  @Post('client')
  addClient(
    @Req() req: any,
    @Body() body: any,
  ) {
    return this.usersService.createClient(req.user.id, body);
  }

  @Roles(UserRole.CLINIC)
  @Patch('client/:id')
  updateClient(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.usersService.updateClient(id, body);
  }

  @Roles(UserRole.CLINIC)
  @Patch('client/:id/delete')
  deleteClient(@Param('id') id: string) {
    return this.usersService.softDeleteClient(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT)
  @Get('my-profile')
  getMyProfile(@Req() req: any) {
    console.log(req.user);
    return this.usersService.findOne(req.user.id);
  }
}
