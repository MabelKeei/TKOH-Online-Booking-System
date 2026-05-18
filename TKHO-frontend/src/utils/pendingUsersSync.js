/** 跨标签通知「待审批用户」可能已变化（/register 提交、Admin 审批/拒绝） */
export const PENDING_USERS_SYNC_LS_KEY = 'tkoh-pending-users-updated'
export const PENDING_USERS_BC_NAME = 'tkoh-pending-users'

let notifyChannel = null

function getNotifyChannel () {
  if (notifyChannel) return notifyChannel
  try {
    notifyChannel = new BroadcastChannel(PENDING_USERS_BC_NAME)
  } catch {
    notifyChannel = null
  }
  return notifyChannel
}

/**
 * 通知其他已打开的浏览器标签（含 Admin）刷新待审批数据。
 * BroadcastChannel：同源多标签即时；localStorage：触发其他标签的 storage 事件。
 */
export function notifyPendingUsersUpdated () {
  if (typeof window === 'undefined') return
  const payload = { type: 'pending_users_updated', at: Date.now() }

  const channel = getNotifyChannel()
  if (channel) {
    try {
      channel.postMessage(payload)
    } catch {
      /* noop */
    }
  }

  try {
    localStorage.setItem(PENDING_USERS_SYNC_LS_KEY, String(payload.at))
  } catch {
    /* private mode 等 */
  }
}
