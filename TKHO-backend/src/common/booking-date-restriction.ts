import { BadRequestException } from '@nestjs/common';
import { isAdminRole } from '../auth/admin-role.util';

/** 预订日期以 UTC 午夜存储，用 getUTCDay 判断周末。 */
export function isWeekendDate(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function assertWeekendBookableForUser(
  date: Date,
  auth: { role?: string; system?: string } | null | undefined,
): void {
  if (isAdminRole(auth)) return;
  if (!isWeekendDate(date)) return;
  throw new BadRequestException(
    'Booking is not allowed on weekends. Please contact an administrator.',
  );
}

export function assertPublicHolidayBookableForUser(
  date: Date,
  holidaySummary: string | null | undefined,
  auth: { role?: string; system?: string } | null | undefined,
): void {
  if (isAdminRole(auth)) return;
  if (!holidaySummary) return;
  const label = String(holidaySummary).trim() || 'Public Holiday';
  throw new BadRequestException(
    `Booking is not allowed on public holidays (${label}). Please contact an administrator.`,
  );
}
