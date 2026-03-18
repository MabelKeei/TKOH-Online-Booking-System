<template>
  <div class="calendar-day">
    <!-- 日期表头 -->
    <div class="day-header">
      <h3 class="date-title">
        {{ currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
      </h3>
    </div>

    <!-- 时间槽网格 -->
    <div class="day-timeline">
      <div class="time-axis">
        <div v-for="hour in timeSlots" :key="hour" class="time-marker">
          {{ hour }}
        </div>
      </div>

      <div class="bookings-container">
        <!-- 显示预订 -->
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="booking-item"
          :style="getBookingStyle(booking)"
          @click="selectBooking(booking)"
        >
          <div class="booking-room">{{ booking.roomName }}</div>
          <div class="booking-time">{{ booking.startTime }} - {{ booking.endTime }}</div>
          <div v-if="booking.attendees" class="booking-attendees">
            {{ booking.attendees }} attendees
          </div>
        </div>

        <!-- 时间槽点击区域 -->
        <div
          v-for="hour in timeSlots"
          :key="`slot-${hour}`"
          class="time-slot"
          @click="selectTimeSlot(hour)"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="bookings.length === 0" class="empty-state">
      <div class="empty-icon">📅</div>
      <p class="empty-text">No bookings for this day</p>
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

// 营业时间（8:00 - 18:00）
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return slots
})

// 计算预订的位置和高度
function getBookingStyle(booking) {
  const startHour = parseInt(booking.startTime?.split(':')[0] || 0)
  const startMinute = parseInt(booking.startTime?.split(':')[1] || 0)
  const endHour = parseInt(booking.endTime?.split(':')[0] || 0)
  const endMinute = parseInt(booking.endTime?.split(':')[1] || 0)

  const startTime = startHour + startMinute / 60
  const endTime = endHour + endMinute / 60
  const duration = endTime - startTime

  const slotHeight = 80 // 每小时的高度
  const offset = (startTime - 8) * slotHeight + 40 // 8:00是起始时间
  const height = duration * slotHeight

  return {
    top: `${offset}px`,
    height: `${height}px`,
    backgroundColor: booking.color || '#f97316'
  }
}

// 选择时间槽
function selectTimeSlot(hour) {
  emit('time-slot-click', {
    date: props.currentDate.toLocaleDateString('en-US'),
    time: hour
  })
}

// 选择预订（可用于显示详情）
function selectBooking(booking) {
  // 这里可以触发显示预订详情的事件
  console.log('Selected booking:', booking)
}
</script>

<style scoped>
.calendar-day {
  width: 100%;
}

.day-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.date-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.day-timeline {
  position: relative;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1rem;
  min-height: 800px;
}

.time-axis {
  display: flex;
  flex-direction: column;
}

.time-marker {
  height: 80px;
  display: flex;
  align-items: flex-start;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  padding-right: 0.5rem;
  text-align: right;
}

.bookings-container {
  position: relative;
  background: linear-gradient(to bottom, #f9fafb 0%, #f9fafb 100%);
  background-size: 100% 80px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.time-slot {
  position: absolute;
  width: 100%;
  height: 80px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.time-slot:hover {
  background-color: rgba(34, 197, 94, 0.05);
}

.booking-item {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 0.25rem;
  border-radius: 0.375rem;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;
}

.booking-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.booking-room {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-time {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  opacity: 0.95;
}

.booking-attendees {
  font-size: 0.7rem;
  opacity: 0.9;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  margin-bottom: 1.5rem;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .day-timeline {
    gap: 0.5rem;
    grid-template-columns: 60px 1fr;
  }

  .time-marker {
    font-size: 0.75rem;
    height: 60px;
  }

  .time-slot {
    height: 60px;
  }

  .booking-item {
    padding: 0.375rem;
  }

  .booking-room {
    font-size: 0.75rem;
  }

  .booking-time {
    font-size: 0.65rem;
  }
}
</style>
