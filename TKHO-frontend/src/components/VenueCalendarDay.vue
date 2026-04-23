<template>
  <div class="calendar-day">
    <!-- 房间表头 - 固定 -->
    <div class="day-header" :style="{ gridTemplateColumns: dayGridTemplateColumns, minWidth: dayGridMinWidth }">
      <div class="time-header" />
      <div v-for="room in selectedRooms" :key="room.id" class="room-header">
        <div class="room-label">{{ room.name }}</div>
      </div>
    </div>

    <!-- 时间槽网格 -->
    <div class="day-grid" :style="{ gridTemplateColumns: dayGridTemplateColumns, minWidth: dayGridMinWidth }">
      <!-- 时间列 -->
      <div class="time-column">
        <div v-for="hour in timeSlots" :key="hour" class="time-slot">
          {{ hour }}
        </div>
      </div>

      <!-- 每个房间的槽位 -->
      <div v-for="room in selectedRooms" :key="room.id" class="room-column">
        <!-- 时间格子 -->
        <div
          v-for="hour in timeSlots"
          :key="`${room.id}-${hour}`"
          class="time-cell"
          @click="selectTimeSlot(room, hour)"
        />

        <!-- 预订卡片（绝对定位） -->
        <CalendarBookingPopover
          v-for="booking in getRoomBookings(room.name)"
          :key="booking.id"
          :booking="booking"
          :current-date="currentDate"
          default-color="#3b82f6"
          :teleported="false"
        >
          <template #reference>
            <div
              class="booking-block"
              :style="getBookingStyle(booking)"
              @click="selectBooking(booking)"
            >
              <div class="booking-time">{{ booking.startTime }} - {{ booking.endTime }}</div>
              <div class="booking-topic">{{ booking.topic || booking.notes }}</div>
              <div v-if="booking.reservedBy" class="booking-reserved">Reserved By: {{ booking.reservedBy }}</div>
              <div class="booking-contact">Contact: {{ getBookingContact(booking) }}</div>
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

const dayGridTemplateColumns = computed(() => {
  const roomCount = Math.max(props.selectedRooms.length, 1)
  return `80px repeat(${roomCount}, minmax(170px, 1fr))`
})

const dayGridMinWidth = computed(() => {
  const roomCount = Math.max(props.selectedRooms.length, 1)
  return `calc(80px + ${roomCount} * 170px)`
})

// 获取特定房间的预订
function getRoomBookings(roomName) {
  return props.bookings.filter(booking => booking.roomName === roomName)
}

function getBookingContact(booking) {
  return booking.contact ?? booking.contactNumber ?? booking.phone ?? booking.tel ?? 'N/A'
}

// 计算预订的位置和高度
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
    backgroundColor: booking.color || '#3b82f6'
  }
}

// 选择时间槽
function selectTimeSlot(room, hour) {
  const year = props.currentDate.getFullYear()
  const month = String(props.currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(props.currentDate.getDate()).padStart(2, '0')
  emit('time-slot-click', {
    date: `${year}-${month}-${day}`,
    time: hour,
    room: room.name
  })
}

// 选择预订
function selectBooking(booking) {
  console.log('Selected booking:', booking)
}
</script>

<style scoped>
.calendar-day {
  width: 100%;
  position: relative;
}

.day-header {
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

.room-header {
  background-color: #f3f4f6;
  padding: 0.5rem;
  text-align: center;
  border-right: 1px solid #e5e7eb;
}

.room-header:last-child {
  border-right: none;
}

.room-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  white-space: nowrap;
}

.day-grid {
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

.room-column {
  display: flex;
  flex-direction: column;
  position: relative;
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

.room-column:last-child .time-cell {
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
  font-size: 0.7rem;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.booking-block:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.booking-time {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
  margin-bottom: 0.125rem;
}

.booking-topic {
  font-size: 0.75rem;
  opacity: 0.95;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.booking-reserved {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-top: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.booking-contact {
  font-size: 0.7rem;
  opacity: 0.9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 389px) {
  .time-slot {
    height: 50px;
    font-size: 0.75rem;
  }

  .time-cell {
    height: 50px;
  }

  .booking-time {
    font-size: 0.7rem;
  }

  .booking-topic {
    font-size: 0.65rem;
  }

  .booking-reserved {
    font-size: 0.6rem;
  }

  .booking-contact {
    font-size: 0.6rem;
  }
}

@media (min-width: 390px) and (max-width: 767px) {
  .time-slot {
    height: 50px;
    font-size: 0.75rem;
  }

  .time-cell {
    height: 50px;
  }

  .booking-time {
    font-size: 0.7rem;
  }

  .booking-topic {
    font-size: 0.65rem;
  }

  .booking-reserved {
    font-size: 0.6rem;
  }

  .booking-contact {
    font-size: 0.6rem;
  }
}

@media (min-width: 768px) and (max-width: 1099px) {}

@media (min-width: 1100px) and (max-width: 1599px) {}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}
</style>
