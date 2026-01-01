import { Controller, Post, Body, BadRequestException, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role, Department } from '@prisma/client';

interface CreateUserBody {
  email: string;
  password: string;
  role: Role;
  // Accept string as well because the frontend may submit an empty string
  department?: string | Department;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserBody) {
    const { email, password, role, department } = body;
    if (!email || !password || !role) {
      throw new BadRequestException('Missing fields');
    }
    try {
      // Ensure department is either a valid enum value or undefined
      const dept = department && department !== '' ? (department as Department) : undefined;
      await this.usersService.createUser(email, password, role, dept);
      return { message: 'User created' };
    } catch (err: any) {
      // Return a clearer error to the frontend
      throw new BadRequestException(err?.message || 'Failed to create user');
    }
  }

  @Get()
  async list() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { department?: string | Department | null }) {
    const userId = Number(id);
    if (Number.isNaN(userId)) throw new BadRequestException('Invalid user id');
    try {
      const dept = body.department && body.department !== '' ? (body.department as Department) : null;
      const updated = await this.usersService.updateDepartment(userId, dept);
      return { message: 'Updated', user: { id: updated.id, email: updated.email, role: updated.role, department: updated.department } };
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Failed to update user');
    }
  }
}

