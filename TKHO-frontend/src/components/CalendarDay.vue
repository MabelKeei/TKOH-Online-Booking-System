<template>
  <div class="calendar-day">
    <!-- 时间槽网格 -->
    <div class="day-timeline">
      <div class="time-axis">
        <div v-for="hour in timeSlots" :key="hour" class="time-marker">
          {{ hour }}
        </div>
      </div>

      <div class="bookings-container">
        <!-- 时间槽背景（带横线） -->
        <div
          v-for="(hour, index) in timeSlots"
          :key="`bg-${hour}`"
          class="time-slot-bg"
        />

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
          v-for="(hour, index) in timeSlots"
          :key="`slot-${hour}`"
          class="time-slot"
          :style="{ top: `${index * 40}px` }"
          @click="selectTimeSlot(hour)"
        />
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

// 营业时间（7:00 - 21:00，30分钟间隔）
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

// 计算预订的位置和高度
function getBookingStyle(booking) {
  const startHour = parseInt(booking.startTime?.split(':')[0] || 0)
  const startMinute = parseInt(booking.startTime?.split(':')[1] || 0)
  const endHour = parseInt(booking.endTime?.split(':')[0] || 0)
  const endMinute = parseInt(booking.endTime?.split(':')[1] || 0)

  const startTime = startHour + startMinute / 60
  const endTime = endHour + endMinute / 60
  const duration = endTime - startTime

  const slotHeight = 40 // 每30分钟的高度
  const offset = (startTime - 7) * slotHeight * 2 + 40 // 7:00是起始时间，*2因为每小时有2个30分钟槽
  const height = duration * slotHeight * 2

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

.day-timeline {
  position: relative;
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 0;
  min-height: 800px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.time-axis {
  display: flex;
  flex-direction: column;
  background-color: #f9fafb;
}

.time-marker {
  height: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  padding-right: 0.5rem;
  border-right: 1px solid #e5e7eb;
  position: relative;
  box-sizing: border-box;
}

.time-marker::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
}

.bookings-container {
  position: relative;
  background-color: white;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.time-slot-bg {
  height: 40px;
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
}

.time-slot-bg:last-child {
  border-bottom: none;
}

.time-slot {
  position: absolute;
  width: 100%;
  height: 40px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  z-index: 1;
  box-sizing: border-box;
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
  z-index: 2;
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

@media (max-width: 768px) {
  .day-timeline {
    gap: 0;
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
