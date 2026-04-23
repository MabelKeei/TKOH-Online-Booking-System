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
    <div
      ref="monthGridRef"
      class="month-grid flex-1"
      :style="{ gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))` }"
      :key="`grid-${currentDate.getFullYear()}-${currentDate.getMonth()}`"
    >
      <!-- 上个月的日期 -->
      <div
        v-for="(day, index) in prevMonthDays"
        :key="`prev-${index}-${day}`"
        class="date-cell empty"
        :class="{ 'first-col': (index % 7) === 0, 'last-col': (index % 7) === 6 }"
      >
        <span class="date-number">{{ day }}</span>
      </div>

      <!-- 本月的日期 -->
      <div
        v-for="(day, index) in daysInMonth"
        :key="`current-${day}`"
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
        <div v-if="hasBookings(day)" :class="['month-booking-list', { expanded: isDayExpanded(day) }]">
          <CalendarBookingPopover
            v-for="(booking, idx) in getVisibleBookings(day)"
            :key="booking.id ?? `b-${day}-${idx}`"
            :booking="booking"
            :current-date="currentDate"
            :fallback-day="day"
            default-color="#f97316"
          >
            <template #reference>
              <div
                class="month-event-bar"
                :style="{ '--booking-accent': booking.color || '#f97316' }"
              >
                <span class="month-event-text">{{ formatMonthEventLabel(booking) }}</span>
              </div>
            </template>
          </CalendarBookingPopover>
          <div
            v-if="getHiddenBookingCount(day) > 0"
            class="month-more-footer"
            @click.stop="toggleDayExpanded(day)"
          >
            +{{ getHiddenBookingCount(day) }}
          </div>
        </div>
      </div>

      <!-- 下个月的日期 -->
      <div
        v-for="(day, index) in nextMonthDays"
        :key="`next-${index}-${day}`"
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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

const emit = defineEmits(['day-click'])

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthGridRef = ref(null)
const monthCellHeight = ref(0)
const expandedDaySet = ref(new Set())
let gridResizeObserver = null

function formatMonthEventTime(startTime) {
  if (!startTime) return ''
  const parts = String(startTime).split(':')
  const h = parseInt(parts[0], 10)
  const m = parts[1] ?? '00'
  if (Number.isNaN(h)) return startTime
  return `${h}:${m}`
}

function formatMonthEventLabel(booking) {
  const time = formatMonthEventTime(booking.startTime)
  const title = (booking.topic || booking.notes || 'Booking').trim()
  return title ? `${time}：${title}` : time
}

function getMonthCellAvailableHeight() {
  // date number + vertical gaps/paddings 预留
  return Math.max(40, monthCellHeight.value - 36)
}

function getBaseVisibleCount() {
  // 事件条高度 + 行间距（按当前样式估算）
  const perLine = 26
  return Math.max(1, Math.floor((getMonthCellAvailableHeight() + 4) / perLine))
}

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

  // 如果前面的天数加上当月天数已经占满5行（35格），则只补齐到35格
  // 否则补齐到42格（6行）
  const targetCells = totalCells <= 35 ? 35 : 42
  const remainingCells = targetCells - totalCells

  for (let i = 1; i <= remainingCells; i++) {
    days.push(i)
  }
  return days
})

// 计算需要显示的行数
const gridRows = computed(() => {
  const totalCells = prevMonthDays.value.length + daysInMonth.value + nextMonthDays.value
  return totalCells / 7 // 35格=5行，42格=6行
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

// 获取某一天的预订（根据选中的房间过滤）
function getBookingsForDay(day) {
  const date = new Date(props.currentDate)
  const targetDate = new Date(date.getFullYear(), date.getMonth(), day)
  const dayBookings = props.bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate.toDateString() === targetDate.toDateString()
  })

  // 与 Day/Week 一致：未选中任何房间（如 Clear All）时不显示预订
  if (!props.selectedRooms || props.selectedRooms.length === 0) {
    return []
  }

  const selectedRoomNames = props.selectedRooms.map(room => room.name)
  return dayBookings
    .filter(booking => selectedRoomNames.includes(booking.roomName))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
}

function isDayExpanded(day) {
  return expandedDaySet.value.has(day)
}

