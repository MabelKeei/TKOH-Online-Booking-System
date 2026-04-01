<template>
  <div class="merge-display-root">
    <div class="top-date-bar">
      <span>{{ currentDate }}</span>
      <span class="weekday-zh">{{ currentWeekdayZh }}</span>
    </div>

    <div class="main-panel">
      <div class="panel-header">
        <div class="panel-title-wrap">
          <div class="panel-title-en">{{ headerTitleEn }}</div>
          <div class="panel-title-zh">{{ headerTitleZh }}</div>
        </div>
        <img v-if="qrCodeImage" :src="qrCodeImage" alt="QR" class="panel-qr" />
      </div>

      <div class="time-line">{{ currentTime }}</div>

      <div class="schedule-header">
        <div class="slot-col room-col"></div>
        <div class="slot-col">AM上午</div>
        <div class="slot-col">PM下午</div>
      </div>

      <div class="schedule-body">
        <div v-for="row in scheduleRows" :key="row.id" class="schedule-row">
          <div class="room-col room-name">{{ row.room }}</div>
          <div class="slot-col">{{ row.am }}</div>
          <div class="slot-col">{{ row.pm }}</div>
        </div>
      </div>
    </div>

    <div class="footer-ticker">
      <div class="ticker-text">{{ tickerText }}</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getMockVenueList, getMockDisplayConfig } from '@/mocks/mockData'

const currentDate = ref('')
const currentWeekdayZh = ref('')
const currentTime = ref('')

const qrCodeImage = ref('')
const headerTitleEn = ref('Conference Room')
const headerTitleZh = ref('會議室')

const defaultTicker = '請在會議期間佩戴外科口罩並保持安靜。For enquiries regarding Conference Rooms, please contact General Office.'
const tickerText = ref(defaultTicker)

const scheduleRows = ref([])

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

function buildScheduleRows () {
  const mergedVenues = getMockVenueList().filter(v => v.displayType === 'merge').slice(0, 3)
  const fallback = [
    { id: 1, name: 'CR1' },
    { id: 2, name: 'CR2' },
    { id: 3, name: 'CR3' }
  ]
  const source = mergedVenues.length > 0 ? mergedVenues.map((v, idx) => ({ id: v.id, name: `CR${idx + 1}` })) : fallback
  scheduleRows.value = source.map((item, idx) => ({
    id: item.id,
    room: item.name,
    am: idx === 0 ? '10:30-12:30  Reflooring discussion' : idx === 1 ? '10:00-12:30  Labour Department OSH Inspection Meeting' : '09:30-13:00  Fall Prevention Internal Meeting',
    pm: idx === 0 ? '15:00-17:00  Booking System Discussion' : idx === 1 ? '14:30-15:30  Reserved' : '-'
  }))
}

function loadDisplayConfig () {
  const cfg = getMockDisplayConfig()
  qrCodeImage.value = cfg.mergeDisplaySettings?.qrCodeImage || ''
  tickerText.value = cfg.mergeDisplaySettings?.footerTickerText || defaultTicker
}

let timer = null
onMounted(() => {
  updateDateTime()
  buildScheduleRows()
  loadDisplayConfig()
  timer = setInterval(updateDateTime, 60000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.merge-display-root {
  width: 100vw;
  height: 100vh;
  background: #1e2a91;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: Arial, sans-serif;
}

.top-date-bar {
  background: #f7a23a;
  color: #ffffff;
  font-weight: 700;
  padding: 8px 14px;
  font-size: 1.2rem;
  display: flex;
  gap: 10px;
}

.weekday-zh {
  font-weight: 600;
}

.main-panel {
  flex: 1;
  background: linear-gradient(180deg, #2949b7 0%, #1f2f8d 100%);
  padding: 10px 14px 6px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.panel-title-en {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.panel-title-zh {
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1.1;
}

.panel-qr {
  width: 72px;
  height: 72px;
  border-radius: 4px;
  background: #fff;
  object-fit: cover;
}

.time-line {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.schedule-header,
.schedule-row {
  display: grid;
  grid-template-columns: 130px 1fr 1fr;
  gap: 10px;
  align-items: center;
}

.schedule-header {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.schedule-body {
  border-top: 1px solid rgba(255, 255, 255, 0.35);
}

.schedule-row {
  min-height: 72px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 1.15rem;
}

.room-name {
  font-size: 2.2rem;
  font-weight: 700;
}

.footer-ticker {
  background: #f7a23a;
  color: #1f2f8d;
  white-space: nowrap;
  overflow: hidden;
  font-size: 1.4rem;
  font-weight: 700;
  padding: 4px 0;
}

.ticker-text {
  display: inline-block;
  padding-left: 100%;
  animation: ticker 18s linear infinite;
}

@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
</style>
