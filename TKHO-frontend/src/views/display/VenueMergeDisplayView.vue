<template>
  <div class="merge-display-root">
    <div class="top-date-bar">
      <span>{{ currentDate }}</span>
      <span class="weekday-zh">{{ currentWeekdayZh }}</span>
    </div>

    <div class="main-panel">
      <img
        class="panel-qr"
        :src="qrCodeImage"
        alt=""
        width="60"
        height="60"
        decoding="async"
      />
      <div class="panel-top-row">
        <div class="time-line">{{ currentTime }}</div>
        <div class="panel-header">
          <div class="panel-title-wrap">
            <div class="panel-title-line">{{ panelTitleText }}</div>
          </div>
        </div>
      </div>

      <div class="schedule-header">
        <div class="slot-col room-col"></div>
        <div class="slot-col">AM上午</div>
        <div class="slot-col pm-col">PM下午</div>
      </div>

      <div class="schedule-body">
        <div v-for="row in visibleScheduleRows" :key="row.id" class="schedule-row" :data-row-id="row.id">
          <div class="room-col room-name">
            <span class="room-name-text">{{ row.room }}</span>
            <span class="room-indicator" :style="getArrowStyle(row.arrowDirection)" aria-hidden="true">➜</span>
          </div>
          <div class="slot-col">
            <div class="meeting-carousel" :data-key="`${row.id}-am`">
              <div class="meeting-track" :style="getMeetingTrackStyle(row.id, 'am')">
                <div v-for="item in row.am" :key="item.id" class="meeting-item">
                  <span class="meeting-time">{{ item.time }}</span>
                  <span class="meeting-title">{{ item.title }}</span>
                </div>
              </div>
              <div v-if="row.am.length === 0" class="meeting-placeholder">-</div>
            </div>
          </div>
          <div class="slot-col pm-col">
            <div class="meeting-carousel" :data-key="`${row.id}-pm`">
              <div class="meeting-track" :style="getMeetingTrackStyle(row.id, 'pm')">
                <div v-for="item in row.pm" :key="item.id" class="meeting-item">
                  <span class="meeting-time">{{ item.time }}</span>
                  <span class="meeting-title">{{ item.title }}</span>
                </div>
              </div>
              <div v-if="row.pm.length === 0" class="meeting-placeholder">-</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-ticker">
      <div class="ticker-track">
        <span class="ticker-text">{{ tickerText }}&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span class="ticker-text" aria-hidden="true">{{ tickerText }}&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { getMockVenueList, getMockDisplayConfig, getMockMeetingPendingList } from '@/mocks/mockData'

/** 与 VenueDisplayView.vue 保持一致，可整体缩放 */
const DISPLAY_SCALE = 1.8

const currentDate = ref('')
const currentWeekdayZh = ref('')
const currentTime = ref('')

/** public 目录静态资源，随 base 路径解析 */
const DEFAULT_QR_SRC = `${import.meta.env.BASE_URL}displayQRCode.png`
const qrCodeImage = ref(DEFAULT_QR_SRC)
const defaultPanelTitleText = 'Conference Room | 8/F Ambulatory Care Block\n會議室 | 日間醫療大樓8樓'
const panelTitleText = ref(defaultPanelTitleText)

const defaultTicker = '請在會議期間佩戴外科口罩並保持安靜。For enquiries regarding Conference Rooms, please contact General Office.'
const tickerText = ref(defaultTicker)

const scheduleRows = ref([])
const VENUE_PAGE_SIZE = 3
const AUTO_ROTATE_MS = 8000
const currentVenuePage = ref(0)
const meetingViewportMeta = ref({})
const currentMeetingPage = ref({})
const hasMeetingFlippedOnCurrentVenuePage = ref(false)

const totalVenuePages = computed(() => Math.max(1, Math.ceil(scheduleRows.value.length / VENUE_PAGE_SIZE)))
const visibleScheduleRows = computed(() => {
  const start = currentVenuePage.value * VENUE_PAGE_SIZE
  return scheduleRows.value.slice(start, start + VENUE_PAGE_SIZE)
})

const ARROW_ROTATION_MAP = {
  up: -90,
  'up-right': -45,
  right: 0,
  'down-right': 45,
  down: 90,
  'down-left': 135,
  left: 180,
  'up-left': -135
}

