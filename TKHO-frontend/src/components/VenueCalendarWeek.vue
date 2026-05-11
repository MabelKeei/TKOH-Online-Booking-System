<template>
  <div class="calendar-week">
    <!-- 日期和房间类型表头 - 固定 -->
    <div class="week-header" :style="{ gridTemplateColumns: weekGridTemplateColumns, minWidth: weekGridMinWidth }">
      <div class="time-header" />
      <div v-for="(day, index) in weekDays" :key="index" class="day-header">
        <div class="day-label">{{ day.name }} / {{ day.date }}</div>
      </div>
    </div>

    <!-- 时间槽网格 -->
    <div class="week-grid" :style="{ gridTemplateColumns: weekGridTemplateColumns, minWidth: weekGridMinWidth }">
      <!-- 时间列 -->
      <div class="time-column">
        <div v-for="hour in timeSlots" :key="hour" class="time-slot">
          {{ hour }}
        </div>
      </div>

      <!-- 每一天的槽位 -->
      <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="day-column" :class="{ 'is-today': isToday(day.fullDate) }">
        <!-- 时间格子 -->
        <div
          v-for="hour in timeSlots"
          :key="`${dayIndex}-${hour}`"
          class="time-cell"
          @click="selectTimeSlot(day.date, hour)"
        />

        <!-- 预订卡片（绝对定位） -->
        <CalendarBookingPopover
          v-for="booking in getDayBookings(day.fullDate)"
          :key="booking.id"
          :booking="booking"
          :current-date="currentDate"
          default-color="#f97316"
          :teleported="false"
        >
          <template #reference>
            <div
              class="booking-block"
              :style="getBookingStyle(booking, day.fullDate)"
              @click="selectBooking(day.fullDate)"
            >
              <div class="booking-time">{{ booking.startTime }} - {{ booking.endTime }}</div>
              <div class="booking-reserved">{{ booking.reservedBy || 'N/A' }}</div>
            </div>
          </template>
        </CalendarBookingPopover>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CalendarBookingPopover from './CalendarBookingPopover.vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  bookings: {
    type: Array,
    default: () => []
  },
  selectedRooms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['time-slot-click', 'booking-click'])

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// 时间槽（30分钟间隔，从7:00到21:00）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 7; hour <= 21; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 21) {
      slots.push(`${String(hour).padStart(2, '0')}:30`)
    }
  }
  return slots
})

// 周的日期
const weekDays = computed(() => {
  const date = new Date(props.currentDate)
  const day = date.getDay()
  // 从周日开始（周日是0）
  const diff = date.getDate() - day
  const weekStart = new Date(date.setDate(diff))

  const days = []
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(weekStart)
    currentDay.setDate(currentDay.getDate() + i)
    days.push({
      name: weekdayNames[currentDay.getDay()],
      date: currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: new Date(currentDay)
    })
  }
  return days
})

const weekGridTemplateColumns = computed(() => {
  return `80px repeat(${weekDays.value.length}, minmax(120px, 1fr))`
})

const weekGridMinWidth = computed(() => {
  return `calc(80px + ${weekDays.value.length} * 120px)`
})

function dayDateKey (dayDate) {
  return dayDate.toDateString()
}

// 获取某一天的所有预订（根据选中的房间过滤）
function getDayBookings (dayDate) {
  const dayBookings = props.bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate.toDateString() === dayDate.toDateString()
  })

  // 与 Day/Month 一致：未选中任何房间（如 Clear All）时不显示预订
  if (!props.selectedRooms || props.selectedRooms.length === 0) {
    return []
  }

  const selectedRoomNames = props.selectedRooms.map(room => room.name)
  return dayBookings.filter(booking => selectedRoomNames.includes(booking.roomName))
}

function parseTimeToMinutes (timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 7 * 60
  const [h, m] = timeStr.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 7 * 60
  return h * 60 + m
}

/**
 * Outlook 式：同一天内时间重叠的预订均分列宽。
 * 贪心按开始时间排序，放入第一个「与当前列末尾不重叠」的列；总列数 = 所用列数。
 */
function buildDayOverlapLayout (dayBookings) {
  const layout = new Map()
  if (!dayBookings.length) return layout

  const items = dayBookings.map(booking => {
    const startMin = parseTimeToMinutes(booking.startTime)
    let endMin = parseTimeToMinutes(booking.endTime)
    if (endMin <= startMin) endMin = startMin + 30
    return { booking, startMin, endMin }
  }).sort((a, b) => {
    if (a.startMin !== b.startMin) return a.startMin - b.startMin
    if (b.endMin !== a.endMin) return b.endMin - a.endMin
    return String(a.booking.id).localeCompare(String(b.booking.id))
  })

  const colMaxEnd = []

  for (const item of items) {
    let c = 0
    while (c < colMaxEnd.length && item.startMin < colMaxEnd[c]) {
      c++
    }
    if (c === colMaxEnd.length) colMaxEnd.push(item.endMin)
    else colMaxEnd[c] = Math.max(colMaxEnd[c], item.endMin)

    item.col = c
  }

  const totalCols = colMaxEnd.length
  for (const item of items) {
    layout.set(item.booking.id, { col: item.col, totalCols })
  }

  return layout
}

