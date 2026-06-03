import { Module } from '@nestjs/common';
import { MeetingApprovalModule } from '../meeting-approval/meeting-approval.module';
import { AdminPendingController } from './admin-pending.controller';
import { AdminPendingService } from './admin-pending.service';

@Module({
  imports: [MeetingApprovalModule],
  controllers: [AdminPendingController],
  providers: [AdminPendingService],
})
export class AdminPendingModule {}
