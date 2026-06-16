<template>
  <div class="tea-board-root">
    <div class="tea-board-header">
      <div class="header-title">{{ t.title }}</div>
      <div class="header-datetime">
        <span class="header-date">{{ currentDate }}</span>
        <span class="header-time">{{ currentTime }}</span>
      </div>
    </div>

    <div class="tea-board-content">
      <div class="list-header">
        <div class="col-venue">{{ t.venue }}</div>
        <div class="col-time">{{ t.time }}</div>
        <div class="col-details">{{ t.details }}</div>
        <div class="col-done">{{ t.done }}</div>
      </div>

      <div class="list-body">
        <div v-for="(dateGroup, dateIdx) in groupedByDate" :key="dateGroup.date" class="date-section">
          <div class="date-divider" :class="dateGroup.colorScheme">
            <span class="date-label">{{ formatDateLabel(dateGroup.date) }}</span>
          </div>

          <div
            v-for="(venueGroup, venueIdx) in dateGroup.venues"
            :key="`${dateGroup.date}-${venueGroup.venueKey}`"
            class="venue-group"
            :class="[dateGroup.colorScheme, `venue-${venueIdx % 4}`]"
          >
            <div
              v-for="(request, idx) in venueGroup.requests"
              :key="`${request.bookingId || request.id}-${idx}`"
              class="request-row"
              :class="{
                completed: request.completed,
                'first-row': idx === 0,
                'continuation-row': idx > 0
              }"
              @click="toggleRequest(request)"
            >
              <div class="col-venue">
                <span v-if="idx === 0" class="venue-name">{{ venueGroup.venueName }}</span>
              </div>

              <div class="col-time">
                <span class="period-label">{{ periodLabelZh(request.time) }}</span>
                <span class="time-range">{{ request.time }}</span>
              </div>

              <div class="col-details">
                {{ formatTeaDetails(request.teaService) }}
              </div>

              <div class="col-done" @click.stop>
                <el-checkbox
                  :model-value="request.completed"
                  size="large"
                  @update:model-value="(val) => setRequestCompleted(request, val)"
                />
              </div>
            </div>
          </div>

          <div class="completed-banner">完</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  getTeaServicePublicDisplay,
  setTeaServiceRequestCompleted
} from '@/api/venueManagement'
import {
  getAppDisplayDateTimeParts,
  msUntilNextAppMinute,
  todayYmdInAppTimeZone
} from '@/utils/appTimezone'

const language = ref('zh-Hant') // Fixed to Traditional Chinese
const currentDate = ref('')
const currentTime = ref('')
const teaRequests = ref([])
let lastDisplayFromDate = ''
const I18N = {
  'zh-Hant': {
    title: '茶水服務',
    done: '完成',
    venue: '場地',
    time: '時間',
    details: '茶水/人數',
    empty: '暫時沒有茶水服務需求',
    service: '服務方式',
    attendees: '人數',
    beverages: '飲品',
    notes: '備註',
    perPot: '壺',
    perPersonCup: '每人一杯'
  },
  en: {
    title: 'Tea Service',
    done: 'Done',
    venue: 'Venue',
    time: 'Time',
    details: 'Tea/Attendees',
    empty: 'No tea service requests for now',
    service: 'Service',
    attendees: 'Attendees',
    beverages: 'Beverages',
    notes: 'Notes',
    perPot: 'pot(s)',
    perPersonCup: 'per person 1 cup'
  }
}
const t = computed(() => I18N[language.value] || I18N['zh-Hant'])

function updateDateTime () {
  const parts = getAppDisplayDateTimeParts()
  currentDate.value = `${parts.day}/${parts.month}/${parts.year} ${parts.weekdayEn} ${parts.weekdayZh}`
  currentTime.value = `${parts.hour}:${parts.minute}`

  const fromDate = todayYmdInAppTimeZone()
  if (lastDisplayFromDate && fromDate !== lastDisplayFromDate) {
    void refreshDisplayData()
  }
}

function parseStartTime (timeStr) {
  if (!timeStr) return ''
  return timeStr.split('-')[0].trim()
}

/** 依起始時間區分上午（12:00 前）／下午（12:00 含以後），與展示板一致 */
function periodLabelZh (timeStr) {
  const start = parseStartTime(timeStr)
  if (!start) return ''
  const m = start.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return ''
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (Number.isNaN(h) || Number.isNaN(min)) return ''
  const minutes = h * 60 + min
  return minutes < 12 * 60 ? '上午' : '下午'
}

function compareVenueId (a, b) {
  const sa = String(a ?? '')
  const sb = String(b ?? '')
  if (/^\d+$/.test(sa) && /^\d+$/.test(sb)) {
    const diff = BigInt(sa) - BigInt(sb)
    return diff < 0n ? -1 : diff > 0n ? 1 : 0
  }
  return sa.localeCompare(sb)
}

