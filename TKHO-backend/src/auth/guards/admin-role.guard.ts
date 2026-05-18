import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/** JWT payload must include `role` with substring `admin` (case-insensitive), e.g. access role name `Admin`. */
@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const role = req.user?.role;
    if (!String(role || '').toLowerCase().includes('admin')) {
      throw new ForbiddenException('Admin portal access required');
    }
    return true;
  }
}
