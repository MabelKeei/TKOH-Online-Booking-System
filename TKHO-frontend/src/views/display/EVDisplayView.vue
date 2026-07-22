<template>
  <div ref="displayRoot" class="ev-display-root">
    <div class="ev-display-stage">
      <div class="top-date-bar">
        <span class="top-date-text">{{ currentDateLabel }}</span>
      </div>

      <div class="main-board">
        <div class="board-header">
          <div class="board-title-line">
            <span class="board-title-en">Today's Reservation</span>
            <span class="board-title-zh">今日預約車牌</span>
          </div>
          <div class="board-subtitle-line">
            <span class="board-subtitle-en">EV Charging Station</span>
            <span class="board-subtitle-zh">電動車叉電位</span>
          </div>
        </div>

        <div class="board-content">
          <div class="left-time-panel">
            <div class="current-time">{{ currentTimeLabel }}</div>
            <div
              v-for="period in timePeriods"
              :key="period.period"
              class="period-card"
            >
              <div class="period-label-line">
                <span class="period-name">{{ period.period }}</span>
                <sup class="period-name-zh">{{ periodZhMap[period.period] }}</sup>
              </div>
              <div class="period-range">{{ period.startTime }}-{{ period.endTime }}</div>
            </div>
          </div>

          <div class="right-grid-panel" :style="spaceGridStyle">
            <div class="space-header-row">
              <div v-for="space in spaces" :key="space" class="space-header-cell">
                <span class="space-name">{{ space }}</span>
                <img class="space-icon" :src="evDisplayIcon" alt="" aria-hidden="true">
              </div>
            </div>

            <div
              v-for="period in timePeriods"
              :key="`row-${period.period}`"
              class="plate-row"
            >
              <div
                v-for="space in spaces"
                :key="`${period.period}-${space}`"
                class="plate-cell"
              >
                {{ getPlate(period.period, space) }}
              </div>
            </div>
          </div>
        </div>

        <div ref="tickerContainerRef" class="ev-footer-ticker" :class="{ 'ticker-static': !tickerScroll }">
          <div class="ticker-track" :class="{ 'is-scrolling': tickerScroll }">
            <span ref="tickerMeasureRef" class="ticker-text">{{ footerTickerDisplayText }}</span>
            <span v-if="tickerScroll" class="ticker-text" aria-hidden="true">{{ footerTickerDisplayText }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { getEvPublicDisplayData } from '@/api/evManagement'
import evDisplayIcon from '@/assets/EVDisplay_icon.svg'
import {
  getAppDisplayDateTimeParts,
  msUntilNextAppMinute,
  todayYmdInAppTimeZone
} from '@/utils/appTimezone'

const DEFAULT_FOOTER_TICKER = '請依照已預約之時段及車位泊車，並於離場前移走車輛。'

const periodZhMap = {
  AM: '上午',
  PM: '下午',
  Night: '晚上'
}

const bookings = ref([])
const parkingSpaces = ref([])
const timePeriods = ref([])
const currentDateLabel = ref('')
const currentTimeLabel = ref('')
const footerTickerText = ref('')
const footerTickerDisplayText = computed(() => footerTickerText.value || DEFAULT_FOOTER_TICKER)
const tickerScroll = ref(false)
const tickerContainerRef = ref(null)
const tickerMeasureRef = ref(null)
const displayRoot = ref(null)
const BASE_WIDTH = 1920
const BASE_HEIGHT = 1080

const spaces = computed(() =>
  parkingSpaces.value
    .map((slot) => String(slot?.evSpace || '').trim())
    .filter(Boolean)
)

const spaceGridStyle = computed(() => ({
  '--space-count': String(Math.max(spaces.value.length, 1))
}))

function normalizeParkingSlots (rows) {
  if (!Array.isArray(rows)) return []
  return rows
    .map((row) => {
      if (typeof row === 'string') {
        const evSpace = row.trim()
        return evSpace ? { evSpace } : null
      }
      const evSpace = String(row?.evSpace || '').trim()
      return evSpace ? { evSpace } : null
    })
    .filter(Boolean)
}

let lastDisplayYmd = ''

function mapDisplayBooking (item) {
  return {
    ...item,
    period: item.period || String(item.time || '').split(' ')[0]
  }
}

async function refreshDisplayData () {
  const data = await getEvPublicDisplayData(todayYmdInAppTimeZone())
  footerTickerText.value = data?.evDisplaySettings?.footerTickerText || ''
  timePeriods.value = Array.isArray(data?.timePeriods) ? data.timePeriods : []
  parkingSpaces.value = normalizeParkingSlots(data?.parkingSlots)
  bookings.value = (Array.isArray(data?.bookings) ? data.bookings : []).map(mapDisplayBooking)
  lastDisplayYmd = todayYmdInAppTimeZone()
  await nextTick()
  syncTickerScrollMode()
}

function updateDateTime () {
  const parts = getAppDisplayDateTimeParts()
  currentDateLabel.value = `${parts.day}/${parts.month}/${parts.year} ${parts.weekdayEn} ${parts.weekdayZh}`
  currentTimeLabel.value = `${parts.hour}:${parts.minute}`

  if (lastDisplayYmd && parts.ymd !== lastDisplayYmd) {
    void refreshDisplayData()
  }
}

function syncTickerScrollMode () {
  requestAnimationFrame(() => {
    const container = tickerContainerRef.value
    const textEl = tickerMeasureRef.value
    if (!container || !textEl) return
    tickerScroll.value = textEl.scrollWidth > container.clientWidth
  })
}

let tickerResizeObserver = null

function setupTickerResizeObserver () {
  const container = tickerContainerRef.value
  if (!container || typeof ResizeObserver === 'undefined') return
  tickerResizeObserver?.disconnect()
  tickerResizeObserver = new ResizeObserver(() => syncTickerScrollMode())
  tickerResizeObserver.observe(container)
}

/** 展示数据轮询（标签可见时），预订/配置变更后自动上屏 */
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

function getPlate (period, space) {
  const matched = bookings.value.find(item =>
    item.status !== 'cancelled' &&
    item.period === period &&
    item.space === space
  )
  return matched?.licensePlate || '-'
}

function adaptFullscreen () {
  const root = displayRoot.value
  if (!root) return
  const viewportScale = window.visualViewport?.scale || 1
  const zoomCompensation = viewportScale > 0 ? viewportScale : 1
  const vw = (window.innerWidth || BASE_WIDTH) * zoomCompensation
  const vh = (window.innerHeight || BASE_HEIGHT) * zoomCompensation
  const widthScale = vw / BASE_WIDTH
  const heightScale = vh / BASE_HEIGHT
  const baseScale = Math.min(widthScale, heightScale)
  const safeScale = baseScale > 0 ? baseScale : 1
  const ratio = heightScale / Math.max(safeScale, 0.0001)
  const textCompensation = Math.min(1.4, Math.max(1, Math.pow(ratio, 0.58)))
  const textBoost = 1.32 * textCompensation
  const spaceScale = Math.max(0.76, 1 - ((textCompensation - 1) * 0.7))
  root.style.setProperty('--ui-scale', String(safeScale))
  root.style.setProperty('--text-scale-boost', String(textBoost))
  root.style.setProperty('--space-scale', String(spaceScale))
  syncTickerScrollMode()
}

watch(footerTickerDisplayText, () => {
  nextTick(() => syncTickerScrollMode())
})

onMounted(async () => {
  try {
    await refreshDisplayData()
  } catch {
    footerTickerText.value = ''
    timePeriods.value = []
    parkingSpaces.value = []
    bookings.value = []
    lastDisplayYmd = todayYmdInAppTimeZone()
  }
  startClock()
  dataPollTimer = setInterval(pollDisplayDataFromServer, DATA_POLL_MS)
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)
  adaptFullscreen()
  window.addEventListener('resize', adaptFullscreen)
  window.visualViewport?.addEventListener('resize', adaptFullscreen)
  await nextTick()
  syncTickerScrollMode()
  setupTickerResizeObserver()
})

