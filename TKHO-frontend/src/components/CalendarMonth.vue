<template>
  <div class="calendar-month h-full flex flex-col">
    <!-- 日期表头 -->
    <div class="weekday-header">
      <div
        v-for="(day, index) in weekdays"
        :key="day"
        class="weekday-cell"
        :class="{ 'first-col': index === 0, 'last-col': index === 6 }"
      >
        {{ day }}
      </div>
    </div>

    <!-- 日期网格 -->
    <div class="month-grid flex-1">
      <!-- 上个月的日期 -->
      <div
        v-for="(day, index) in prevMonthDays"
        :key="`prev-${day}`"
        class="date-cell empty"
        :class="{ 'first-col': (index % 7) === 0, 'last-col': (index % 7) === 6 }"
      >
        <span class="date-number">{{ day }}</span>
      </div>

      <!-- 本月的日期 -->
      <div
        v-for="(day, index) in daysInMonth"
        :key="day"
        class="date-cell"
        :class="{
          'today': isToday(day),
          'has-bookings': hasBookings(day),
          'first-col': ((prevMonthDays.length + index) % 7) === 0,
          'last-col': ((prevMonthDays.length + index) % 7) === 6
        }"
        @click="selectDate(day)"
      >
        <span class="date-number">{{ day }}</span>
        <div v-if="hasBookings(day)" class="booking-indicators">
          <div
            v-for="(booking, idx) in getBookingsForDay(day).slice(0, 3)"
            :key="idx"
            class="booking-dot"
            :style="{ backgroundColor: booking.color || '#f97316' }"
          />
          <span v-if="getBookingsForDay(day).length > 3" class="more-count">
            +{{ getBookingsForDay(day).length - 3 }}
          </span>
        </div>
      </div>

      <!-- 下个月的日期 -->
      <div
        v-for="(day, index) in nextMonthDays"
        :key="`next-${day}`"
        class="date-cell empty"
        :class="{
          'first-col': ((prevMonthDays.length + daysInMonth + index) % 7) === 0,
          'last-col': ((prevMonthDays.length + daysInMonth + index) % 7) === 6
        }"
      >
        <span class="date-number">{{ day }}</span>
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

const emit = defineEmits(['day-click'])

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// 当前月份的天数
const daysInMonth = computed(() => {
  const date = new Date(props.currentDate)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
})

// 当前月份开始日期的星期几
const firstDayOfMonth = computed(() => {
  const date = new Date(props.currentDate)
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
})

// 上个月需要显示的天数
const prevMonthDays = computed(() => {
  const days = []
  const date = new Date(props.currentDate)
  const prevMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate()
  for (let i = firstDayOfMonth.value - 1; i >= 0; i--) {
    days.push(prevMonthLastDay - i)
  }
  return days
})

// 下个月需要显示的天数
const nextMonthDays = computed(() => {
  const days = []
  const totalCells = prevMonthDays.value.length + daysInMonth.value
  const remainingCells = 42 - totalCells
  for (let i = 1; i <= remainingCells; i++) {
    days.push(i)
  }
  return days
})

// 判断是否是今天
function isToday(day) {
  const today = new Date()
  const date = new Date(props.currentDate)
  return (
    day === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// 获取某一天的预订
function getBookingsForDay(day) {
  const date = new Date(props.currentDate)
  const targetDate = new Date(date.getFullYear(), date.getMonth(), day)
  return props.bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate.toDateString() === targetDate.toDateString()
  })
}

// 判断某一天是否有预订
function hasBookings(day) {
  return getBookingsForDay(day).length > 0
}

// 选择日期
function selectDate(day) {
  const date = new Date(props.currentDate)
  date.setDate(day)
  emit('day-click', date)
}
</script>

<style scoped>
.calendar-month {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 0;
  background-color: #e5e7eb;
  border-radius: 0.5rem 0.5rem 0 0;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
  border-bottom: none;
}

.weekday-cell {
  background-color: #f3f4f6;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.weekday-cell.first-col {
  border-left: 1px solid #e5e7eb;
}

.weekday-cell.last-col {
  border-right: 1px solid #e5e7eb;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 1px;
  background-color: #e5e7eb;
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-top: none;
}

.date-cell {
  background-color: white;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  min-height: 0;
  height: 100%;
}

.date-cell:hover {
  background-color: #f9fafb;
  box-shadow: inset 0 0 0 1px #3b82f6;
}

.date-cell.empty {
  background-color: #f9fafb;
  color: #d1d5db;
  cursor: default;
}

.date-cell.empty:hover {
  background-color: #f9fafb;
  box-shadow: none;
}

.date-cell.today {
  background-color: #fef3c7;
}

.date-cell.first-col {
  border-left: 1px solid #e5e7eb;
}

.date-cell.last-col {
  border-right: 1px solid #e5e7eb;
}

.date-number {
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

.date-cell.empty .date-number {
  color: #d1d5db;
}

.booking-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.booking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.more-count {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.25rem;
}

@media (max-width: 768px) {
  .date-cell {
    padding: 0.5rem;
  }

  .date-number {
    font-size: 0.875rem;
  }

  .booking-dot {
    width: 6px;
    height: 6px;
  }

  .more-count {
    font-size: 0.625rem;
  }
}
</style>
