/** 大屏展示页（免登录） */
export function isDisplayRoute (path) {
  return (
    path.startsWith('/VenueBooking/Display') ||
    path.startsWith('/evBooking/Display') ||
    path.startsWith('/EVBooking/Display')
  )
}

export function isPublicEntryRoute (path) {
  return path === '/login' || path === '/register'
}

/** 与 router beforeEach 一致：需要登录才能访问 */
export function pathRequiresAuth (path) {
  if (isPublicEntryRoute(path)) return false
  if (isDisplayRoute(path)) return false
  if (path.startsWith('/admin')) return true
  if (path.startsWith('/VenueBooking')) return true
  if (path.startsWith('/evBooking') || path.startsWith('/EVBooking')) return true
  if (path.startsWith('/Account')) return true
  return false
}

/** 免登录页：登录/注册 + 大屏展示 */
export function isPublicRoute (path) {
  return isPublicEntryRoute(path) || isDisplayRoute(path)
}
