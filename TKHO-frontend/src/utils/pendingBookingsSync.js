import { notifyAdminPendingUpdated } from '@/utils/adminPendingSync'

/** @deprecated 请使用 adminPendingSync；保留以兼容旧调用 */
export const PENDING_BOOKINGS_SYNC_LS_KEY = 'tkoh-pending-bookings-updated'
export const PENDING_BOOKINGS_BC_NAME = 'tkoh-pending-bookings'

/** 待审批会议预订变化时通知所有 Admin 窗口/标签刷新角标 */
export function notifyPendingBookingsUpdated () {
  notifyAdminPendingUpdated({ source: 'bookings' })
}
