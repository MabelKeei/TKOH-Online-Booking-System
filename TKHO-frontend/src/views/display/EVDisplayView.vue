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
                <span class="period-name-zh">{{ periodZhMap[period.period] }}</span>
              </div>
              <div class="period-range">{{ period.startTime }}-{{ period.endTime }}</div>
            </div>
          </div>

          <div class="right-grid-panel">
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

        <div class="ev-footer-ticker">
          <div class="ticker-track">
            <span class="ticker-text">{{ footerTickerText || '請依照已預約之時段及車位泊車，並於離場前移走車輛。' }}</span>
            <span class="ticker-text" aria-hidden="true">{{ footerTickerText || '請依照已預約之時段及車位泊車，並於離場前移走車輛。' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getMockDisplayConfig, getMockEVManageBookingList, getMockEVTimePeriods } from '@/mocks/mockData'
import evDisplayIcon from '@/assets/EVDisplay_icon.svg'

const periodZhMap = {
  AM: '上午',
  PM: '下午',
  Night: '晚上'
}

const bookings = ref([])
const timePeriods = ref([])
const currentDateLabel = ref('')
const currentTimeLabel = ref('')
const displayDate = ref('')
const footerTickerText = ref('')
const displayRoot = ref(null)
const BASE_WIDTH = 1920
const BASE_HEIGHT = 1080

const spaces = computed(() => {
  const list = [...new Set(bookings.value.map(item => item.space).filter(Boolean))]
  if (!list.length) return ['B1', 'B2', 'B3']
  return list.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }))
})

function parseBookingDate (text) {
  const d = new Date(text)
  return Number.isNaN(d.getTime()) ? null : d
}

function toYmd (d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function pickDisplayDate (today) {
  const valid = bookings.value
    .filter(item => item.status !== 'cancelled')
    .map(item => parseBookingDate(item.date))
    .filter(Boolean)
    .sort((a, b) => a - b)
  if (!valid.length) return toYmd(today)
  const todayYmd = toYmd(today)
  const exact = valid.find(d => toYmd(d) === todayYmd)
  if (exact) return todayYmd
  const future = valid.find(d => d >= today)
  return toYmd(future || valid[valid.length - 1])
}

function updateDateTime () {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const weekdayEn = now.toLocaleDateString('en-US', { weekday: 'long' })
  const weekdaysZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  currentDateLabel.value = `${day}/${month}/${year} ${weekdayEn} ${weekdaysZh[now.getDay()]}`
  currentTimeLabel.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getPlate (period, space) {
  const matched = bookings.value.find(item =>
    item.status !== 'cancelled' &&
    item.period === period &&
    item.space === space &&
    item.ymd === displayDate.value
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
}

let timer = null

onMounted(() => {
  const displayConfig = getMockDisplayConfig()
  footerTickerText.value = displayConfig.evDisplaySettings?.footerTickerText || ''
  timePeriods.value = getMockEVTimePeriods()
    .filter(item => item.status === 'active')
  bookings.value = getMockEVManageBookingList().map(item => ({
    ...item,
    period: String(item.time || '').split(' ')[0],
    ymd: (() => {
      const d = parseBookingDate(item.date)
      return d ? toYmd(d) : ''
    })()
  }))
  const now = new Date()
  displayDate.value = pickDisplayDate(now)
  updateDateTime()
  timer = setInterval(updateDateTime, 60000)
  adaptFullscreen()
  window.addEventListener('resize', adaptFullscreen)
  window.visualViewport?.addEventListener('resize', adaptFullscreen)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
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
  grid-template-columns: minmax(0, 0.19fr) minmax(0, 0.81fr);
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
  font-size: calc(50px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1;
  font-weight: 800;
}

.period-name-zh {
  font-size: calc(30px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1;
  font-weight: 400;
  flex-shrink: 0;
  transform: translateY(calc(-18px * var(--ui-scale)));
}

.period-range {
  font-size: calc(42px * var(--ui-scale) * var(--text-scale-boost));
  line-height: 1.1;
  font-weight: 700;
  white-space: nowrap;
}

.right-grid-panel {
  margin-left: 0;
  margin-right: calc(28px * var(--ui-scale) * var(--space-scale));
  margin-bottom: 0;
  border: calc(8px * var(--ui-scale)) solid #9ccf62;
  padding: calc(2px * var(--ui-scale) * var(--space-scale));
  min-height: 0;
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  align-items: stretch;
}

.space-header-row,
.plate-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(12px, calc(16px * var(--ui-scale)), 24px);
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
  font-size: calc(72px * var(--ui-scale) * var(--text-scale-boost));
  font-weight: 800;
  line-height: 1.04;
  letter-spacing: calc(1px * var(--ui-scale));
  min-height: calc(96px * var(--ui-scale));
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
  color: #f3ffe2;
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

.ticker-track {
  display: inline-flex;
  width: max-content;
  animation: evTickerScroll 24s linear infinite;
}

.ticker-text {
  display: inline-block;
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
