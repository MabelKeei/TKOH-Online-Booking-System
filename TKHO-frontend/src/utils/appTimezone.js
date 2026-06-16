/** 业务日历日与时钟展示时区（TKOH 香港） */
export const APP_TIMEZONE = 'Asia/Hong_Kong'

/** 指定时区下的 YYYY-MM-DD */
export function formatYmdInAppTimeZone (date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function todayYmdInAppTimeZone () {
  return formatYmdInAppTimeZone(new Date())
}

/** 香港时区下的当前自然年（四位数字字符串） */
export function getCurrentCalendarYearInAppTimeZone (date = new Date()) {
  return formatYmdInAppTimeZone(date).slice(0, 4)
}

/** 指定自然年的 YYYY-MM-DD 起止（含首尾） */
export function getCalendarYearBoundsYmd (year) {
  const y = String(year)
  return { startDate: `${y}-01-01`, endDate: `${y}-12-31` }
}

/** 香港时区当前自然年的 YYYY-MM-DD 起止 */
export function getCurrentCalendarYearBoundsYmd (date = new Date()) {
  return getCalendarYearBoundsYmd(getCurrentCalendarYearInAppTimeZone(date))
}

function formatAppHm (ms) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(ms))
}

/** 距香港时区下一整分的毫秒数（用于大屏时钟对齐） */
export function msUntilNextAppMinute (from = Date.now()) {
  const currentHm = formatAppHm(from)
  for (let offset = 1; offset <= 120_000; offset += 50) {
    if (formatAppHm(from + offset) !== currentHm) {
      for (let fine = Math.max(1, offset - 1000); fine <= offset; fine += 1) {
        if (formatAppHm(from + fine) !== currentHm) return fine
      }
      return offset
    }
  }
  return 60_000
}

/** 大屏顶部日期栏与左侧时钟（香港时间） */
export function getAppDisplayDateTimeParts (date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: APP_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      hour12: false
    })
      .formatToParts(date)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  )
  const weekdayZh = new Intl.DateTimeFormat('zh-HK', {
    timeZone: APP_TIMEZONE,
    weekday: 'long'
  }).format(date)

  return {
    day: parts.day,
    month: parts.month,
    year: parts.year,
    hour: parts.hour,
    minute: parts.minute,
    weekdayEn: parts.weekday,
    weekdayZh,
    ymd: `${parts.year}-${parts.month}-${parts.day}`
  }
}