onUnmounted(() => {
  stopClock()
  tickerResizeObserver?.disconnect()
  if (dataPollTimer) clearInterval(dataPollTimer)
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
  window.removeEventListener('resize', adaptFullscreen)
  window.visualViewport?.removeEventListener('resize', adaptFullscreen)
})
</script>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  width: 100%;
  height: 100%;
}

.ev-display-root {
  --ui-scale: 1;
  --text-scale-boost: 1.32;
  --space-scale: 1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: #8fce4c;
  color: #ffffff;
  font-family: Arial, Helvetica, sans-serif;
  user-select: none;
}

.ev-display-stage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-date-bar {
  background: #8fce4c;
  padding: calc(22px * var(--ui-scale) * var(--space-scale)) calc(22px * var(--ui-scale) * var(--space-scale));
  min-height: calc(92px * var(--ui-scale));
  font-size: calc(32px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.3;
  font-weight: 600;
  color: #f3ffe2;
  display: flex;
  align-items: center;
}

.top-date-text {
  display: inline-block;
  letter-spacing: calc(0.6px * var(--ui-scale));
  transform: scaleY(1.05);
  transform-origin: left center;
}

.main-board {
  margin: 0 auto;
  width: 100%;
  flex: 1;
  display: grid;
  grid-template-rows: minmax(0, 1fr) minmax(0, 4fr) auto;
  background: #08b145;
  padding: calc(8px * var(--ui-scale) * var(--space-scale)) calc(14px * var(--ui-scale) * var(--space-scale)) calc(10px * var(--ui-scale) * var(--space-scale));
  box-sizing: border-box;
}

.board-header {
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(18px * var(--ui-scale) * var(--space-scale));
}

.board-title-line,
.board-subtitle-line {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: calc(20px * var(--ui-scale) * var(--space-scale));
  text-align: center;
}

.board-title-line {
  margin-bottom: 0;
}

.board-subtitle-line {
  margin-bottom: 0;
}

.board-title-en,
.board-title-zh {
  font-weight: 800;
}

.board-title-en {
  font-size: calc(56px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.12;
  font-weight: 700;
  letter-spacing: calc(0.6px * var(--ui-scale));
  display: inline-block;
  transform: scaleY(1.05);
}

.board-title-zh {
  font-size: calc(54px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.05;
}

.board-subtitle-en,
.board-subtitle-zh {
  font-size: calc(40px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.1;
  font-weight: 400;
}

.board-content {
  display: grid;
  grid-template-columns: minmax(0, 0.18fr) minmax(0, 0.82fr);
  gap: calc(2px * var(--ui-scale) * var(--space-scale));
  min-height: 0;
}


.left-time-panel {
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  min-height: 0;
  padding-left: calc(20px * var(--ui-scale) * var(--space-scale));
  box-sizing: border-box;
}

.current-time {
  font-size: calc(92px * var(--ui-scale) * var(--text-scale-boost));
  color: #ffd84f;
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: calc(1px * var(--ui-scale));
  display: flex;
  align-items: center;
  transform: scaleY(1.05);
  transform-origin: left center;
}

.period-card {
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(12px * var(--ui-scale) * var(--space-scale));
}

.period-label-line {
  display: flex;
  align-items: baseline;
  gap: calc(12px * var(--ui-scale) * var(--space-scale));
  white-space: nowrap;
}

.period-name {
  font-size: calc(40px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1;
  font-weight: 600;
}

.period-name-zh {
  font-size: calc(40px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 0;
  font-weight: 600;
  flex-shrink: 0;
  vertical-align: super;
}

.period-range {
  font-size: calc(40px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.1;
  font-weight: 600;
  white-space: nowrap;
}

.right-grid-panel {
  margin-left: 0;
  margin-right: calc(12px * var(--ui-scale) * var(--space-scale));
  margin-bottom: 0;
  border: calc(8px * var(--ui-scale)) solid #9ccf62;
  border-radius: 90px;
  padding: calc(8px * var(--ui-scale) * var(--space-scale)) calc(12px * var(--ui-scale) * var(--space-scale));
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  align-items: stretch;
  container-type: inline-size;
  container-name: ev-plate-grid;
}

.space-header-row,
.plate-row {
  display: grid;
  grid-template-columns: repeat(var(--space-count, 3), minmax(0, 1fr));
  gap: clamp(8px, calc(12px * var(--ui-scale)), 20px);
  min-height: 0;
  align-items: center;
}

.space-header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(10px * var(--ui-scale) * var(--space-scale));
  text-align: center;
  color: #ffffff;
  font-weight: 800;
  white-space: nowrap;
  min-width: 0;
}

.space-name {
  font-size: calc(82px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.08;
  font-weight: 700;
  display: inline-block;
  transform: scaleY(1.04);
}

.space-icon {
  width: calc(82px * var(--ui-scale) * var(--text-scale-boost));
  height: calc(82px * var(--ui-scale) * var(--text-scale-boost));
  object-fit: contain;
  flex: 0 0 auto;
}

.plate-row + .plate-row {
  margin-top: 0;
}

.plate-cell {
  text-align: center;
  color: #ffff00;
  /* 列宽按容器均分，按最多 8 位车牌适配字号，避免全屏重叠/溢出 */
  font-size: min(
    calc(64px * var(--ui-scale) * var(--text-scale-boost)),
    calc(
      (
        100cqw
        - clamp(8px, calc(12px * var(--ui-scale)), 20px) * (var(--space-count, 3) - 1)
        - 24px
      )
      / var(--space-count, 3)
      / 5.35
    )
  );
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: 0;
  min-width: 0;
  max-width: 100%;
  min-height: calc(72px * var(--ui-scale));
  padding-inline: calc(4px * var(--ui-scale));
  box-sizing: border-box;
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow:
    0 calc(2px * var(--ui-scale)) 0 rgba(106, 120, 22, 0.75),
    0 0 calc(2px * var(--ui-scale)) rgba(106, 120, 22, 0.45);
  -webkit-text-stroke: calc(0.6px * var(--ui-scale)) rgba(112, 126, 32, 0.55);
  transform: scaleY(1.02);
  transform-origin: center;
}

.ev-footer-ticker {
  margin-top: calc(30px * var(--ui-scale) * var(--space-scale));
  margin-right: calc(-14px * var(--ui-scale) * var(--space-scale));
  margin-bottom: calc(-10px * var(--ui-scale) * var(--space-scale));
  margin-left: calc(-14px * var(--ui-scale) * var(--space-scale));
  background: #8fce4c;
  color: black;
  font-size: calc(32px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.3;
  font-weight: 700;
  overflow: hidden;
  white-space: nowrap;
  padding: calc(22px * var(--ui-scale) * var(--space-scale)) calc(22px * var(--ui-scale) * var(--space-scale));
  min-height: calc(92px * var(--ui-scale));
  display: flex;
  align-items: center;
}

.ev-footer-ticker.ticker-static {
  justify-content: center;
}

.ticker-track {
  display: inline-flex;
  width: max-content;
}

.ticker-track.is-scrolling {
  animation: evTickerScroll 24s linear infinite;
}

.ticker-text {
  display: inline-block;
}

.ticker-track.is-scrolling .ticker-text:first-child {
  padding-right: calc(48px * var(--ui-scale) * var(--space-scale));
}

@keyframes evTickerScroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
