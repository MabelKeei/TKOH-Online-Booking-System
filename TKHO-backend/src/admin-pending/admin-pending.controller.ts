import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { AdminPendingService } from './admin-pending.service';

@ApiTags('admin-pending')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('api/admin')
export class AdminPendingController {
  constructor(private readonly adminPendingService: AdminPendingService) {}

  /** 角标专用：仅返回待审批数量，不拉全量列表 */
  @Get('pending-counts')
  getPendingCounts() {
    return this.adminPendingService.getPendingCounts();
  }
}
