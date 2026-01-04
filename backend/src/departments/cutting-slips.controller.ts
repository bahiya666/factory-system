import { Controller, Get, Param, ParseIntPipe, Req, ForbiddenException, UseGuards } from '@nestjs/common';
import { CuttingSlipsService } from './cutting-slips.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, Department } from '@prisma/client';

interface AuthUser {
  id: number | string;
  role: Role;
  department?: Department | null;
}

@Controller()
@UseGuards(AuthGuard('jwt'))
export class CuttingSlipsController {
  constructor(private readonly service: CuttingSlipsService) {}

  private ensureAccessFabric(user?: AuthUser) {
    if (!user) throw new ForbiddenException();
    if (user.role === 'ADMIN') return;
    if (user.role === 'DEPARTMENT' && user.department === 'MATERIALS') return;
    throw new ForbiddenException('Not allowed for this department');
  }

  private ensureAccessWood(user?: AuthUser) {
    if (!user) throw new ForbiddenException();
    if (user.role === 'ADMIN') return;
    if (user.role === 'DEPARTMENT' && user.department === 'WOOD') return;
    throw new ForbiddenException('Not allowed for this department');
  }

  private ensureAccessFoam(user?: AuthUser) {
    if (!user) throw new ForbiddenException();
    if (user.role === 'ADMIN') return;
    if (user.role === 'DEPARTMENT' && user.department === 'FOAM') return;
    throw new ForbiddenException('Not allowed for this department');
  }

  // Materials (fabric) endpoints
  @Get('departments/fabric/cutting-slips')
  async allFabric(@Req() req: { user?: AuthUser }) {
    this.ensureAccessFabric(req.user);
    return this.service.getFabricCuttingSlip({});
  }

  @Get('departments/fabric/cutting-slips/:orderId')
  async byOrderFabric(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: { user?: AuthUser }) {
    this.ensureAccessFabric(req.user);
    return this.service.getFabricCuttingSlip({ orderId });
  }

  // Wood endpoints
  @Get('departments/wood/cutting-slips')
  async allWood(@Req() req: { user?: AuthUser }) {
    this.ensureAccessWood(req.user);
    return this.service.getWoodCuttingSlip({});
  }

  @Get('departments/wood/cutting-slips/:orderId')
  async byOrderWood(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: { user?: AuthUser }) {
    this.ensureAccessWood(req.user);
    return this.service.getWoodCuttingSlip({ orderId });
  }

  // Foam endpoints
  @Get('departments/foam/cutting-slips')
  async allFoam(@Req() req: { user?: AuthUser }) {
    this.ensureAccessFoam(req.user);
    return this.service.getFoamCuttingSlip({});
  }

  @Get('departments/foam/cutting-slips/:orderId')
  async byOrderFoam(@Param('orderId', ParseIntPipe) orderId: number, @Req() req: { user?: AuthUser }) {
    this.ensureAccessFoam(req.user);
    return this.service.getFoamCuttingSlip({ orderId });
  }
}
