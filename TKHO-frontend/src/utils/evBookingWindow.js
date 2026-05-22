import { getEvBookingWindow } from '@/api/evManagement'
import { getMockBookingWindow } from '@/mocks/mockData'

/**
 * 读取 booking_windows 表中 resource_type = ev 的已发布日期范围。
 */
export async function fetchEvBookingWindow() {
  try {
    const win = await getEvBookingWindow()
    return {
      currentStartDate: win?.currentStartDate || '',
      currentEndDate: win?.currentEndDate || ''
    }
  } catch {
    const mock = getMockBookingWindow('ev')
    return {
      currentStartDate: mock?.currentStartDate || '',
      currentEndDate: mock?.currentEndDate || ''
    }
  }
}
