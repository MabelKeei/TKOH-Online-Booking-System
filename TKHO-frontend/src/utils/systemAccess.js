const ROLE_USER_EV = 'User_EV'
const ROLE_USER_VENUE = 'User_Venue'

function normalizeRoleName (user) {
  return String(user?.role || '').trim()
}

export function isUserEvRole (user) {
  const role = normalizeRoleName(user)
  const accessRoleId = String(user?.accessRoleId ?? '').trim()
  return role === ROLE_USER_EV || accessRoleId === '3'
}

export function isUserVenueRole (user) {
  const role = normalizeRoleName(user)
  const accessRoleId = String(user?.accessRoleId ?? '').trim()
  return role === ROLE_USER_VENUE || accessRoleId === '4'
}

/** User_EV / User_Venue 仅绑定单一预订系统，不可在顶栏切换 */
export function canSwitchBookingSystem (user) {
  return !isUserEvRole(user) && !isUserVenueRole(user)
}

function isAdminRole (user) {
  if (!user) return false
  if (user.isSuperAdmin) return true
  const role = normalizeRoleName(user).toLowerCase()
  return role.includes('admin')
}

/** 登录时选择的 system：parking | room | admin */
export function canAccessSystem (user, system) {
  if (!system) return false

  if (system === 'admin') {
    return isAdminRole(user)
  }

  if (isUserEvRole(user)) {
    return system === 'parking'
  }

  if (isUserVenueRole(user)) {
    return system === 'room'
  }

  return true
}

export function getDeniedSystemMessage (system) {
  if (system === 'parking') {
    return 'Your account does not have access to EV Booking.'
  }
  if (system === 'room') {
    return 'Your account does not have access to Venue Booking.'
  }
  if (system === 'admin') {
    return 'Your account does not have access to Admin Management.'
  }
  return 'You are not authorized for this system.'
}

export function systemForPath (path) {
  if (path.startsWith('/admin')) return 'admin'
  if (path.startsWith('/evBooking') || path.startsWith('/EVBooking')) return 'parking'
  if (path.startsWith('/VenueBooking')) return 'room'
  return null
}

/** 已登录用户是否可访问该路径（Account 等通用页返回 true） */
export function canAccessPath (user, path) {
  const system = systemForPath(path)
  if (!system) return true
  return canAccessSystem(user, system)
}
