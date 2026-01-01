import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role, Department } from '@prisma/client';

interface RegisterBody {
  email: string;
  password: string;
  role: Role;
  department?: Department;
}

interface LoginBody {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterBody) {
    const { email, password, role, department } = body;
    if (!email || !password || !role)
      throw new BadRequestException('Missing fields');
    const user = await this.usersService.createUser(
      email,
      password,
      role,
      department,
    );
    return { message: 'User created', userId: user.id };
  }

  @Post('login')
  async login(@Body() body: LoginBody) {
    if (!body?.email || !body?.password)
      throw new BadRequestException('Missing credentials');
    const user = await this.authService.validateUser(body.email, body.password);
    // Return token and a sanitized user object (exclude password)
    const token = this.authService.login(user as any);
    return {
      access_token: token.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    };
  }
}
