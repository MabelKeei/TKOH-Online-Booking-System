const STORAGE_KEY = 'tkoh-venue-calendar-room-filter'

export function loadVenueCalendarRoomFilter () {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const ids = parsed?.selectedIds
    if (!Array.isArray(ids)) return null
    return ids.map(String)
  } catch {
    return null
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
