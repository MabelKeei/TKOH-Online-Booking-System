import { Module } from '@nestjs/common';
import { MeetingApprovalController } from './meeting-approval.controller';
import { MeetingApprovalService } from './meeting-approval.service';

@Module({
  controllers: [MeetingApprovalController],
  providers: [MeetingApprovalService],
  exports: [MeetingApprovalService],
})
export class MeetingApprovalModule {}
