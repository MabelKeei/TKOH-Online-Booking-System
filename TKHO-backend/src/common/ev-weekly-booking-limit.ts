import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getAppWeekBoundsYmd } from './app-timezone';

const ACTIVE_BOOKING_STATUSES = ['pending', 'confirmed'] as const;

type DbClient = PrismaService | Prisma.TransactionClient;

export function buildEvWeeklyBookingLimitMessage(weeklyLimit: number): string {
  const limit = Math.max(1, Math.floor(weeklyLimit));
  const bookingWord = limit === 1 ? 'booking' : 'bookings';
  return `You have already reached the weekly EV booking limit (${limit} ${bookingWord} per week, Monday to Sunday).`;
}

export async function isUserAdminById(db: DbClient, userId: bigint): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { access_roles: { select: { role_name: true } } },
  });
  return String(user?.access_roles?.role_name || '')
    .toLowerCase()
    .includes('admin');
}

export async function countActiveEvBookingsInWeek(
  db: DbClient,
  userId: bigint,
  bookingDateYmd: string,
  excludeBookingId?: bigint,
): Promise<number> {
  const { weekStartYmd, weekEndYmd } = getAppWeekBoundsYmd(bookingDateYmd);
  const weekStart = new Date(`${weekStartYmd}T00:00:00.000Z`);
  const weekEnd = new Date(`${weekEndYmd}T00:00:00.000Z`);

  return db.evBookings.count({
    where: {
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
      bookingDate: { gte: weekStart, lte: weekEnd },
      licensePlate: { user_id: userId },
      ...(excludeBookingId != null ? { id: { not: excludeBookingId } } : {}),
    },
  });
}

export async function assertEvWeeklyBookingLimit(
  db: DbClient,
  userId: bigint,
  bookingDateYmd: string,
  weeklyLimit: number,
  options?: { excludeBookingId?: bigint; bypassWeeklyLimit?: boolean },
): Promise<void> {
  if (options?.bypassWeeklyLimit) {
    return;
  }
  if (await isUserAdminById(db, userId)) {
    return;
  }

  const limit = Math.max(1, Math.floor(weeklyLimit));
  const count = await countActiveEvBookingsInWeek(
    db,
    userId,
    bookingDateYmd,
    options?.excludeBookingId,
  );
  if (count >= limit) {
    throw new ForbiddenException(buildEvWeeklyBookingLimitMessage(limit));
  }
}
