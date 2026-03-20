<template>
  <div class="calendar-week">
    <!-- 日期和房间类型表头 - 固定 -->
    <div class="week-header">
      <div class="time-header" />
      <div v-for="(day, index) in weekDays" :key="index" class="day-header">
        <div class="day-label">{{ day.name }} / {{ day.date }}</div>
      </div>
    </div>

    <!-- 时间槽网格 -->
    <div class="week-grid">
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
        <div
          v-for="booking in getDayBookings(day.fullDate)"
          :key="booking.id"
          class="booking-block"
          :style="getBookingStyle(booking)"
        >
          <div class="booking-title">{{ booking.roomName }}</div>
          <div class="booking-time">{{ booking.startTime }} - {{ booking.endTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  bookings: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['time-slot-click'])

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
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
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

// 获取某一天的所有预订
function getDayBookings(dayDate) {
  return props.bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate.toDateString() === dayDate.toDateString()
  })
}

// 判断是否是今天
function isToday(date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// 计算预订卡片的样式（位置和高度）
function getBookingStyle(booking) {
  const [startHour, startMinute] = (booking.startTime?.split(':') || ['7', '0']).map(Number)
  const [endHour, endMinute] = (booking.endTime?.split(':') || ['7', '30']).map(Number)

  // 计算开始和结束时间（以分钟为单位）
  const startTimeInMinutes = startHour * 60 + startMinute
  const endTimeInMinutes = endHour * 60 + endMinute

  // 7:00 是起始时间（7 * 60 = 420分钟）
  const dayStartInMinutes = 7 * 60

  // 计算相对于7:00的偏移量（以30分钟为单位）
  const offsetSlots = (startTimeInMinutes - dayStartInMinutes) / 30
  const durationSlots = (endTimeInMinutes - startTimeInMinutes) / 30

  // 每个时间槽高度为40px
  const slotHeight = 40
  const top = offsetSlots * slotHeight
  const height = durationSlots * slotHeight

  return {
    top: `${top}px`,
    height: `${height}px`,
    backgroundColor: booking.color || '#f97316'
  }
}

// 选择时间槽
function selectTimeSlot(dayDate, hour) {
  emit('time-slot-click', {
    date: dayDate,
    time: hour
  })
}
</script>

<style scoped>
.calendar-week {
  width: 100%;
  position: relative;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  background-color: #e5e7eb;
  border-radius: 0.5rem 0.5rem 0 0;
  overflow: hidden;
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
  grid-template-columns: 80px repeat(7, 1fr);
  background-color: #e5e7eb;
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-top: none;
}

.time-column {
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
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
  left: 2px;
  right: 2px;
  padding: 0.25rem 0.375rem;
  border-radius: 0.25rem;
  color: white;
  font-size: 0.65rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.booking-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-time {
  font-size: 0.6rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .week-grid {
    grid-template-columns: 60px repeat(7, 1fr);
  }

  .time-slot {
    min-height: 50px;
    padding: 0.5rem;
    font-size: 0.7rem;
  }

  .time-cell {
    min-height: 50px;
  }
}
</style>
