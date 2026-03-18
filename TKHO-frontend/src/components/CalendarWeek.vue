<template>
  <div class="calendar-week">
    <!-- 日期和房间类型表头 -->
    <div class="week-header">
      <div class="time-header" />
      <div v-for="(day, index) in weekDays" :key="index" class="day-header">
        <div class="day-name">{{ day.name }}</div>
        <div class="day-date">{{ day.date }}</div>
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
      <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="day-column">
        <div
          v-for="hour in timeSlots"
          :key="`${dayIndex}-${hour}`"
          class="time-cell"
          @click="selectTimeSlot(day.date, hour)"
        >
          <!-- 显示该时间段的预订 -->
          <div
            v-for="booking in getBookingsForTimeSlot(day.date, hour)"
            :key="booking.id"
            class="booking-block"
            :style="{ backgroundColor: booking.color || '#f97316' }"
          >
            <div class="booking-title">{{ booking.roomName }}</div>
            <div class="booking-time">{{ booking.startTime }} - {{ booking.endTime }}</div>
          </div>
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

// 时间槽（30分钟间隔）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 8; hour < 19; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
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

// 获取时间段的预订
function getBookingsForTimeSlot(dayDate, hour) {
  return props.bookings.filter(booking => {
    const bookingHour = parseInt(booking.startTime?.split(':')[0] || 0)
    return bookingHour.toString().padStart(2, '0') === hour.split(':')[0]
  })
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
  overflow-x: auto;
}

.week-header {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.time-header {
  background-color: #f3f4f6;
  padding: 0.75rem;
}

.day-header {
  background-color: #f3f4f6;
  padding: 0.75rem;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}

.day-header:last-child {
  border-right: none;
}

.day-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.day-date {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.week-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.time-column {
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

.time-slot {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
  min-height: 60px;
  display: flex;
  align-items: flex-start;
  font-weight: 500;
}

.day-column {
  display: flex;
  flex-direction: column;
}

.time-cell {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  min-height: 60px;
  padding: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.time-cell:hover {
  background-color: #f0fdf4;
}

.booking-block {
  padding: 0.25rem;
  border-radius: 0.25rem;
  margin-bottom: 0.25rem;
  color: white;
  font-size: 0.65rem;
  overflow: hidden;
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
