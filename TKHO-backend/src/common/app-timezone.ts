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

/** 指定时区下的自然年（四位数字） */
export function getAppCalendarYear(
  date: Date = new Date(),
  timeZone: string = APP_TIMEZONE,
): number {
  return Number.parseInt(formatYmdInTimeZone(date, timeZone).slice(0, 4), 10);
}
