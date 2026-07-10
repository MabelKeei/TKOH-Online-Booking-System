import { getEvBookingWindow } from '@/api/evManagement'
import { getMockBookingWindow } from '@/mocks/mockData'
import { getCachedOrFetch, invalidateCachedValue } from '@/utils/apiCache'
import { SILENT_ERROR } from '@/utils/requestOptions'

const EV_BOOKING_WINDOW_CACHE_KEY = 'ev-booking-window'
const EV_BOOKING_WINDOW_CACHE_TTL_MS = 60 * 1000

/**
 * 读取 booking_windows 表中 resource_type = ev 的已发布日期范围。
 */
export async function fetchEvBookingWindow() {
  try {
    const win = await getCachedOrFetch(
      EV_BOOKING_WINDOW_CACHE_KEY,
      EV_BOOKING_WINDOW_CACHE_TTL_MS,
      () => getEvBookingWindow(SILENT_ERROR)
    )
    return {
      currentStartDate: win?.currentStartDate || '',
      currentEndDate: win?.currentEndDate || '',
      evDateUpdateTime: win?.evDateUpdateTime || '13:00'
    }
  } catch {
    const mock = getMockBookingWindow('ev')
    return {
      currentStartDate: mock?.currentStartDate || '',
      currentEndDate: mock?.currentEndDate || '',
      evDateUpdateTime: mock?.evDateUpdateTime || '13:00'
    }
  }
}

export function invalidateEvBookingWindowCache () {
  invalidateCachedValue(EV_BOOKING_WINDOW_CACHE_KEY)
}
