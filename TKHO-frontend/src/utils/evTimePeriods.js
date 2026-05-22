import { getEvTimePeriods } from '@/api/evManagement'
import { getMockEVTimePeriods } from '@/mocks/mockData'

export function formatTimePeriodOptionLabel(item) {
  const name = item?.period || ''
  const start = item?.startTime || ''
  const end = item?.endTime || ''
  if (start && end) return `${name} (${start} - ${end})`
  return name
}

export function mapEvTimePeriodForUi(row) {
  return {
    id: String(row.id),
    period: row.period,
    startTime: row.startTime,
    endTime: row.endTime,
    status: row.status,
    label: formatTimePeriodOptionLabel(row)
  }
}

export async function fetchActiveEvTimePeriods() {
  try {
    const data = await getEvTimePeriods()
    const list = Array.isArray(data) ? data : []
    return list
      .filter((item) => String(item.status || 'active').toLowerCase() === 'active')
      .map(mapEvTimePeriodForUi)
  } catch {
    return getMockEVTimePeriods()
      .filter((item) => String(item.status || 'active').toLowerCase() === 'active')
      .map(mapEvTimePeriodForUi)
  }
}
