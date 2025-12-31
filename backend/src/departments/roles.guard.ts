import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const maybeReq: unknown = context.switchToHttp().getRequest();
    if (typeof maybeReq !== 'object' || maybeReq === null) return false;

    const request = maybeReq as { user?: unknown };
    const maybeUser: unknown = request.user;
    if (typeof maybeUser !== 'object' || maybeUser === null) return false;

    const { role, department } = maybeUser as {
      role?: string;
      department?: string;
    };
    const hasRole = typeof role === 'string' && roles.includes(role);
    const hasDepartment =
      typeof department === 'string' && roles.includes(department);
    return hasRole || hasDepartment;
  }
}