const weekOverlapLayouts = computed(() => {
  const byDay = new Map()
  for (const day of weekDays.value) {
    const key = dayDateKey(day.fullDate)
    byDay.set(key, buildDayOverlapLayout(getDayBookings(day.fullDate)))
  }
  return byDay
})

// 判断是否是今天
function isToday(date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// 计算预订卡片的样式（位置和高度；横向按重叠列均分宽度）
function getBookingStyle (booking, dayDate) {
  const startTimeInMinutes = parseTimeToMinutes(booking.startTime)
  let endTimeInMinutes = parseTimeToMinutes(booking.endTime)
  if (endTimeInMinutes <= startTimeInMinutes) endTimeInMinutes = startTimeInMinutes + 30

  // 7:00 是起始时间（7 * 60 = 420分钟）
  const dayStartInMinutes = 7 * 60

  // 计算相对于7:00的偏移量（以30分钟为单位）
  const offsetSlots = (startTimeInMinutes - dayStartInMinutes) / 30
  const durationSlots = (endTimeInMinutes - startTimeInMinutes) / 30

  // 每个时间槽高度为40px
  const slotHeight = 40
  const top = offsetSlots * slotHeight
  const height = durationSlots * slotHeight

  const layout = weekOverlapLayouts.value.get(dayDateKey(dayDate))
  const lay = layout?.get(booking.id)
  const totalCols = lay?.totalCols ?? 1
  const col = lay?.col ?? 0
  const colFrac = 100 / totalCols
  const gutterPx = 2

  const accent = booking.color || '#f97316'
  return {
    top: `${top}px`,
    height: `${height}px`,
    left: `calc(${col * colFrac}% + ${gutterPx}px)`,
    width: `calc(${colFrac}% - ${gutterPx * 2}px)`,
    right: 'auto',
    zIndex: 1 + col,
    '--booking-accent': accent
  }
}

// 选择时间槽
function selectTimeSlot(dayDate, hour) {
  emit('time-slot-click', {
    date: dayDate,
    time: hour
  })
}

// 选择预订
function selectBooking(dayDate) {
  emit('booking-click', dayDate)
}
</script>

<style scoped>
.calendar-week {
  width: 100%;
  position: relative;
}

.week-header {
  display: grid;
  background-color: #e5e7eb;
  border-radius: 0.5rem 0.5rem 0 0;
  overflow: visible;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 10;
}

.time-header {
  background-color: #f3f4f6;
  padding: 0.5rem;
  border-right: 1px solid #e5e7eb;
  position: sticky;
  left: 0;
  z-index: 12;
  box-shadow: 1px 0 0 #e5e7eb;
}

.day-header {
  background-color: #f3f4f6;
  padding: 0.5rem;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}

.day-header:last-child {
  border-right: none;
}

.day-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  white-space: nowrap;
}

.week-grid {
  display: grid;
  background-color: #e5e7eb;
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: visible;
  border: 1px solid #e5e7eb;
  border-top: none;
}

.time-column {
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  position: sticky;
  left: 0;
  z-index: 8;
  box-shadow: 1px 0 0 #e5e7eb;
}

.time-slot {
  padding: 0.25rem;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  box-sizing: border-box;
}

.day-column {
  display: flex;
  flex-direction: column;
  position: relative;
}

.day-column.is-today .time-cell {
  background-color: #fef3c7;
}

.day-column.is-today .time-cell:hover {
  background-color: #fde68a;
}

.time-cell {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  height: 40px;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-sizing: border-box;
}

.day-column:last-child .time-cell {
  border-right: none;
}

.time-cell:hover {
  background-color: #f0fdf4;
}

.booking-block {
  position: absolute;
  box-sizing: border-box;
  padding: 3px 6px 3px 7px;
  border-radius: 3px;
  border-left: 4px solid var(--booking-accent, #f97316);
  background-color: color-mix(in srgb, var(--booking-accent, #f97316) 42%, white);
  color: #111827;
  font-size: 0.7rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.booking-time {
  font-weight: 600;
  font-size: 0.8125rem;
  margin-bottom: 0.125rem;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.15;
  color: #111827;
}

.booking-reserved {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.15;
}

@media (max-width: 389px) {
  .time-slot {
    min-height: 50px;
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  .time-cell {
    min-height: 50px;
  }

  .booking-time {
    font-size: 0.7rem;
  }

  .booking-reserved {
    font-size: 0.6rem;
  }
}

@media (min-width: 390px) and (max-width: 767px) {
  .time-slot {
    min-height: 50px;
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  .time-cell {
    min-height: 50px;
  }

  .booking-time {
    font-size: 0.7rem;
  }

  .booking-reserved {
    font-size: 0.6rem;
  }
}

@media (min-width: 768px) and (max-width: 1099px) {
  .time-slot {
    min-height: 50px;
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  .time-cell {
    min-height: 50px;
  }
}

@media (min-width: 1100px) and (max-width: 1599px) {}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}
</style>
