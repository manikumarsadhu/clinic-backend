import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: any) {
    // Map JWT payload to a consistent user object expected by controllers
    // Passport will assign this return value to req.user. Many parts of
    // the application expect an `id` property (not `sub`), so we translate
    // it here.
    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      // keep the rest in case other code relies on the original payload
      ...payload,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
