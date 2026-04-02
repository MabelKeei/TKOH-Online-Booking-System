<template>
  <div class="tea-board-root">
    <div class="tea-board-header">
      <div class="header-title-wrap">
        <div class="header-title">{{ t.title }}</div>
      </div>
      <div class="header-time-wrap">
        <div class="header-date">{{ currentDate }}</div>
        <div class="header-time">{{ currentTime }}</div>
      </div>
      <div class="header-lang-switch">
        <button class="lang-btn" @click="toggleLanguage">{{ language === 'zh-Hant' ? 'EN' : '繁中' }}</button>
      </div>
    </div>

    <div class="tea-board-content">
      <div class="list-header">
        <div>{{ t.done }}</div>
        <div>{{ t.time }}</div>
        <div>{{ t.venue }}</div>
        <div>{{ t.details }}</div>
      </div>

      <div v-if="teaRequests.length === 0" class="empty-state">
        {{ t.empty }}
      </div>

      <div v-else class="list-body">
        <div v-for="group in groupedRequests" :key="group.date" class="date-group">
          <div class="date-divider">
            <span class="date-label">{{ group.date }}</span>
          </div>
          <div
            v-for="request in group.requests"
            :key="request.id"
            class="request-row"
            :class="{ completed: request.completed }"
            @click="toggleRequest(request)"
          >
            <div class="done-col">
              <el-checkbox
                :model-value="request.completed"
                size="large"
                @click.stop
                @change="(val) => setRequestCompleted(request, val)"
              />
            </div>

            <div class="time-col">
              <div>{{ request.time }}</div>
            </div>

            <div class="venue-col">
              <div class="venue-en">{{ getVenueDisplayName(request) }}</div>
            </div>

            <div class="service-col">
              <div><strong>{{ t.attendees }}:</strong> {{ request.teaService?.attendees ?? '-' }}</div>
              <div><strong>{{ t.beverages }}:</strong> {{ request.teaService?.beverages || '-' }}</div>
              <div><strong>{{ t.service }}:</strong> {{ getServeModeText(request.teaService) }}</div>
              <div v-if="request.teaService?.notes"><strong>{{ t.notes }}:</strong> {{ request.teaService.notes }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getMockTeaServiceRequests, setMockTeaServiceRequestCompleted } from '@/mocks/mockData'

const language = ref('zh-Hant')
const currentDate = ref('')
const currentTime = ref('')
const teaRequests = ref([])
const I18N = {
  'zh-Hant': {
    title: '茶水服務工作',
    done: '完成',
    venue: '場地',
    time: '時間',
    details: '茶水需求',
    empty: '暫時沒有茶水服務需求',
    service: '服務方式',
    attendees: '人數',
    beverages: '飲品',
    notes: '備註',
    perPot: '壺',
    perPersonCup: '每人一杯'
  },
  en: {
    title: 'Tea Service Task',
    done: 'Done',
    venue: 'Venue',
    time: 'Time',
    details: 'Tea Service Details',
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

function parseDateTimeKey (item) {
  return `${item.date || ''} ${item.time?.split('-')?.[0] || ''}`.trim()
}

const groupedRequests = computed(() => {
  const sorted = [...teaRequests.value].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return parseDateTimeKey(a).localeCompare(parseDateTimeKey(b))
  })

  const groups = []
  let currentDate = null
  let currentGroup = null

  for (const request of sorted) {
    if (request.date !== currentDate) {
      currentDate = request.date
      currentGroup = { date: currentDate, requests: [] }
      groups.push(currentGroup)
    }
    currentGroup.requests.push(request)
  }

  return groups
})

function getServeModeText (teaService) {
  if (!teaService) return '-'
  const qty = teaService.quantity ?? '-'
  if (teaService.serveAs === 'pot') {
    return language.value === 'zh-Hant' ? `${qty}${t.value.perPot}` : `${qty} ${t.value.perPot}`
  }
  if (teaService.serveAs === 'perPersonCup') {
    return language.value === 'zh-Hant'
      ? `${t.value.perPersonCup}（共 ${qty} 杯）`
      : `${t.value.perPersonCup} (total ${qty} cups)`
  }
  return '-'
}

function getVenueDisplayName (request) {
  if (language.value === 'zh-Hant') {
    return request.venueNameZh || request.venueName || '-'
  }
  return request.venueName || request.venueNameZh || '-'
}

function toggleLanguage () {
  language.value = language.value === 'zh-Hant' ? 'en' : 'zh-Hant'
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
  background: #0f1d66;
  color: #ffffff;
  overflow: hidden;
}

.tea-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f7a23a;
  color: #102a80;
}

.header-title {
  font-size: 1.45rem;
  font-weight: 800;
}

.header-subtitle {
  font-size: 1.05rem;
  font-weight: 700;
}

.header-time-wrap {
  text-align: right;
  font-weight: 700;
  margin-left: auto;
  margin-right: 16px;
}

.header-lang-switch {
  display: inline-flex;
  gap: 6px;
}

.lang-btn {
  min-width: 64px;
  border: 1px solid rgba(16, 42, 128, 0.35);
  border-radius: 999px;
  background: #102a80;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 4px 10px;
  cursor: pointer;
}

.lang-btn:hover {
  opacity: 0.9;
}

.header-date {
  font-size: 1.1rem;
}

.header-time {
  font-size: 1.2rem;
  line-height: 1;
}

.tea-board-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 10px 12px 12px;
}

.list-header,
.request-row {
  display: grid;
  grid-template-columns: 54px minmax(120px, auto) 1fr 2fr;
  gap: 10px;
  align-items: start;
}

.list-header {
  padding: 8px 10px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #8de8ff;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

/* .list-header > div {
  text-align: center;
} */

.list-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.request-row {
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 6px;
  transition: all 0.3s ease;
}

.request-row:hover {
  background: rgba(255, 255, 255, 0.08);
}

.request-row.completed {
  background: rgba(0, 0, 0, 0.35);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  opacity: 0.6;
}

.request-row.completed .venue-col,
.request-row.completed .time-col,
.request-row.completed .service-col {
  color: #a0aec0;
  text-decoration: line-through;
}

.done-col {
  padding-top: 2px;
}

.venue-en {
  font-size: 1.2rem;
  font-weight: 700;
}

.time-col,
.service-col {
  line-height: 1.35;
}

.time-col {
  white-space: nowrap;
}

.empty-state {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #dbeafe;
}

.date-group {
  margin-bottom: 16px;
}

.date-divider {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  margin: 0 0 8px;
  padding: 8px 10px;
  background: #0f1d66;
}

.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, rgba(141, 232, 255, 0.3), rgba(141, 232, 255, 0.6));
}

.date-divider::after {
  background: linear-gradient(to left, rgba(141, 232, 255, 0.3), rgba(141, 232, 255, 0.6));
}

.date-label {
  padding: 4px 16px;
  font-size: 1.15rem;
  font-weight: 800;
  color: #8de8ff;
  background: rgba(141, 232, 255, 0.15);
  border-radius: 20px;
  margin: 0 12px;
  white-space: nowrap;
}
</style>