function getCollapsedVisibleCount(day) {
  const total = getBookingsForDay(day).length
  const baseVisible = getBaseVisibleCount()
  if (total <= baseVisible) return total
  // 预留一行给 +num
  return Math.max(1, baseVisible - 1)
}

function getVisibleBookings(day) {
  const all = getBookingsForDay(day)
  if (isDayExpanded(day)) return all
  return all.slice(0, getCollapsedVisibleCount(day))
}

function getHiddenBookingCount(day) {
  const allCount = getBookingsForDay(day).length
  const shownCount = getVisibleBookings(day).length
  return Math.max(0, allCount - shownCount)
}

function toggleDayExpanded(day) {
  const next = new Set(expandedDaySet.value)
  if (next.has(day)) {
    next.delete(day)
  } else {
    next.add(day)
  }
  expandedDaySet.value = next
}

function updateMonthCellHeight() {
  const grid = monthGridRef.value
  if (!grid) return
  const rows = gridRows.value || 5
  const gap = Math.max(0, rows - 1) // month-grid gap: 1px
  monthCellHeight.value = Math.max(0, (grid.clientHeight - gap) / rows)
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

onMounted(() => {
  nextTick(() => {
    updateMonthCellHeight()
    if (!monthGridRef.value) return
    gridResizeObserver = new ResizeObserver(() => {
      updateMonthCellHeight()
    })
    gridResizeObserver.observe(monthGridRef.value)
  })
})

onUnmounted(() => {
  if (gridResizeObserver) {
    gridResizeObserver.disconnect()
    gridResizeObserver = null
  }
})

watch(
  () => [props.currentDate.getFullYear(), props.currentDate.getMonth(), gridRows.value],
  async () => {
    expandedDaySet.value = new Set()
    await nextTick()
    updateMonthCellHeight()
  }
)
</script>

<style scoped>
.calendar-month {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
  gap: 1px;
  background-color: #e5e7eb;
  border-radius: 0 0 0.5rem 0.5rem;
  overflow: hidden;
  flex: 1;
  height: 100%;
  min-height: 0;
  border: 1px solid #e5e7eb;
  border-top: none;
  align-content: stretch;
}

.date-cell {
  --cell-pad: 0.5rem;
  background-color: white;
  padding: var(--cell-pad);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow: hidden;
  height: 100%;
  min-height: 0;
  position: relative;
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
  position: relative;
  z-index: 1;
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

.date-cell.empty .date-number {
  color: #d1d5db;
}

.month-booking-list {
  position: absolute;
  left: var(--cell-pad);
  right: var(--cell-pad);
  top: calc(var(--cell-pad) + 1.35rem);
  bottom: var(--cell-pad);
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow: hidden;
}

.month-booking-list.expanded {
  max-height: 100%;
  overflow-y: auto;
  padding-right: 2px;
}

.month-event-bar {
  flex-shrink: 0;
  width: 100%;
  border-radius: 3px;
  border-left: 4px solid var(--booking-accent, #f97316);
  background-color: color-mix(in srgb, var(--booking-accent, #f97316) 42%, white);
  padding: 3px 6px 3px 7px;
  box-sizing: border-box;
  min-height: 1.35rem;
  display: flex;
  align-items: center;
  cursor: default;
}

.month-event-text {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #111827;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.month-more-footer {
  flex-shrink: 0;
  width: 100%;
  margin-top: 1px;
  padding: 3px 6px;
  border-radius: 3px;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 0.65rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  cursor: pointer;
}

@media (max-width: 389px) {
  .date-cell {
    --cell-pad: 0.5rem;
    padding: var(--cell-pad);
  }

  .date-number {
    font-size: 0.875rem;
  }

  .month-event-text {
    font-size: 0.625rem;
  }

  .month-more-footer {
    font-size: 0.6rem;
    padding: 2px 4px;
  }
}

@media (min-width: 390px) and (max-width: 767px) {
  .date-cell {
    --cell-pad: 0.5rem;
    padding: var(--cell-pad);
  }

  .date-number {
    font-size: 0.875rem;
  }

  .month-event-text {
    font-size: 0.625rem;
  }

  .month-more-footer {
    font-size: 0.6rem;
    padding: 2px 4px;
  }
}

@media (min-width: 768px) and (max-width: 1099px) {}

@media (min-width: 1100px) and (max-width: 1599px) {}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}
</style>
