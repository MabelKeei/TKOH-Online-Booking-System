import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeetingApprovalService } from '../meeting-approval/meeting-approval.service';

@Injectable()
export class AdminPendingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly meetingApprovalService: MeetingApprovalService,
  ) {}

  async getPendingCounts() {
    const [pendingBookings, pendingUsers] = await Promise.all([
      this.meetingApprovalService.countPendingNotTimedOut(),
      this.prisma.pending_users.count({
        where: { approval_status: 'Pending' },
      }),
    ]);

    return {
      pendingBookings,
      pendingUsers,
      total: pendingBookings + pendingUsers,
    };
  }
}
