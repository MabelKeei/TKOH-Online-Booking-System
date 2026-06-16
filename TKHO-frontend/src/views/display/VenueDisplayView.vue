<template>
  <div class="display-container">
    <div class="display-above-footer">
      <!-- Header -->
      <div class="display-header">
        <div class="date-time">
          <span class="date">{{ currentDate }}</span>
          <span class="time">{{ currentTime }}</span>
        </div>
        <img v-if="displayType === 'merge' && qrCodeImage" :src="qrCodeImage" alt="QR Code" class="header-qr" />
      </div>

      <!-- Main content：在排除 footer 后的区域内垂直居中 -->
      <div class="display-content">
      <div v-if="currentEvent" class="event-info">
        <div class="event-time">
          <el-icon class="clock-icon"><Clock /></el-icon>
          <span>{{ currentEvent.startTime }} - {{ currentEvent.endTime }}</span>
        </div>
        <div class="event-topic">{{ currentEvent.topic }}</div>
        <div v-if="currentEvent.reservedBy || eventAttendeeCount" class="event-organizer">
          <span v-if="currentEvent.reservedBy">{{ currentEvent.reservedBy }}</span>
          <template v-if="currentEvent.reservedBy && eventAttendeeCount">
            <span class="organizer-sep"> | </span>
          </template>
          <span v-if="eventAttendeeCount" class="event-attendees">
            <el-icon class="person-icon"><User /></el-icon>
            <span class="attendee-count">{{ eventAttendeeCount }}</span>
          </span>
        </div>
      </div>
      <div v-else class="no-events">
        <div class="no-events-text-en">NO EVENTS</div>
        <div class="no-events-text-zh">沒有活動</div>
      </div>
    </div>
    </div>

    <!-- Footer -->
    <div class="display-footer">
      <div class="venue-info-row">
        <span v-if="venueName" class="venue-name">{{ venueName }}</span>
        <span v-if="venueName && venueLocation" class="separator">|</span>
        <span v-if="venueLocation" class="venue-location">{{ venueLocation }}</span>
      </div>
      <div v-if="venueNameZh || venueLocationZh" class="venue-info-row">
        <span v-if="venueNameZh" class="venue-name-zh">{{ venueNameZh }}</span>
        <span v-if="venueNameZh && venueLocationZh" class="separator">|</span>
        <span v-if="venueLocationZh" class="venue-location-zh">{{ venueLocationZh }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  getVenueMergePublicDisplay,
  getVenuePublicDisplay
} from '@/api/venueManagement'
import {
  getAppDisplayDateTimeParts,
  msUntilNextAppMinute,
  todayYmdInAppTimeZone
} from '@/utils/appTimezone'

const route = useRoute()
const DISPLAY_SCALE = 1.8
const DATA_POLL_MS = 20_000

const venueId = ref(route.query.venueId)
const displayType = ref(route.query.displayType || 'single')

const currentDate = ref('')
const currentTime = ref('')

const venueName = ref('')
const venueNameZh = ref('')
const venueLocation = ref('')
const venueLocationZh = ref('')
const qrCodeImage = ref('')

const allTodayEvents = ref([])
let lastDisplayYmd = ''

