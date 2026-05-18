import { onMounted, onUnmounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { PENDING_USERS_BC_NAME, PENDING_USERS_SYNC_LS_KEY } from '@/utils/pendingUsersSync'

/** 仅用于定时轮询，避免与跨标签即时信号抢节流 */
const POLL_THROTTLE_MS = 5000
const POLL_MS = 20000
const VISIBILITY_DELAY_MS = 200
/** 合并极短时间内的 BC + storage 双触发 */
const IMMEDIATE_DEBOUNCE_MS = 32

/**
 * 在 Admin 布局壳层注册：跨标签待审批同步、回到前台刷新、定时角标轮询。
 * UserManagement 通过 store.pendingUsersListRevision 响应全量列表刷新。
 */
export function useAdminPendingUsersSync () {
  const adminStore = useAdminStore()
  let bc = null
  let pollTimer = null
  let visibilityTimer = null
  let immediateDebounceTimer = null
  let lastPollRefreshAt = 0

  function runRefresh () {
    adminStore.refreshPendingUsersSignal().catch((e) => console.error(e))
  }

  /** 跨标签 BC / storage：不走轮询节流，短 debounce 合并双通道 */
  function refreshPendingImmediate () {
    if (immediateDebounceTimer) clearTimeout(immediateDebounceTimer)
    immediateDebounceTimer = setTimeout(() => {
      immediateDebounceTimer = null
      runRefresh()
    }, IMMEDIATE_DEBOUNCE_MS)
  }

  function refreshPendingFromPoll () {
    const now = Date.now()
    if (now - lastPollRefreshAt < POLL_THROTTLE_MS) return
    lastPollRefreshAt = now
    runRefresh()
  }

  function scheduleRefreshOnVisible () {
    if (document.visibilityState !== 'visible') return
    if (visibilityTimer) clearTimeout(visibilityTimer)
    visibilityTimer = setTimeout(() => {
      visibilityTimer = null
      refreshPendingImmediate()
    }, VISIBILITY_DELAY_MS)
  }

  function onPendingUsersStorage (e) {
    if (e.key !== PENDING_USERS_SYNC_LS_KEY || e.newValue == null) return
    refreshPendingImmediate()
  }

  function onBroadcastMessage (event) {
    const data = event?.data
    if (data && data.type && data.type !== 'pending_users_updated') return
    refreshPendingImmediate()
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    adminStore.fetchPendingCounts()

    try {
      bc = new BroadcastChannel(PENDING_USERS_BC_NAME)
      bc.onmessage = onBroadcastMessage
    } catch {
      bc = null
    }

    window.addEventListener('storage', onPendingUsersStorage)
    window.addEventListener('focus', scheduleRefreshOnVisible)
    document.addEventListener('visibilitychange', scheduleRefreshOnVisible)
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshPendingFromPoll()
    }, POLL_MS)
  })

  onUnmounted(() => {
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
      window.removeEventListener('storage', onPendingUsersStorage)
      window.removeEventListener('focus', scheduleRefreshOnVisible)
    }
    document.removeEventListener('visibilitychange', scheduleRefreshOnVisible)
    if (bc) {
      try {
        bc.close()
      } catch {
        /* noop */
      }
      bc = null
    }
  })
}
