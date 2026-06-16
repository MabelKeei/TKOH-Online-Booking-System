import { todayYmdInAppTimeZone } from './appTimezone'

/** 用户端日历可见天数（含今天） */
export const EV_BOOKING_VISIBLE_DAY_COUNT = 14

export function addDaysToYmd (ymd, days) {
  const date = new Date(`${ymd}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ymd
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 在管理员发布的年度范围内，取「含今天起共 14 天」与窗口的交集。
 */
export function resolveEvVisibleBookingRange (
  windowStartYmd,
  windowEndYmd,
  todayYmd = todayYmdInAppTimeZone()
) {
  if (!windowStartYmd || !windowEndYmd) {
    return { startYmd: '', endYmd: '' }
  }

  const displayStartYmd = todayYmd > windowStartYmd ? todayYmd : windowStartYmd
  const lastVisibleYmd = addDaysToYmd(todayYmd, EV_BOOKING_VISIBLE_DAY_COUNT - 1)
  const displayEndYmd = lastVisibleYmd < windowEndYmd ? lastVisibleYmd : windowEndYmd

  if (displayStartYmd > displayEndYmd) {
    return { startYmd: '', endYmd: '' }
  }

  return { startYmd: displayStartYmd, endYmd: displayEndYmd }
}