function parseHmToMinutes (hm) {
  const m = String(hm || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number.parseInt(m[1], 10)
  const min = Number.parseInt(m[2], 10)
  if (Number.isNaN(h) || Number.isNaN(min)) return null
  return h * 60 + min
}

/** 僅展示當前時刻正在進行的活動（含起止時刻） */
const currentEvent = computed(() => {
  const nowMin = parseHmToMinutes(currentTime.value)
  if (nowMin == null) return null

  const matches = allTodayEvents.value.filter((ev) => {
    const start = parseHmToMinutes(ev.startTime)
    const end = parseHmToMinutes(ev.endTime)
    if (start == null || end == null) return false
    return nowMin >= start && nowMin <= end
  })

  if (!matches.length) return null
  return matches.sort(
    (a, b) => (parseHmToMinutes(a.startTime) ?? 0) - (parseHmToMinutes(b.startTime) ?? 0)
  )[0]
})

const eventAttendeeCount = computed(() => {
  const n = Number(currentEvent.value?.attendees)
  return Number.isFinite(n) && n > 0 ? n : null
})

function applyPanelTitleFooter (panelTitleText) {
  const lines = String(panelTitleText || '').split('\n').map(s => s.trim()).filter(Boolean)
  if (lines[0]) venueName.value = lines[0]
  if (lines[1]) venueNameZh.value = lines[1]
}

function applyVenueInfo (venue) {
  if (!venue) return
  venueName.value = venue.name || ''
  venueNameZh.value = venue.nameZh || ''
  venueLocation.value = venue.location || ''
  venueLocationZh.value = venue.locationZh || ''
}

function updateDateTime () {
  const parts = getAppDisplayDateTimeParts()
  currentDate.value = `${parts.day}/${parts.month}/${parts.year} ${parts.weekdayEn} ${parts.weekdayZh}`
  currentTime.value = `${parts.hour}:${parts.minute}`

  const ymd = todayYmdInAppTimeZone()
  if (lastDisplayYmd && ymd !== lastDisplayYmd) {
    void refreshDisplayData()
  }
}

async function refreshDisplayData () {
  const date = todayYmdInAppTimeZone()

  if (displayType.value === 'merge') {
    const data = await getVenueMergePublicDisplay(date)
    const settings = data?.mergeDisplaySettings || {}
    applyPanelTitleFooter(settings.panelTitleText)
    qrCodeImage.value = settings.qrCodeImage || ''
    allTodayEvents.value = []
    lastDisplayYmd = date
    return
  }

  if (!venueId.value) {
    allTodayEvents.value = []
    lastDisplayYmd = date
    return
  }

  const data = await getVenuePublicDisplay(venueId.value, date)
  applyVenueInfo(data?.venue)
  qrCodeImage.value = ''
  allTodayEvents.value = Array.isArray(data?.events) ? data.events : []
  lastDisplayYmd = date
}

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
    /* 保留當前展示，下一輪輪詢重試 */
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

// Force fullscreen layout
function forceFullscreen() {
  const container = document.querySelector('.display-container')
  if (container) {
    container.style.setProperty('--display-scale', String(DISPLAY_SCALE))
    // Force dimensions
    const scaledSize = `${100 / DISPLAY_SCALE}%`
    const scaledViewport = `${100 / DISPLAY_SCALE}vw`
    const scaledViewportHeight = `${100 / DISPLAY_SCALE}vh`
    container.style.width = scaledSize
    container.style.height = scaledSize
    container.style.minWidth = scaledViewport
    container.style.minHeight = scaledViewportHeight
  }

  // Force body and html
  document.documentElement.style.width = '100%'
  document.documentElement.style.height = '100%'
  document.documentElement.style.margin = '0'
  document.documentElement.style.padding = '0'
  document.documentElement.style.overflow = 'hidden'

  document.body.style.width = '100%'
  document.body.style.height = '100%'
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  document.body.style.overflow = 'hidden'
}

onMounted(() => {
  void refreshDisplayData().catch(() => { /* 首次失敗仍顯示框架 */ })
  startClock()
  dataPollTimer = setInterval(pollDisplayDataFromServer, DATA_POLL_MS)
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)

  forceFullscreen()
  window.addEventListener('resize', forceFullscreen)

  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
})

onUnmounted(() => {
  stopClock()
  if (dataPollTimer) clearInterval(dataPollTimer)
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)

  window.removeEventListener('resize', forceFullscreen)

  // Restore styles
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  document.body.style.width = ''
  document.body.style.height = ''
  document.documentElement.style.width = ''
  document.documentElement.style.height = ''
})
</script>

<style scoped>
/* Force body and html to be full screen */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.display-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
  height: 50%;
  min-width: 50vw;
  min-height: 50vh;
  /* 稍微降低饱和度/亮度的橙色背景，接近原色但不荧光 */
  background: rgb(255, 153, 0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Arial Narrow', Arial, sans-serif;
  transform: scale(var(--display-scale, 2));
  transform-origin: top left;
  /* Prevent text selection */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  /* Prevent touch actions that might cause zoom */
  touch-action: none;
  -webkit-touch-callout: none;
  /* Keep plain scale to avoid text ghosting at non-integer ratios */
  -webkit-transform: scale(var(--display-scale, 2));
}