function buildVenueRowsForDate (requests) {
  const buckets = new Map()

  for (const request of requests) {
    const venueId = String(request.venueId || '')
    const venueKey = venueId || String(request.venueNameZh || request.venueName || '')
    const venueName = request.venueNameZh || request.venueName || '-'
    if (!venueKey) continue
    if (!buckets.has(venueKey)) {
      buckets.set(venueKey, { venueKey, venueId, venueName, requests: [] })
    }
    buckets.get(venueKey).requests.push(request)
  }

  return [...buckets.values()]
    .map(group => {
      group.requests.sort((a, b) => parseStartTime(a.time).localeCompare(parseStartTime(b.time)))
      return group
    })
    .sort((a, b) => compareVenueId(a.venueId || a.venueKey, b.venueId || b.venueKey))
}

const groupedByDate = computed(() => {
  const dateGroups = new Map()

  for (const request of teaRequests.value) {
    if (!dateGroups.has(request.date)) {
      dateGroups.set(request.date, [])
    }
    dateGroups.get(request.date).push(request)
  }

  if (!dateGroups.size) {
    const today = todayYmdInAppTimeZone()
    dateGroups.set(today, [])
  }

  const result = []
  let dateIndex = 0

  for (const [date, requests] of dateGroups) {
    const venues = buildVenueRowsForDate(requests)
    const completedCount = requests.filter(r => r.completed).length
    const colorScheme = dateIndex % 2 === 0 ? 'blue' : 'purple'

    result.push({ date, venues, completedCount, colorScheme })
    dateIndex++
  }

  return result
})

function formatTeaDetails (teaService) {
  if (!teaService) return '-'

  let result = ''

  if (teaService.beverages) {
    result = teaService.beverages
  }

  if (teaService.attendees) {
    result += result ? ` / ${teaService.attendees}` : teaService.attendees
  }

  if (teaService.notes) {
    result += result ? ` (${teaService.notes})` : `(${teaService.notes})`
  }

  return result || '-'
}

function formatSlashDateFromYmd (ymd) {
  if (!ymd || !ymd.includes('-')) return ymd
  const [year, month, day] = ymd.split('-')
  return `${month}/${day}/${year}`
}

function addDaysToYmd (ymd, days) {
  const dt = new Date(`${ymd}T00:00:00.000Z`)
  dt.setUTCDate(dt.getUTCDate() + days)
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateLabel (dateStr) {
  const displayDate = formatSlashDateFromYmd(dateStr)
  const todayYmd = todayYmdInAppTimeZone()
  const todaySlash = formatSlashDateFromYmd(todayYmd)
  const tomorrowSlash = formatSlashDateFromYmd(addDaysToYmd(todayYmd, 1))

  if (displayDate === todaySlash) {
    return `${displayDate} (今天)`
  }
  if (displayDate === tomorrowSlash) {
    return `${displayDate} (明天)`
  }

  return displayDate
}

/** 打勾請求進行中，避免輪詢覆蓋樂觀更新 */
const pendingCompletedUpdates = new Map()
const completingBookingIds = new Set()

function patchRequestInList (bookingId, completed) {
  const id = String(bookingId)
  const idx = teaRequests.value.findIndex(item => String(item.bookingId || item.id) === id)
  if (idx < 0) return
  teaRequests.value = [
    ...teaRequests.value.slice(0, idx),
    { ...teaRequests.value[idx], completed: Boolean(completed) },
    ...teaRequests.value.slice(idx + 1)
  ]
}

function mergePendingCompleted (requests) {
  if (!pendingCompletedUpdates.size) return requests
  return requests.map((row) => {
    const id = String(row.bookingId || row.id)
    const pending = pendingCompletedUpdates.get(id)
    return pending !== undefined ? { ...row, completed: pending } : row
  })
}

async function refreshDisplayData () {
  const fromDate = todayYmdInAppTimeZone()
  const data = await getTeaServicePublicDisplay(fromDate)
  const requests = Array.isArray(data?.requests) ? data.requests : []
  teaRequests.value = mergePendingCompleted(requests)
  lastDisplayFromDate = fromDate
}

async function setRequestCompleted (request, completed) {
  const bookingId = String(request.bookingId || request.id)
  if (!bookingId) return

  const normalized = Boolean(completed)
  const idx = teaRequests.value.findIndex(item => String(item.bookingId || item.id) === bookingId)
  const previous = idx >= 0 ? Boolean(teaRequests.value[idx].completed) : Boolean(request.completed)
  if (previous === normalized || completingBookingIds.has(bookingId)) return

  completingBookingIds.add(bookingId)
  pendingCompletedUpdates.set(bookingId, normalized)
  patchRequestInList(bookingId, normalized)

  try {
    const data = await setTeaServiceRequestCompleted(bookingId, normalized)
    const next = data?.request
    if (next) {
      patchRequestInList(bookingId, next.completed)
    } else {
      await refreshDisplayData()
    }
  } catch {
    patchRequestInList(bookingId, previous)
  } finally {
    completingBookingIds.delete(bookingId)
    pendingCompletedUpdates.delete(bookingId)
  }
}

function toggleRequest (request) {
  setRequestCompleted(request, !request.completed)
}

/** 展示数据轮询（标签可见时），茶水需求变更后自动上屏 */
const DATA_POLL_MS = 20_000

let clockTimer = null
let dataPollTimer = null
let dataPollInFlight = false

function scheduleClockTick () {
  clockTimer = setTimeout(() => {
    updateDateTime()
    scheduleClockTick()
  }, msUntilNextAppMinute())
}

function stopClock () {
  if (clockTimer) {
    clearTimeout(clockTimer)
    clockTimer = null
  }
}

function startClock () {
  stopClock()
  updateDateTime()
  scheduleClockTick()
}

async function pollDisplayDataFromServer () {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return
  }
  if (dataPollInFlight) return
  dataPollInFlight = true
  try {
    await refreshDisplayData()
  } catch {
    /* 保留上一屏数据，下一轮轮询重试 */
  } finally {
    dataPollInFlight = false
  }
}

