const STORAGE_KEY = 'tkoh-venue-calendar-room-filter'

/**
 * @returns {{ selectedIds: string[] } | { bookNowRoomType: 'conference' | 'other' } | null}
 */
export function loadVenueCalendarRoomFilterState () {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.bookNowRoomType === 'conference' || parsed?.bookNowRoomType === 'other') {
      return { bookNowRoomType: parsed.bookNowRoomType }
    }
    const ids = parsed?.selectedIds
    if (!Array.isArray(ids)) return null
    return { selectedIds: ids.map(String) }
  } catch {
    return null
  }
}

/** @deprecated 兼容旧调用：仅返回 selectedIds */
export function loadVenueCalendarRoomFilter () {
  const state = loadVenueCalendarRoomFilterState()
  return state && 'selectedIds' in state ? state.selectedIds : null
}

/**
 * Book Now 进入日历前调用：下次日历加载用该类型默认筛选，并覆盖之前的手动筛选。
 * @param {'conference' | 'other'} roomType
 */
export function markVenueCalendarBookNowFilter (roomType) {
  if (roomType !== 'conference' && roomType !== 'other') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ bookNowRoomType: roomType }))
  } catch {
    /* ignore quota / private mode */
  }
}

export function saveVenueCalendarRoomFilter (rooms) {
  try {
    const selectedIds = (rooms || [])
      .filter((room) => room.selected)
      .map((room) => String(room.id))
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedIds }))
  } catch {
    /* ignore quota / private mode */
  }
}

/** @returns {boolean} 是否已应用存储中的筛选（含「全不选」） */
export function applyVenueCalendarRoomFilter (rooms, selectedIds) {
  if (!Array.isArray(selectedIds) || !rooms?.length) return false
  const idSet = new Set(selectedIds.map(String))
  for (const room of rooms) {
    room.selected = idSet.has(String(room.id))
  }
  return true
}

export function clearVenueCalendarRoomFilter () {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
