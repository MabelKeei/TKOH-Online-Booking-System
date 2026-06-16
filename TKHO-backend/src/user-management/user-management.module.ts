import { Module } from '@nestjs/common';
import { QuotaResetService } from './quota-reset.service';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';

@Module({
  controllers: [UserManagementController],
  providers: [UserManagementService, QuotaResetService],
})
export class UserManagementModule {}
