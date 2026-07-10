/** 业务日历日与时钟展示时区（TKOH 香港）；可通过 APP_TIMEZONE 覆盖 */
export const APP_TIMEZONE =
  process.env.APP_TIMEZONE?.trim() || 'Asia/Hong_Kong';

/** 指定时区下的 YYYY-MM-DD */
export function formatYmdInTimeZone(
  date: Date = new Date(),
  timeZone: string = APP_TIMEZONE,
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getAppTodayYmd(timeZone: string = APP_TIMEZONE): string {
  return formatYmdInTimeZone(new Date(), timeZone);
}

const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export function getIsoWeekdayInTimeZone(
  ymd: string,
  timeZone: string = APP_TIMEZONE,
): number {
  const dateKey = String(ymd || '').trim();
  const anchor = new Date(`${dateKey}T12:00:00.000Z`);
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(anchor);
  return WEEKDAY_TO_ISO[label] ?? 1;
}

export function addDaysToYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map((value) => Number.parseInt(value, 10));
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

/** Monday–Sunday week bounds in business timezone for the given calendar date. */
export function getAppWeekBoundsYmd(
  ymd: string,
  timeZone: string = APP_TIMEZONE,
): { weekStartYmd: string; weekEndYmd: string } {
  const dateKey = String(ymd || '').trim();
  const isoWeekday = getIsoWeekdayInTimeZone(dateKey, timeZone);
  const weekStartYmd = addDaysToYmd(dateKey, -(isoWeekday - 1));
  const weekEndYmd = addDaysToYmd(weekStartYmd, 6);
  return { weekStartYmd, weekEndYmd };
}

/** 指定时区下的自然年（四位数字） */
export function getAppCalendarYear(
  date: Date = new Date(),
  timeZone: string = APP_TIMEZONE,
): number {
  return Number.parseInt(formatYmdInTimeZone(date, timeZone).slice(0, 4), 10);
}
