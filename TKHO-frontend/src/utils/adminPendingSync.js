/**
 * Admin 待审批角标：跨窗口 / 跨标签统一同步（Meeting Approval + User Management）
 * BroadcastChannel：其它窗口即时；localStorage storage：兜底（部分环境 BC 不可用）
 */
export const ADMIN_PENDING_SYNC_LS_KEY = 'tkoh-admin-pending-sync'
export const ADMIN_PENDING_BC_NAME = 'tkoh-admin-pending'

/** 同页内即时刷新（BC/storage 不会回传给当前标签） */
export const ADMIN_PENDING_SYNC_EVENT = 'tkoh-admin-pending-sync'

let notifyChannel = null

function getNotifyChannel () {
  if (notifyChannel) return notifyChannel
  try {
    notifyChannel = new BroadcastChannel(ADMIN_PENDING_BC_NAME)
  } catch {
    notifyChannel = null
  }
  return notifyChannel
}

/**
 * 通知其它已打开的窗口/标签刷新 Admin 待审批角标与列表。
 * @param {{ source?: 'users' | 'bookings' | 'all' }} [options]
 */
export function notifyAdminPendingUpdated (options = {}) {
  if (typeof window === 'undefined') return
  const source = options.source ?? 'all'
  const payload = { type: 'admin_pending_updated', source, at: Date.now() }

  const channel = getNotifyChannel()
  if (channel) {
    try {
      channel.postMessage(payload)
    } catch {
      /* noop */
    }
  }

  try {
    localStorage.setItem(ADMIN_PENDING_SYNC_LS_KEY, String(payload.at))
  } catch {
    /* private mode 等 */
  }

  try {
    window.dispatchEvent(new CustomEvent(ADMIN_PENDING_SYNC_EVENT, { detail: payload }))
  } catch {
    /* noop */
  }
}