/* Prevent zoom on double tap */
* {
  touch-action: manipulation;
}

.display-above-footer {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-areas: 'stack';
}

.display-header {
  grid-area: stack;
  align-self: start;
  justify-self: stretch;
  z-index: 1;
  padding: 0.5rem 0.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.date-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #111111;
  flex: 1;
  min-width: 0;
}

.header-qr {
  width: 72px;
  height: 72px;
  margin-left: 0.75rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.18);
  object-fit: cover;
  flex-shrink: 0;
}

.date {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.time {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.display-content {
  grid-area: stack;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  padding: 1rem 1.25rem;
  overflow: hidden;
  min-height: 0;
}

/* 竖屏：整块活动信息垂直居中，内部文字左对齐 */
.event-info {
  width: 100%;
  padding: 0 2.25rem;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.event-time,
.event-topic,
.event-organizer {
  width: 100%;
  text-align: left;
}

.event-time {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 2.2rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: 0.85rem;
  letter-spacing: 0.02em;
}

.clock-icon {
  font-size: 1.1em;
  flex-shrink: 0;
  color: #111111;
}

.event-topic {
  font-size: 3rem;
  font-weight: 700;
  color: #111111;
  line-height: 1.22;
  margin-bottom: 0.85rem;
  word-break: break-word;
}

.event-organizer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem;
  font-size: 1.9rem;
  color: #333333;
  font-weight: 500;
}

.organizer-sep {
  color: #333333;
  font-weight: 500;
}

.event-attendees {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.person-icon {
  font-size: 1em;
  flex-shrink: 0;
  color: #333333;
}

.attendee-count {
  font-size: inherit;
  font-weight: 500;
}

.no-events {
  flex-shrink: 0;
  text-align: center;
  color: #111111;
}

.no-events-text-en {
  font-size: 2rem;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.no-events-text-zh {
  font-size: 2rem;
  font-weight: 600;
  line-height: 0.8;
  letter-spacing: 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.display-footer {
  padding: 0.5rem 0.5rem;
  /* 比当前再浅一些、接近原始蓝但不荧光 */
  background: rgb(240, 240, 240);
  /* border-top: 2px solid rgba(0, 0, 0, 0.15); */
  text-align: left;
  flex-shrink: 0;
}

.venue-info-row {
  display: flex;
  align-items: center;
  color: #111111;
  margin-bottom: 0.25rem;
}

.venue-info-row:last-child {
  margin-bottom: 0;
}

.venue-name,
.venue-location {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.venue-name-zh,
.venue-location-zh {
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.separator {
  margin: 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
}

.venue-info-row:last-child .separator {
  font-size: 1.1rem;
}

/* Responsive adjustments for different screen sizes */
@media (max-width: 768px) {
  .date {
    font-size: 1.125rem;
  }

  .time {
    font-size: 1.5rem;
  }

  .header-qr {
    width: 48px;
    height: 48px;
  }

  .no-events-text-en {
    font-size: 2.5rem;
  }

  .no-events-text-zh {
    font-size: 2rem;
  }

  .venue-name,
  .venue-location {
    font-size: 1.6rem;
  }

  .venue-name-zh,
  .venue-location-zh {
    font-size: 1.6rem;
  }

  .separator {
    font-size: 1.5rem;
    margin: 0 0.5rem;
  }

  .venue-info-row:last-child .separator {
    font-size: 1.125rem;
  }
}

/* Ensure content fits on very small screens */
@media (max-height: 600px) {
  .display-header {
    padding: 0.5rem 0.5rem;
  }

  .display-footer {
    padding: 0.5rem 0.5rem;
  }

  .display-content {
    padding: 0.75rem 1rem 1rem;
  }

  .event-info {
    padding: 0 1.75rem;
  }

  .event-time {
    font-size: 1.8rem;
  }

  .event-topic {
    font-size: 2.35rem;
  }

  .event-organizer {
    font-size: 1.6rem;
  }
}
</style>
