import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import * as bcrypt from 'bcryptjs';
import { Role, Department } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    email: string,
    password: string,
    role: Role,
    department?: Department,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword, role, department },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