function updateDateTime () {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const weekdayEn = now.toLocaleDateString('en-US', { weekday: 'long' })
  const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentWeekdayZh.value = weekdaysZh[now.getDay()]
  currentDate.value = `${day}/${month}/${year} ${weekdayEn}`
  currentTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getStartMinutes (timeRange = '') {
  const [start = ''] = String(timeRange).split('-')
  const [h, m] = start.split(':').map(n => Number.parseInt(n, 10))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null
  return h * 60 + m
}

function buildScheduleRows () {
  const displayCfg = getMockDisplayConfig()
  const rules = displayCfg.venueRules || []
  const ruleByVenue = new Map(rules.map(r => [r.venueId, r]))
  const mergeRules = rules.filter(r => r.displayType === 'merge')
  const venueList = getMockVenueList()
  let mergedVenues = mergeRules
    .map(r => venueList.find(v => v.id === r.venueId))
    .filter(Boolean)
  if (mergedVenues.length === 0) {
    mergedVenues = venueList.filter(v => v.displayType === 'merge')
  }

  const pendingMeetings = getMockMeetingPendingList()

  scheduleRows.value = mergedVenues.map((venue, idx) => {
    const rule = ruleByVenue.get(venue.id)
    const displayName = (rule?.displayName && String(rule.displayName).trim()) || `CR${idx + 1}`
    const arrowDirection = rule?.arrowDirection || 'right'
    const venueMeetings = pendingMeetings
      .filter(item => item.venueId === venue.id)
      .map(item => ({
        id: item.bookingId || item.id,
        startMinutes: getStartMinutes(item.time),
        time: item.time,
        title: item.meetingTitle
      }))
      .sort((a, b) => (a.startMinutes ?? 9999) - (b.startMinutes ?? 9999))

    return {
      id: venue.id,
      room: displayName,
      arrowDirection,
      // 13:00 前算 AM；13:00(含) 后算 PM
      am: venueMeetings.filter(item => (item.startMinutes ?? 9999) < (13 * 60)),
      pm: venueMeetings.filter(item => (item.startMinutes ?? 0) >= (13 * 60))
    }
  })
}

function getArrowStyle (direction) {
  const deg = ARROW_ROTATION_MAP[direction] ?? 0
  return {
    transform: `rotate(${deg}deg)`
  }
}

function getMeetingKey (rowId, period) {
  return `${rowId}-${period}`
}

function getMeetingTrackStyle (rowId, period) {
  const key = getMeetingKey(rowId, period)
  const meta = meetingViewportMeta.value[key]
  const page = currentMeetingPage.value[key] || 0
  const offset = (meta?.viewportHeight || 0) * page
  return {
    transform: `translateY(-${offset}px)`
  }
}

async function measureMeetingViewports () {
  await nextTick()
  const containers = Array.from(document.querySelectorAll('.meeting-carousel'))
  const nextMeta = {}
  containers.forEach((el) => {
    const key = el.getAttribute('data-key')
    if (!key) return
    const viewportHeight = el.clientHeight
    const track = el.querySelector('.meeting-track')
    const contentHeight = track ? track.scrollHeight : 0
    const pageCount = viewportHeight > 0 ? Math.max(1, Math.ceil(contentHeight / viewportHeight)) : 1
    nextMeta[key] = { viewportHeight, pageCount }
  })
  meetingViewportMeta.value = nextMeta

  const nextPages = {}
  for (const [key, meta] of Object.entries(nextMeta)) {
    const old = currentMeetingPage.value[key] || 0
    nextPages[key] = old % Math.max(1, meta.pageCount)
  }
  currentMeetingPage.value = nextPages
}

let rotationTimer = null

function rotateMeetingOnceForCurrentVenuePage () {
  const visibleRowIds = new Set(visibleScheduleRows.value.map(row => row.id))
  const next = { ...currentMeetingPage.value }
  let changed = false
  Object.entries(meetingViewportMeta.value).forEach(([key, meta]) => {
    const [rowIdStr] = key.split('-')
    const rowId = Number.parseInt(rowIdStr, 10)
    if (!visibleRowIds.has(rowId)) return
    if ((meta?.pageCount || 1) > 1) {
      next[key] = ((next[key] || 0) + 1) % meta.pageCount
      changed = true
    }
  })
  if (changed) {
    currentMeetingPage.value = next
  }
  return changed
}

function startRotationLoop () {
  if (rotationTimer) clearInterval(rotationTimer)
  rotationTimer = setInterval(() => {
    // 只有一个场地页时，持续进行“单场地内会议翻页”
    if (totalVenuePages.value <= 1) {
      rotateMeetingOnceForCurrentVenuePage()
      return
    }

    // 多场地页：先保证当前场地页内会议至少翻页一次，再切场地页
    if (!hasMeetingFlippedOnCurrentVenuePage.value) {
      const didFlip = rotateMeetingOnceForCurrentVenuePage()
      if (didFlip) {
        hasMeetingFlippedOnCurrentVenuePage.value = true
        return
      }
    }

    currentVenuePage.value = (currentVenuePage.value + 1) % totalVenuePages.value
    hasMeetingFlippedOnCurrentVenuePage.value = false
  }, AUTO_ROTATE_MS)
}

function loadDisplayConfig () {
  const cfg = getMockDisplayConfig()
  const m = cfg.mergeDisplaySettings || {}
  qrCodeImage.value = (m.qrCodeImage && String(m.qrCodeImage).trim()) ? m.qrCodeImage : DEFAULT_QR_SRC
  tickerText.value = m.footerTickerText || defaultTicker
  const legacyTitle = [m.panelTitleLine1, m.panelTitleLine2].filter(Boolean).join('\n')
  const raw = (m.panelTitleText ?? legacyTitle ?? '').trim()
  panelTitleText.value = raw || defaultPanelTitleText
}

/** 与 VenueDisplayView.vue 的 forceFullscreen 一致：用 % + vw/vh，避免 visualViewport 与 scale 组合导致右下溢出 */
function forceFullscreen () {
  const container = document.querySelector('.merge-display-root')
  if (container) {
    container.style.setProperty('--display-scale', String(DISPLAY_SCALE))
    const scaledSize = `${100 / DISPLAY_SCALE}%`
    const scaledViewport = `${100 / DISPLAY_SCALE}vw`
    const scaledViewportHeight = `${100 / DISPLAY_SCALE}vh`
    container.style.width = scaledSize
    container.style.height = scaledSize
    container.style.minWidth = scaledViewport
    container.style.minHeight = scaledViewportHeight
  }

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

let timer = null

onMounted(() => {
  document.documentElement.classList.add('merge-display-fullscreen')
  updateDateTime()
  buildScheduleRows()
  loadDisplayConfig()
  currentVenuePage.value = 0
  timer = setInterval(updateDateTime, 60000)
  forceFullscreen()
  measureMeetingViewports()
  startRotationLoop()
  window.addEventListener('resize', forceFullscreen)
  window.addEventListener('resize', measureMeetingViewports)
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
})

onUnmounted(() => {
  document.documentElement.classList.remove('merge-display-fullscreen')
  if (timer) clearInterval(timer)
  if (rotationTimer) clearInterval(rotationTimer)
  window.removeEventListener('resize', forceFullscreen)
  window.removeEventListener('resize', measureMeetingViewports)
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  document.body.style.width = ''
  document.body.style.height = ''
  document.documentElement.style.width = ''
  document.documentElement.style.height = ''
})

watch(totalVenuePages, () => {
  if (currentVenuePage.value >= totalVenuePages.value) {
    currentVenuePage.value = 0
  }
  hasMeetingFlippedOnCurrentVenuePage.value = false
  startRotationLoop()
})

watch(visibleScheduleRows, async () => {
  hasMeetingFlippedOnCurrentVenuePage.value = false
  await measureMeetingViewports()
}, { deep: true })
</script>

<style>
/*
 * 大屏路由：抵消 style.css 中 1100–1599px 的 html zoom:0.8 与 #app 125vw，
 * 否则 fixed + scale 会与视口错位，右侧/下方出现灰底留白。
 */
html.merge-display-fullscreen {
  zoom: 1 !important;
}

html.merge-display-fullscreen #app {
  width: 100% !important;
  height: 100% !important;
  min-height: 100vh !important;
  max-width: none !important;
  margin: 0 !important;
  background-color: transparent !important;
  overflow: hidden !important;
}
</style>

<style scoped>
/* 与 VenueDisplayView.vue 一致：全屏 + DISPLAY_SCALE 等比缩放 */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.merge-display-root {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  box-sizing: border-box;
  /* 与 VenueDisplayView .display-container 一致；onMounted 后 forceFullscreen 写入 100/DISPLAY_SCALE */
  width: 50%;
  height: 50%;
  min-width: 50vw;
  min-height: 50vh;
  background: #1e2a91;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: Arial, sans-serif;
  transform: scale(var(--display-scale, 1.8));
  transform-origin: top left;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-transform: scale(var(--display-scale, 1.8));
}

.merge-display-root * {
  touch-action: manipulation;
}

.top-date-bar {
  background: #f7a23a;
  color: #ffffff;
  font-weight: 700;
  padding: 8px 10px;
  font-size: 1.2rem;
  display: flex;
  gap: 10px;
}

.weekday-zh {
  font-weight: 600;
}

.main-panel {
  position: relative;
  flex: 1;
  min-height: 0;
  background: linear-gradient(180deg, #2949b7 0%, #1f2f8d 100%);
  padding: 10px 10px 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 右上角固定二维码，与参考图一致：白底描边、略浮于主区 */
.panel-qr {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  width: 60px;
  height: 60px;
  box-sizing: border-box;
  object-fit: contain;  /* 让图片 / 视频 完整显示、不变形、不裁剪，全部装进盒子里，多余空间留空（自动居中）*/
  background: #fff;
  /* border: 3px solid #fff; */
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
  pointer-events: none; /* 让这个元素 “变成透明空气”，鼠标点不到、选不中、没任何反应。*/
}

.panel-top-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 0;
  min-width: 0;
  /* 为右上角二维码留出空间，避免标题与时间行文字叠在码上 */
  padding-right: 100px;
}

.panel-header {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.panel-title-wrap {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.panel-title-line {
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.2;
  white-space: pre-line;
}

.time-line {
  flex-shrink: 0;
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.02em;
  color: #ffec5c;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.schedule-header,
.schedule-row {
  display: grid;
  grid-template-columns: minmax(0, 130px) minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
  align-items: stretch;
}

.pm-col {
  padding-left: 16px;
}

.schedule-header .slot-col,
.schedule-row .slot-col {
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.schedule-header {
  flex-shrink: 0;
  font-size: 2rem;
  font-weight: 700;
  margin-top: 20px;
  margin-bottom: 6px;
}

.schedule-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: hidden;
}

.schedule-row {
  position: relative;
  flex: 1 1 0;
  min-height: 48px;
  font-size: 1.15rem;
  overflow: hidden;
}

.room-name {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 2.2rem;
  font-weight: 700;
  padding-top: 6px;
}

.room-name-text {
  line-height: 1;
}

.room-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background: #ffd34d;
  color: #ffffff;
  font-size: 2.05rem;
  font-weight: 900;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.schedule-row .slot-col {
  display: flex;
  align-items: flex-start;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

/* 分割线仅覆盖 AM/PM 区域，且在 AM/PM 之间连续不断 */
.schedule-row::after {
  content: '';
  position: absolute;
  left: calc(130px + 10px);
  right: 0;
  bottom: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.35);
}

.schedule-row:first-child::before {
  content: '';
  position: absolute;
  left: calc(130px + 10px);
  right: 0;
  top: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.35);
}

.schedule-row:last-child::after {
  display: none;
}

.meeting-carousel {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.meeting-track {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding-top: 6px;
  transition: transform 450ms ease;
}

.meeting-item {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 22px;
  align-items: baseline;
  width: 100%;
  line-height: 1.2;
}

.meeting-time {
  white-space: nowrap;
}

.meeting-title {
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.meeting-placeholder {
  opacity: 0.9;
}

.footer-ticker {
  background: #f7a23a;
  color: #1f2f8d;
  overflow: hidden;
  font-size: 1.4rem;
  font-weight: 700;
  padding: 4px 10px;
}

.ticker-track {
  display: inline-flex;
  width: max-content;
  white-space: nowrap;
  will-change: transform;
  animation: ticker 20s linear infinite;
}

.ticker-text {
  display: inline-block;
  flex-shrink: 0;
}

@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>
