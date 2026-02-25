import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from './roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.SUPER_ADMIN)
  @Post('create-clinic')
  createClinic(@Body() dto: RegisterDto, @Req() req) {
    dto.role = UserRole.CLINIC;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    dto.parentId = req.user.sub; // 🔥 clinic belongs to superadmin
    return this.authService.register(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.CLINIC)
  @Post('create-client')
  createClient(@Body() dto: RegisterDto, @Req() req) {
    dto.role = UserRole.CLIENT;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    dto.parentId = req.user.sub; // 🔥 client belongs to clinic
    return this.authService.register(dto);
  }
}
