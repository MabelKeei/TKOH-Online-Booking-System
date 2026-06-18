import { Module } from '@nestjs/common';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { QuotaResetService } from './quota-reset.service';
import { UserInactivityService } from './user-inactivity.service';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';

@Module({
  imports: [SystemSettingsModule],
  controllers: [UserManagementController],
  providers: [UserManagementService, QuotaResetService, UserInactivityService],
})
export class UserManagementModule {}
