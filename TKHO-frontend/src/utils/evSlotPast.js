/** EV 日历 / Add Booking：判断某日某时段是否已结束（按 endTime） */

export function createDateAtMidnight (baseDate = new Date()) {
  const date = new Date(baseDate)
  date.setHours(0, 0, 0, 0)
  return date
}

export function parseHmOnDate (dateYmd, timeStr) {
  if (!timeStr) return null
  const parts = String(timeStr).trim().split(':')
  const hours = Number(parts[0])
  const minutes = Number(parts[1] ?? 0)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  const slot = new Date(`${dateYmd}T00:00:00`)
  if (Number.isNaN(slot.getTime())) return null
  slot.setHours(hours, minutes, 0, 0)
  return slot
}

/**
 * @param {string} dateYmd YYYY-MM-DD
 * @param {string|number} periodId
 * @param {Array<{ id: string, endTime?: string }>} timePeriods
 */
export function isEvSlotPast (dateYmd, periodId, timePeriods = []) {
  const bookingDay = createDateAtMidnight(new Date(`${dateYmd}T00:00:00`))
  if (Number.isNaN(bookingDay.getTime())) return false
  const today = createDateAtMidnight()
  if (bookingDay < today) return true
  if (bookingDay > today) return false
  const period = timePeriods.find((row) => String(row.id) === String(periodId))
  const slotEnd = parseHmOnDate(dateYmd, period?.endTime)
  if (!slotEnd) return false
  return new Date() > slotEnd
}
