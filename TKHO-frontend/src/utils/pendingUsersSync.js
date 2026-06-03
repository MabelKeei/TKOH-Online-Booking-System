import { notifyAdminPendingUpdated } from '@/utils/adminPendingSync'

/** @deprecated 请使用 adminPendingSync；保留以兼容旧调用 */
export const PENDING_USERS_SYNC_LS_KEY = 'tkoh-pending-users-updated'
export const PENDING_USERS_BC_NAME = 'tkoh-pending-users'

/** 待审批用户变化时通知所有 Admin 窗口/标签刷新角标 */
export function notifyPendingUsersUpdated () {
  notifyAdminPendingUpdated({ source: 'users' })
}
