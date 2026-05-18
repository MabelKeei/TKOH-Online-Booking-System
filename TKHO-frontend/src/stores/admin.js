import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockAdminPendingCounts } from '@/mocks/mockData'
import { listPendingUsers } from '@/api/userManagement'
// import { getPendingBookings } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const pendingBookingsCount = ref(0)
  const pendingUsersCount = ref(0)
  /** 递增后通知 UserManagement 等子页刷新待审批全量列表（角标由 fetchPendingCounts 维护） */
  const pendingUsersListRevision = ref(0)

  const totalPendingCount = computed(() => {
    return pendingBookingsCount.value + pendingUsersCount.value
  })

  function notifyPendingUsersListChanged () {
    pendingUsersListRevision.value += 1
  }

  /** 跨标签 / 轮询 / 可见性：更新侧栏角标并触发子页拉表 */
  async function refreshPendingUsersSignal () {
    await fetchPendingCounts()
    notifyPendingUsersListChanged()
  }

  async function fetchPendingCounts () {
    try {
      pendingBookingsCount.value = mockAdminPendingCounts.pendingBookingsCount
      const pending = await listPendingUsers('pending')
      pendingUsersCount.value = Array.isArray(pending) ? pending.length : 0
    } catch (error) {
      console.error('Failed to fetch pending counts:', error)
      pendingBookingsCount.value = mockAdminPendingCounts.pendingBookingsCount
      pendingUsersCount.value = mockAdminPendingCounts.pendingUsersCount
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
    totalPendingCount,
    fetchPendingCounts,
    notifyPendingUsersListChanged,
    refreshPendingUsersSignal,
    resetCounts
  }
})
