import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';
import { ApproveBookingDto } from './dto/approve-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { MeetingApprovalService } from './meeting-approval.service';

@ApiTags('meeting-approval')
@ApiBearerAuth()
@UseGuards(AdminRoleGuard)
@Controller('api/admin/bookings')
export class MeetingApprovalController {
  constructor(private readonly meetingApprovalService: MeetingApprovalService) {}

  @Get('pending')
  listPending() {
    return this.meetingApprovalService.listPending();
  }

  @Get('pending-expired')
  listPendingExpired() {
    return this.meetingApprovalService.listPendingExpired();
  }

  @Get('approved')
  listApproved() {
    return this.meetingApprovalService.listByApprovalStatus('approved');
  }

  @Get('rejected')
  listRejected() {
    return this.meetingApprovalService.listByApprovalStatus('rejected');
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveBookingDto,
    @Req() req: { user?: { sub?: string } },
  ) {
    return this.meetingApprovalService.approveBooking(id, dto, req?.user?.sub);
  }

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectBookingDto,
    @Req() req: { user?: { sub?: string } },
  ) {
    return this.meetingApprovalService.rejectBooking(id, dto, req?.user?.sub);
  }
}
