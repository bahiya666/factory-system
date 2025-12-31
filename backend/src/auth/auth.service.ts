import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User, Department } from '@prisma/client';

type AuthUser = Pick<User, 'id' | 'role' | 'department'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    // `bcrypt` typings may not always be visible to the linter in some setups.
    // Create a locally-typed wrapper to avoid `@typescript-eslint/no-unsafe-*` warnings.
    const compareFn = bcrypt.compare as unknown as (
      plain: string,
      hash: string,
    ) => Promise<boolean>;

    const isValid = await compareFn(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  login(user: AuthUser) {
    const payload = {
      sub: user.id,
      role: user.role,
      department: user.department as Department | undefined,
    };
    return { access_token: this.jwtService.sign(payload) };
  }
}
