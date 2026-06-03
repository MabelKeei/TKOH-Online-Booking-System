import { onMounted, onUnmounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useUserStore } from '@/stores/user'
import {
  ADMIN_PENDING_BC_NAME,
  ADMIN_PENDING_SYNC_EVENT,
  ADMIN_PENDING_SYNC_LS_KEY
} from '@/utils/adminPendingSync'
import { PENDING_BOOKINGS_BC_NAME, PENDING_BOOKINGS_SYNC_LS_KEY } from '@/utils/pendingBookingsSync'
import { PENDING_USERS_BC_NAME, PENDING_USERS_SYNC_LS_KEY } from '@/utils/pendingUsersSync'

/** 定时轮询间隔（跨窗口仍以 BC/storage 即时同步为主，轮询作兜底） */
const POLL_MS = 8000
/** 轮询与即时信号之间的最短间隔，避免短时间重复请求 */
const POLL_THROTTLE_MS = 2000
const VISIBILITY_DELAY_MS = 80
/** 合并极短时间内的 BC + storage + 同页事件 多触发 */
const IMMEDIATE_DEBOUNCE_MS = 16

/**
 * 管理员登录后全局注册（AppHeader）：跨窗口/跨标签同步待审批角标。
 * - 其它窗口的 Admin 侧栏、顶栏 Admin 红点随 storage / BroadcastChannel 更新
 * - UserManagement → pendingUsersListRevision
 * - MeetingApproval → pendingBookingsListRevision
 */
export function useAdminPendingUsersSync () {
  const adminStore = useAdminStore()
  const userStore = useUserStore()
  let adminBc = null
  let usersBc = null
  let bookingsBc = null
  let pollTimer = null
  let visibilityTimer = null
  let immediateDebounceTimer = null
  let lastPollRefreshAt = 0
  let active = false

  function runRefresh () {
    if (!active || !userStore.isAdmin) return
    adminStore.refreshPendingAdminSignal().catch((e) => console.error(e))
  }

  function refreshPendingImmediate () {
    if (!active) return
    if (immediateDebounceTimer) clearTimeout(immediateDebounceTimer)
    immediateDebounceTimer = setTimeout(() => {
      immediateDebounceTimer = null
      runRefresh()
    }, IMMEDIATE_DEBOUNCE_MS)
  }

  /** 定时轮询仅更新角标，避免每 8s 连带拉全量审批列表 */
  function refreshPendingFromPoll () {
    if (!active) return
    const now = Date.now()
    if (now - lastPollRefreshAt < POLL_THROTTLE_MS) return
    lastPollRefreshAt = now
    adminStore.fetchPendingCounts().catch((e) => console.warn(e))
  }

  function scheduleRefreshOnVisible () {
    if (!active || document.visibilityState !== 'visible') return
    if (visibilityTimer) clearTimeout(visibilityTimer)
    visibilityTimer = setTimeout(() => {
      visibilityTimer = null
      refreshPendingImmediate()
    }, VISIBILITY_DELAY_MS)
  }

  function onPendingSyncStorage (e) {
    if (!active || e.newValue == null) return
    const keys = [
      ADMIN_PENDING_SYNC_LS_KEY,
      PENDING_USERS_SYNC_LS_KEY,
      PENDING_BOOKINGS_SYNC_LS_KEY
    ]
    if (!keys.includes(e.key)) return
    refreshPendingImmediate()
  }

  function onAdminBroadcastMessage (event) {
    const data = event?.data
    if (data?.type && data.type !== 'admin_pending_updated') return
    refreshPendingImmediate()
  }

  function onUsersBroadcastMessage (event) {
    const data = event?.data
    if (data?.type && data.type !== 'pending_users_updated') return
    refreshPendingImmediate()
  }

  function onBookingsBroadcastMessage (event) {
    const data = event?.data
    if (data?.type && data.type !== 'pending_bookings_updated') return
    refreshPendingImmediate()
  }

  function onSameTabSyncEvent () {
    refreshPendingImmediate()
  }

  function startSync () {
    if (active || typeof window === 'undefined' || !userStore.isAdmin) return
    active = true

    adminStore.fetchPendingCounts()

    try {
      adminBc = new BroadcastChannel(ADMIN_PENDING_BC_NAME)
      adminBc.onmessage = onAdminBroadcastMessage
    } catch {
      adminBc = null
    }

    try {
      usersBc = new BroadcastChannel(PENDING_USERS_BC_NAME)
      usersBc.onmessage = onUsersBroadcastMessage
    } catch {
      usersBc = null
    }

    try {
      bookingsBc = new BroadcastChannel(PENDING_BOOKINGS_BC_NAME)
      bookingsBc.onmessage = onBookingsBroadcastMessage
    } catch {
      bookingsBc = null
    }

    window.addEventListener('storage', onPendingSyncStorage)
    window.addEventListener(ADMIN_PENDING_SYNC_EVENT, onSameTabSyncEvent)
    window.addEventListener('focus', scheduleRefreshOnVisible)
    document.addEventListener('visibilitychange', scheduleRefreshOnVisible)
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshPendingFromPoll()
    }, POLL_MS)
  }

  function stopSync () {
    active = false
    if (visibilityTimer) {
      clearTimeout(visibilityTimer)
      visibilityTimer = null
    }
    if (immediateDebounceTimer) {
      clearTimeout(immediateDebounceTimer)
      immediateDebounceTimer = null
    }
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onPendingSyncStorage)
      window.removeEventListener(ADMIN_PENDING_SYNC_EVENT, onSameTabSyncEvent)
      window.removeEventListener('focus', scheduleRefreshOnVisible)
    }
    document.removeEventListener('visibilitychange', scheduleRefreshOnVisible)
    for (const channel of [adminBc, usersBc, bookingsBc]) {
      if (!channel) continue
      try {
        channel.close()
      } catch {
        /* noop */
      }
    }
    adminBc = null
    usersBc = null
    bookingsBc = null
  }

  onMounted(() => {
    if (userStore.isAdmin) startSync()
  })

  onUnmounted(() => {
    stopSync()
  })

  return { startSync, stopSync }
}
