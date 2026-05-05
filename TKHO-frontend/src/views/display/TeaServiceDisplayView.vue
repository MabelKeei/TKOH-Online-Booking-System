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

      <div v-if="teaRequests.length === 0" class="empty-state">
        {{ t.empty }}
      </div>

      <div v-else class="list-body">
        <div v-for="(dateGroup, dateIdx) in groupedByDate" :key="dateGroup.date" class="date-section">
          <div class="date-divider" :class="dateGroup.colorScheme">
            <span class="date-label">{{ formatDateLabel(dateGroup.date) }}</span>
          </div>

          <div v-for="(venueGroup, venueIdx) in dateGroup.venues" :key="venueGroup.venueName"
               class="venue-group"
               :class="[dateGroup.colorScheme, `venue-${venueIdx}`]">
            <template v-if="venueGroup.hasRequests">
              <div
                v-for="(request, idx) in venueGroup.requests"
                :key="request.id"
                class="request-row"
                :class="{ completed: request.completed, 'first-row': idx === 0 }"
                @click="toggleRequest(request)"
              >
                <div class="col-venue">
                  <span v-if="idx === 0" class="venue-name">{{ venueGroup.venueName }}</span>
                </div>

                <div class="col-time">{{ request.time }}</div>

                <div class="col-details">
                  {{ formatTeaDetails(request.teaService) }}
                </div>

                <div class="col-done">
                  <el-checkbox
                    :model-value="request.completed"
                    size="large"
                    @click.stop
                    @change="(val) => setRequestCompleted(request, val)"
                  />
                </div>
              </div>
            </template>
            <template v-else>
              <div class="request-row no-request" :class="{ completed: getNoRequestCompleted(dateGroup.date, venueGroup.venueName) }" @click="toggleNoRequest(dateGroup.date, venueGroup.venueName)">
                <div class="col-venue">
                  <span class="venue-name">{{ venueGroup.venueName }}</span>
                </div>
                <div class="col-time"></div>
                <div class="col-details">X</div>
                <div class="col-done">
                  <el-checkbox
                    :model-value="getNoRequestCompleted(dateGroup.date, venueGroup.venueName)"
                    size="large"
                    @click.stop
                    @change="(val) => setNoRequestCompleted(dateGroup.date, venueGroup.venueName, val)"
                  />
                </div>
              </div>
            </template>
          </div>

          <div v-if="dateIdx < groupedByDate.length - 1" class="completed-banner">完</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getMockTeaServiceRequests, setMockTeaServiceRequestCompleted } from '@/mocks/mockData'

const language = ref('zh-Hant') // Fixed to Traditional Chinese
const currentDate = ref('')
const currentTime = ref('')
const teaRequests = ref([])
const noRequestCompleted = ref({})
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
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const weekdayEn = now.toLocaleDateString('en-US', { weekday: 'long' })
  const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekdayZh = weekdaysZh[now.getDay()]
  currentDate.value = `${day}/${month}/${year} ${weekdayEn} ${weekdayZh}`
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function parseStartTime (timeStr) {
  if (!timeStr) return ''
  return timeStr.split('-')[0].trim()
}

const groupedByDate = computed(() => {
  const FIXED_VENUES = ['會議室1', '會議室2', '會議室3', '演講廳']
  const dateGroups = new Map()

  for (const request of teaRequests.value) {
    if (!dateGroups.has(request.date)) {
      dateGroups.set(request.date, [])
    }
    dateGroups.get(request.date).push(request)
  }

  const result = []
  let dateIndex = 0

  for (const [date, requests] of dateGroups) {
    const venueGroups = new Map()

    for (const request of requests) {
      const venueName = request.venueNameZh || request.venueName || '-'
      if (!venueGroups.has(venueName)) {
        venueGroups.set(venueName, [])
      }
      venueGroups.get(venueName).push(request)
    }

    const venues = []
    for (const fixedVenue of FIXED_VENUES) {
      if (venueGroups.has(fixedVenue)) {
        const venueRequests = venueGroups.get(fixedVenue)
        venueRequests.sort((a, b) => {
          return parseStartTime(a.time).localeCompare(parseStartTime(b.time))
        })
        venues.push({ venueName: fixedVenue, requests: venueRequests, hasRequests: true })
      } else {
        venues.push({ venueName: fixedVenue, requests: [], hasRequests: false })
      }
    }

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

function formatDateLabel (dateStr) {
  let displayDate = dateStr
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-')
    displayDate = `${month}/${day}/${year}`
  }

  const now = new Date()
  const today = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${String(tomorrow.getMonth() + 1).padStart(2, '0')}/${String(tomorrow.getDate()).padStart(2, '0')}/${tomorrow.getFullYear()}`

  if (displayDate === today) {
    return `${displayDate} (今天)`
  } else if (displayDate === tomorrowStr) {
    return `${displayDate} (明天)`
  }

  return displayDate
}

function loadRequests () {
  teaRequests.value = getMockTeaServiceRequests()
}

function setRequestCompleted (request, completed) {
  teaRequests.value = setMockTeaServiceRequestCompleted(request.bookingId, Boolean(completed))
}

function toggleRequest (request) {
  setRequestCompleted(request, !request.completed)
}

function getNoRequestCompleted (date, venueName) {
  const key = `${date}-${venueName}`
  return noRequestCompleted.value[key] || false
}

function setNoRequestCompleted (date, venueName, completed) {
  const key = `${date}-${venueName}`
  noRequestCompleted.value[key] = completed
}

function toggleNoRequest (date, venueName) {
  setNoRequestCompleted(date, venueName, !getNoRequestCompleted(date, venueName))
}

let timer = null
onMounted(() => {
  updateDateTime()
  loadRequests()
  timer = setInterval(updateDateTime, 60000)
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
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
  grid-template-columns: 1.2fr 1.5fr 3fr 1fr;
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
  grid-template-columns: 1.2fr 1.5fr 3fr 1fr;
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

.col-venue {
  text-align: center;
}

.col-time {
  font-weight: 600;
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

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: #666;
}
</style>
