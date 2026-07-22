const STORAGE_KEY = 'tkoh-venue-calendar-view'
const VALID_VIEWS = new Set(['day', 'week', 'month'])

/** @returns {'day' | 'week' | 'month'} */
export function loadVenueCalendarView () {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (VALID_VIEWS.has(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'day'
}

/** @param {'day' | 'week' | 'month'} view */
export function saveVenueCalendarView (view) {
  if (!VALID_VIEWS.has(view)) return
  try {
    sessionStorage.setItem(STORAGE_KEY, view)
  } catch {
    /* ignore quota / private mode */
  }
}
