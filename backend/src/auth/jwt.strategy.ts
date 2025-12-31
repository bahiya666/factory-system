import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role, Department } from '@prisma/client';

interface JwtPayload {
  sub: number | string;
  role: Role;
  department?: Department | null;
}

interface AuthUser {
  id: number | string;
  role: Role;
  department?: Department | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRET_KEY',
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id: payload.sub,
      role: payload.role,
      department: payload.department,
    };
  }
}