function onDocumentVisibilityChange () {
  if (document.visibilityState === 'visible') {
    startClock()
    void pollDisplayDataFromServer()
  }
}

onMounted(async () => {
  try {
    await refreshDisplayData()
  } catch {
    teaRequests.value = []
    lastDisplayFromDate = todayYmdInAppTimeZone()
  }
  startClock()
  dataPollTimer = setInterval(pollDisplayDataFromServer, DATA_POLL_MS)
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  stopClock()
  if (dataPollTimer) clearInterval(dataPollTimer)
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
})
</script>

<style scoped>
.tea-board-root {
  position: fixed;
  inset: 0;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Arial Narrow', Arial, sans-serif;
  background: rgb(240, 240, 240);
  color: rgb(0, 0, 0);
  overflow: hidden;
}

.tea-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgb(255, 153, 0);
  color: rgb(0, 0, 0);
}

.header-title {
  font-size: 1.45rem;
  font-weight: 600;
}

.header-datetime {
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 600;
}

.header-date {
  font-size: 1.1rem;
}

.header-time {
  font-size: 1.2rem;
}

.tea-board-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.list-header {
  display: grid;
  grid-template-columns: 1.2fr 2fr 3fr 1fr;
  gap: 0;
  padding: 5px 10px;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: #4EA72E;
  text-align: center;
}

.list-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: white;
}

.date-section {
  margin-bottom: 0;
}

.date-divider {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  background: white;
}

.date-divider.blue::before,
.date-divider.blue::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #2196f3;
}

.date-divider.purple::before,
.date-divider.purple::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #9c27b0;
}

.date-label {
  padding: 4px 16px;
  font-size: 1.2rem;
  font-weight: 600;
  white-space: nowrap;
  margin: 0 12px;
}

.date-divider.blue .date-label {
  color: #2196f3;
}

.date-divider.purple .date-label {
  color: #9c27b0;
}

.venue-group {
  margin-bottom: 0;
}

.venue-group.blue.venue-0 {
  background: #61CBF4;
}

.venue-group.blue.venue-1 {
  background: #96DCF8;
}

.venue-group.blue.venue-2 {
  background: #CAEEFB;
}

.venue-group.blue.venue-3 {
  background: #FFFFFF;
}

.venue-group.purple.venue-0 {
  background: #D86ECC;
}

.venue-group.purple.venue-1 {
  background: #E59EDD;
}

.venue-group.purple.venue-2 {
  background: #F2CFEE;
}

.venue-group.purple.venue-3 {
  background: #FFFFFF;
}

.venue-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #000;
}

.request-row {
  display: grid;
  grid-template-columns: 1.2fr 2fr 3fr 1fr;
  gap: 0;
  padding: 4px 16px;
  cursor: pointer;
  transition: background 0.2s;
  text-align: center;
  align-items: center;
}

.request-row:hover {
  background: #d1e9ff;
}

.request-row.completed {
  color: #999;
}

.request-row.continuation-row {
  border-top: 1px solid rgba(0, 0, 0, 0.01);
}

.col-venue {
  text-align: center;
}

.col-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
}

.col-time .period-label {
  flex-shrink: 0;
  min-width: 2.25em;
  text-align: right;
}

.col-time .time-range {
  flex-shrink: 0;
}

.col-details {
  text-align: left;
  font-weight: 600;
}

.col-done {
  display: flex;
  justify-content: center;
  align-items: center;
}

.col-done :deep(.el-checkbox__inner) {
  border-radius: 2px;
  border-color: #000;
}

.col-done :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #fff;
  border-color: #000;
}

.col-done :deep(.el-checkbox__inner::after) {
  border-color: #000;
}

.completed-banner {
  padding: 5px 10px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: #4EA72E;
  margin: 0;
}

</style>
