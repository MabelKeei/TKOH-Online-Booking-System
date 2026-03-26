import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockAdminPendingCounts } from '@/mocks/mockData'
// import { getPendingBookings, getPendingUsers } from '@/api/admin'

export const useAdminStore = defineStore('admin', () => {
  const pendingBookingsCount = ref(0)
  const pendingUsersCount = ref(0)

  const totalPendingCount = computed(() => {
    return pendingBookingsCount.value + pendingUsersCount.value
  })

  async function fetchPendingCounts() {
    try {
      // TODO: 临时使用 mock 数据，等后端接口实现后替换
      // Mock 数据：3个待审批会议，2个待审批用户
      pendingBookingsCount.value = mockAdminPendingCounts.pendingBookingsCount
      pendingUsersCount.value = mockAdminPendingCounts.pendingUsersCount

      /* 后端接口实现后使用以下代码：
      // 获取待审批会议数量
      const bookingsRes = await getPendingBookings()
      pendingBookingsCount.value = bookingsRes.data?.length || 0

      // 获取待审批用户数量
      const usersRes = await getPendingUsers()
      pendingUsersCount.value = usersRes.data?.length || 0
      */
    } catch (error) {
      console.error('Failed to fetch pending counts:', error)
      // 出错时使用 mock 数据
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
    totalPendingCount,
    fetchPendingCounts,
    resetCounts
  }
})
