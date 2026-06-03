import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAdminPendingCounts } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const pendingBookingsCount = ref(0)
  const pendingUsersCount = ref(0)
  /** 递增后通知 UserManagement 刷新待审批用户列表 */
  const pendingUsersListRevision = ref(0)
  /** 递增后通知 MeetingApproval 刷新待审批会议列表 */
  const pendingBookingsListRevision = ref(0)

  const totalPendingCount = computed(() => {
    return pendingBookingsCount.value + pendingUsersCount.value
  })

  function notifyPendingUsersListChanged () {
    pendingUsersListRevision.value += 1
  }

  function notifyPendingBookingsListChanged () {
    pendingBookingsListRevision.value += 1
  }

  /** 跨标签 / 轮询 / 可见性：更新侧栏角标并触发子页拉表 */
  async function refreshPendingAdminSignal () {
    await fetchPendingCounts()
    notifyPendingUsersListChanged()
    notifyPendingBookingsListChanged()
  }

  /** @deprecated 使用 refreshPendingAdminSignal */
  async function refreshPendingUsersSignal () {
    return refreshPendingAdminSignal()
  }

  let pendingCountsInFlight = null

  /** 角标专用：GET /api/admin/pending-counts（会议 + 用户待审批数量） */
  async function fetchPendingCounts () {
    if (pendingCountsInFlight) {
      return pendingCountsInFlight
    }
    pendingCountsInFlight = (async () => {
      try {
        const data = await getAdminPendingCounts()
        pendingBookingsCount.value = Number(data?.pendingBookings) || 0
        pendingUsersCount.value = Number(data?.pendingUsers) || 0
      } catch (error) {
        const isTimeout = error?.code === 'ECONNABORTED' || /timeout/i.test(String(error?.message || ''))
        console.warn(
          isTimeout ? 'Pending counts request timed out; keeping last badge values.' : 'Failed to fetch pending counts:',
          error
        )
      }
    })()
    try {
      await pendingCountsInFlight
    } finally {
      pendingCountsInFlight = null
    }
  }

  function resetCounts() {
    pendingBookingsCount.value = 0
    pendingUsersCount.value = 0
  }

  return {
    pendingBookingsCount,
    pendingUsersCount,
    pendingUsersListRevision,
    pendingBookingsListRevision,
    totalPendingCount,
    fetchPendingCounts,
    notifyPendingUsersListChanged,
    notifyPendingBookingsListChanged,
    refreshPendingAdminSignal,
    refreshPendingUsersSignal,
    resetCounts
  }
})
