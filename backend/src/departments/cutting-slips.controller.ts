import { Controller, Get, Param, ParseIntPipe, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { CuttingSlipsService } from './cutting-slips.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, Department } from '@prisma/client';

interface AuthUser {
  id: number | string;
  role: Role;
  department?: Department | null;
}

@Controller('departments/fabric/cutting-slips')
@UseGuards(AuthGuard('jwt'))
export class CuttingSlipsController {
  constructor(private readonly service: CuttingSlipsService) {}

  private ensureAccess(user?: AuthUser) {
    if (!user) throw new ForbiddenException();
    if (user.role === 'ADMIN') return;
    if (user.role === 'DEPARTMENT' && user.department === 'MATERIALS') return;
    throw new ForbiddenException('Not allowed for this department');
  }

  @Get()
  async all(@Req() req: { user?: AuthUser }) {
    this.ensureAccess(req.user);
    return this.service.getFabricCuttingSlip({});
    }

  @Get(':orderId')
  async byOrder(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: { user?: AuthUser }) {
    this.ensureAccess(req.user);
    return this.service.getFabricCuttingSlip({ orderId });
  }
}
