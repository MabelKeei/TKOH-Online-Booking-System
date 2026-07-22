export function hasVenueDailyBookingWindow (venue) {
  const start = String(venue?.dailyBookingStartTime || '').trim()
  const end = String(venue?.dailyBookingEndTime || '').trim()
  return Boolean(start && end)
}

export function formatVenueDailyBookingWindowLabel (venue) {
  const start = String(venue?.dailyBookingStartTime || '').trim()
  const end = String(venue?.dailyBookingEndTime || '').trim()
  if (!start || !end) return ''
  return `${start} – ${end}`
}

export function isWithinVenueDailyBookingWindow (venue, startTime, endTime) {
  if (!hasVenueDailyBookingWindow(venue)) return true
  const openStart = String(venue?.dailyBookingStartTime || '').trim()
  const openEnd = String(venue?.dailyBookingEndTime || '').trim()
  const start = String(startTime || '').trim()
  const end = String(endTime || '').trim()
  if (!start || !end) return false
  return start >= openStart && end <= openEnd
}

export function buildVenueDailyBookingWindowMessage (venue) {
  const label = formatVenueDailyBookingWindowLabel(venue)
  const venueName = String(venue?.name || 'This venue').trim()
  if (!label) {
    return `${venueName} does not have a daily open booking window configured.`
  }
  return `${venueName} is only open for booking from ${label} daily.`
}

export function validateVenueDailyBookingWindow (venue, startTime, endTime) {
  if (!hasVenueDailyBookingWindow(venue)) {
    return { ok: true }
  }
  if (isWithinVenueDailyBookingWindow(venue, startTime, endTime)) {
    return { ok: true }
  }
  return {
    ok: false,
    message: buildVenueDailyBookingWindowMessage(venue)
  }
}
