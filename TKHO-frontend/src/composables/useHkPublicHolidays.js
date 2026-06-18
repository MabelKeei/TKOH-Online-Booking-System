import { ref } from 'vue'
import { getCachedOrFetch } from '@/utils/apiCache'
import { getHkPublicHolidays } from '@/api/hkPublicHolidays'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000

function formatDateYmd (value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function useHkPublicHolidays () {
  const holidaysByDate = ref({})
  const syncedAt = ref(null)
  const loading = ref(false)

  async function loadHolidays (from, to) {
    const fromYmd = formatDateYmd(from)
    const toYmd = formatDateYmd(to)
    if (!fromYmd || !toYmd) {
      holidaysByDate.value = {}
      syncedAt.value = null
      return
    }

    const cacheKey = `hk-holidays:${fromYmd}:${toYmd}`
    loading.value = true
    try {
      const data = await getCachedOrFetch(cacheKey, CACHE_TTL_MS, () =>
        getHkPublicHolidays({ from: fromYmd, to: toYmd })
      )
      const map = {}
      for (const item of data?.holidays ?? []) {
        if (item?.date) {
          map[item.date] = String(item.summary || 'Public Holiday').trim() || 'Public Holiday'
        }
      }
      holidaysByDate.value = map
      syncedAt.value = data?.syncedAt ?? null
    } catch (error) {
      console.error('Failed to load Hong Kong public holidays:', error)
      holidaysByDate.value = {}
      syncedAt.value = null
    } finally {
      loading.value = false
    }
  }

  function isPublicHoliday (dateLike) {
    const ymd = formatDateYmd(dateLike)
    return Boolean(ymd && holidaysByDate.value[ymd])
  }

  function getHolidaySummary (dateLike) {
    const ymd = formatDateYmd(dateLike)
    return ymd ? (holidaysByDate.value[ymd] || '') : ''
  }

  return {
    holidaysByDate,
    syncedAt,
    loading,
    loadHolidays,
    isPublicHoliday,
    getHolidaySummary,
    formatDateYmd
  }
}
