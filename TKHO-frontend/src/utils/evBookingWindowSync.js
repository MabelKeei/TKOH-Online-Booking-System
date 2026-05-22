/** 跨标签通知 EV 预订日期范围已发布/更新 */
export const EV_BOOKING_WINDOW_SYNC_LS_KEY = 'tkoh-ev-booking-window-updated'
export const EV_BOOKING_WINDOW_BC_NAME = 'tkoh-ev-booking-window'

let notifyChannel = null

function getNotifyChannel () {
  if (notifyChannel) return notifyChannel
  try {
    notifyChannel = new BroadcastChannel(EV_BOOKING_WINDOW_BC_NAME)
  } catch {
    notifyChannel = null
  }
  return notifyChannel
}

export function parseEvBookingWindowSyncPayload (raw) {
  if (raw == null || raw === '') return null
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (data?.type && data.type !== 'ev_booking_window_updated') return null
    if (!data?.currentStartDate || !data?.currentEndDate) return null
    return {
      type: 'ev_booking_window_updated',
      at: Number(data.at) || 0,
      currentStartDate: String(data.currentStartDate),
      currentEndDate: String(data.currentEndDate)
    }
  } catch {
    return null
  }
}

/** 读取最近一次发布的日期范围（用于轮询 / 切回前台兜底） */
export function readEvBookingWindowSyncPayload () {
  if (typeof window === 'undefined') return null
  try {
    return parseEvBookingWindowSyncPayload(
      localStorage.getItem(EV_BOOKING_WINDOW_SYNC_LS_KEY)
    )
  } catch {
    return null
  }
}

/**
 * Admin 发布 booking_windows (resource_type=ev) 后通知 EV 预订日历刷新。
 */
export function notifyEvBookingWindowUpdated (detail = {}) {
  if (typeof window === 'undefined') return
  const payload = {
    type: 'ev_booking_window_updated',
    at: Date.now(),
    currentStartDate: detail.currentStartDate ?? null,
    currentEndDate: detail.currentEndDate ?? null
  }

  const channel = getNotifyChannel()
  if (channel) {
    try {
      channel.postMessage(payload)
    } catch {
      /* noop */
    }
  }

  try {
    localStorage.setItem(EV_BOOKING_WINDOW_SYNC_LS_KEY, JSON.stringify(payload))
  } catch {
    /* private mode 等 */
  }
}
