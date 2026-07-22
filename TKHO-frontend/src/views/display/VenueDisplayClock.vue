<template>
  <div class="date-time">
    <span class="date">{{ currentDate }}</span>
    <span class="time">{{ currentTime }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  getAppDisplayDateTimeParts,
  msUntilNextAppMinute,
  todayYmdInAppTimeZone
} from '@/utils/appTimezone'

const emit = defineEmits(['tick'])

const currentDate = ref('')
const currentTime = ref('')

let clockTimer = null
let lastYmd = ''

function readParts () {
  const parts = getAppDisplayDateTimeParts()
  return {
    date: `${parts.day}/${parts.month}/${parts.year} ${parts.weekdayEn} ${parts.weekdayZh}`,
    time: `${parts.hour}:${parts.minute}`,
    ymd: todayYmdInAppTimeZone()
  }
}

function publishTick () {
  const { date, time, ymd } = readParts()
  currentDate.value = date
  currentTime.value = time

  const dayChanged = Boolean(lastYmd && ymd !== lastYmd)
  lastYmd = ymd
  emit('tick', { time, date, ymd, dayChanged })
}

function scheduleClockTick () {
  clockTimer = setTimeout(() => {
    publishTick()
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
  publishTick()
  scheduleClockTick()
}

function onDocumentVisibilityChange () {
  if (document.visibilityState === 'visible') {
    startClock()
  }
}

onMounted(() => {
  startClock()
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)
})

onUnmounted(() => {
  stopClock()
  document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
})
</script>

<style scoped>
.date-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #111111;
  flex: 1;
  min-width: 0;
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

@media (max-width: 768px) {
  .date {
    font-size: 1.125rem;
  }

  .time {
    font-size: 1.5rem;
  }
}
</style>
