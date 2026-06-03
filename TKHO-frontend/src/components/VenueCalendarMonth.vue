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
      :style="monthGridStyle"
      :key="`grid-${currentDate.getFullYear()}-${currentDate.getMonth()}`"
    >
      <!-- 上个月的日期 -->
      <div
        v-for="(day, index) in prevMonthDays"
        :key="`prev-${index}-${day}`"
        class="date-cell"
        :class="{
          empty: !hasBookings(day, 'prev'),
          'has-bookings': hasBookings(day, 'prev'),
          'has-more-trigger': getHiddenBookingCount(day, 'prev') > 0,
          'first-col': (index % 7) === 0,
          'last-col': (index % 7) === 6
        }"
        @click="selectDate(day, 'prev')"
      >
        <span class="date-number">{{ day }}</span>
        <div
          v-if="hasBookings(day, 'prev')"
          class="month-booking-list"
        >
          <CalendarBookingPopover
            v-for="(booking, idx) in getVisibleBookings(day, 'prev')"
            :key="booking.id ?? `b-prev-${day}-${idx}`"
            :booking="booking"
            :current-date="currentDate"
            :fallback-day="day"
            :rooms="selectedRooms"
            default-color="#f97316"
          >
            <template #reference>
              <div
                class="month-event-bar"
                :class="{ 'is-blocked': booking.isBlocked }"
                :style="getMonthEventStyle(booking)"
              >
                <span class="month-event-text">{{ formatMonthEventLabel(booking) }}</span>
              </div>
            </template>
          </CalendarBookingPopover>
        </div>
        <MonthDayMorePopover
          v-if="getHiddenBookingCount(day, 'prev') > 0"
          :cell-date="resolveCellDate(day, 'prev')"
          :current-date="currentDate"
          :bookings="getBookingsForDay(day, 'prev')"
          :hidden-count="getHiddenBookingCount(day, 'prev')"
          :selected-rooms="selectedRooms"
        />
      </div>

      <!-- 本月的日期 -->
      <div
        v-for="(day, index) in daysInMonth"
        :key="`current-${day}`"
        class="date-cell"
        :class="{
          'today': isToday(day),
          'has-bookings': hasBookings(day, 'current'),
          'has-more-trigger': getHiddenBookingCount(day, 'current') > 0,
          'first-col': ((prevMonthDays.length + index) % 7) === 0,
          'last-col': ((prevMonthDays.length + index) % 7) === 6
        }"
        @click="selectDate(day, 'current')"
      >
        <span class="date-number">{{ day }}</span>
        <div
          v-if="hasBookings(day, 'current')"
          class="month-booking-list"
        >
          <CalendarBookingPopover
            v-for="(booking, idx) in getVisibleBookings(day, 'current')"
            :key="booking.id ?? `b-cur-${day}-${idx}`"
            :booking="booking"
            :current-date="currentDate"
            :fallback-day="day"
            :rooms="selectedRooms"
            default-color="#f97316"
          >
            <template #reference>
              <div
                class="month-event-bar"
                :class="{ 'is-blocked': booking.isBlocked }"
                :style="getMonthEventStyle(booking)"
              >
                <span class="month-event-text">{{ formatMonthEventLabel(booking) }}</span>
              </div>
            </template>
          </CalendarBookingPopover>
        </div>
        <MonthDayMorePopover
          v-if="getHiddenBookingCount(day, 'current') > 0"
          :cell-date="resolveCellDate(day, 'current')"
          :current-date="currentDate"
          :bookings="getBookingsForDay(day, 'current')"
          :hidden-count="getHiddenBookingCount(day, 'current')"
          :selected-rooms="selectedRooms"
        />
      </div>

      <!-- 下个月的日期 -->
      <div
        v-for="(day, index) in nextMonthDays"
        :key="`next-${index}-${day}`"
        class="date-cell"
        :class="{
          empty: !hasBookings(day, 'next'),
          'has-bookings': hasBookings(day, 'next'),
          'has-more-trigger': getHiddenBookingCount(day, 'next') > 0,
          'first-col': ((prevMonthDays.length + daysInMonth + index) % 7) === 0,
          'last-col': ((prevMonthDays.length + daysInMonth + index) % 7) === 6
        }"
        @click="selectDate(day, 'next')"
      >
        <span class="date-number">{{ day }}</span>
        <div
          v-if="hasBookings(day, 'next')"
          class="month-booking-list"
        >
          <CalendarBookingPopover
            v-for="(booking, idx) in getVisibleBookings(day, 'next')"
            :key="booking.id ?? `b-next-${day}-${idx}`"
            :booking="booking"
            :current-date="currentDate"
            :fallback-day="day"
            :rooms="selectedRooms"
            default-color="#f97316"
          >
            <template #reference>
              <div
                class="month-event-bar"
                :class="{ 'is-blocked': booking.isBlocked }"
                :style="getMonthEventStyle(booking)"
              >
                <span class="month-event-text">{{ formatMonthEventLabel(booking) }}</span>
              </div>
            </template>
          </CalendarBookingPopover>
        </div>
        <MonthDayMorePopover
          v-if="getHiddenBookingCount(day, 'next') > 0"
          :cell-date="resolveCellDate(day, 'next')"
          :current-date="currentDate"
          :bookings="getBookingsForDay(day, 'next')"
          :hidden-count="getHiddenBookingCount(day, 'next')"
          :selected-rooms="selectedRooms"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import CalendarBookingPopover from './CalendarBookingPopover.vue'
import MonthDayMorePopover from './MonthDayMorePopover.vue'
import { isSameCalendarDay, getCalendarBookingBlockStyle } from '@/utils/venueCalendarApi'

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
const monthCellHeight = ref(88)
let gridResizeObserver = null

/** 月历格布局常量（与 CSS 中条高 / 内边距一致） */
const CELL_MIN_PX = 88
const CELL_PAD_PX = 16
const DATE_ROW_PX = 20
const ROW_GAP_PX = 4
/** 单条预订高度 ≈ min-height 1.35rem + 列表 gap 4px */
const EVENT_LINE_PX = 22
const MORE_FOOTER_PX = 18
/** 布局测量允许 1–2px 误差，避免过早出现 +N */
const LAYOUT_SLACK_PX = 2

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

function getMonthEventStyle (booking) {
  return getCalendarBookingBlockStyle(booking, {}, props.selectedRooms)
}

function dayCellKey (day, segment = 'current') {
  return `${segment}-${day}`
}

function heightForVisibleBars (visibleBars, totalBookings) {
  const hasMore = totalBookings > visibleBars
  return (
    CELL_PAD_PX * 2 +
    DATE_ROW_PX +
    ROW_GAP_PX +
    visibleBars * EVENT_LINE_PX +
    (hasMore ? ROW_GAP_PX + MORE_FOOTER_PX : 0)
  )
}

/** 按格子实测高度与预订数量：尽量多显示条数，放不下再 +N（行高由 1fr 均分视口） */
function computeDayLayout (totalBookings, cellHeightPx) {
  const cellH = Math.max(CELL_MIN_PX, cellHeightPx || CELL_MIN_PX)
  const fitLimit = cellH + LAYOUT_SLACK_PX

  if (totalBookings <= 0) {
    return { visibleCount: 0, hiddenCount: 0 }
  }

  if (heightForVisibleBars(totalBookings, totalBookings) <= fitLimit) {
    return { visibleCount: totalBookings, hiddenCount: 0 }
  }

  let visibleCount = 1
  for (let n = totalBookings; n >= 1; n--) {
    if (heightForVisibleBars(n, totalBookings) <= fitLimit) {
      visibleCount = n
      break
    }
  }

  return {
    visibleCount,
    hiddenCount: Math.max(0, totalBookings - visibleCount)
  }
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

function resolveCellDate (day, segment = 'current') {
  const y = props.currentDate.getFullYear()
  const m = props.currentDate.getMonth()
  if (segment === 'prev') return new Date(y, m - 1, day)
  if (segment === 'next') return new Date(y, m + 1, day)
  return new Date(y, m, day)
}

function getBookingsForDay (day, segment = 'current') {
  const targetDate = resolveCellDate(day, segment)
  const dayBookings = props.bookings.filter(booking =>
    isSameCalendarDay(booking.date, targetDate)
  )

  if (!props.selectedRooms || props.selectedRooms.length === 0) {
    return []
  }

  const selectedRoomNames = props.selectedRooms.map(room => room.name)
  return dayBookings
    .filter(booking => selectedRoomNames.includes(booking.roomName))
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
}

/** 与模板一致的 35/42 格顺序 */
const monthCellsInGridOrder = computed(() => {
  const cells = []
  for (const day of prevMonthDays.value) {
    cells.push({ day, segment: 'prev' })
  }
  for (let day = 1; day <= daysInMonth.value; day++) {
    cells.push({ day, segment: 'current' })
  }
  for (const day of nextMonthDays.value) {
    cells.push({ day, segment: 'next' })
  }
  return cells
})

const dayLayoutByKey = computed(() => {
  const cellH = monthCellHeight.value
  const map = new Map()
  for (const cell of monthCellsInGridOrder.value) {
    const total = getBookingsForDay(cell.day, cell.segment).length
    map.set(dayCellKey(cell.day, cell.segment), computeDayLayout(total, cellH))
  }
  return map
})

/** 各行均分网格高度，占满月历可视区域 */
const monthGridStyle = computed(() => ({
  gridTemplateRows: `repeat(${gridRows.value}, minmax(0, 1fr))`
}))

function getDayLayout (day, segment = 'current') {
  return (
    dayLayoutByKey.value.get(dayCellKey(day, segment)) ??
    computeDayLayout(0, monthCellHeight.value)
  )
}

function updateMonthCellHeight () {
  const grid = monthGridRef.value
  if (!grid) return
  const rows = gridRows.value || 5
  const gap = Math.max(0, rows - 1)
  monthCellHeight.value = Math.max(
    CELL_MIN_PX,
    (grid.clientHeight - gap) / rows
  )
}

// 判断是否是今天
function isToday (day) {
  const target = resolveCellDate(day, 'current')
  return isSameCalendarDay(target, new Date())
}

function getVisibleBookings (day, segment = 'current') {
  const all = getBookingsForDay(day, segment)
  const { visibleCount } = getDayLayout(day, segment)
  return all.slice(0, visibleCount)
}

function getHiddenBookingCount (day, segment = 'current') {
  return getDayLayout(day, segment).hiddenCount
}

function hasBookings (day, segment = 'current') {
  return getBookingsForDay(day, segment).length > 0
}

function selectDate (day, segment = 'current') {
  emit('day-click', resolveCellDate(day, segment))
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
  gridResizeObserver?.disconnect()
  gridResizeObserver = null
})

watch(
  () => [
    props.currentDate.getFullYear(),
    props.currentDate.getMonth(),
    gridRows.value,
    props.bookings,
    props.selectedRooms
  ],
  async () => {
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
  --month-more-slot: 1.375rem;
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
  max-height: 100%;
  position: relative;
  box-sizing: border-box;
}

.date-cell.has-bookings {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.25rem;
  align-content: stretch;
}

.date-cell.has-bookings.has-more-trigger {
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 2px 0;
  padding-bottom: 0.25rem;
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
  background-color: #fffbeb;
}

.date-cell.first-col {
  border-left: 1px solid #e5e7eb;
}

.date-cell.last-col {
  border-right: 1px solid #e5e7eb;
}

/* 14" zoom + teleported=false：仅放开当前格子，避免整表 overflow 错乱 */
.date-cell:has(> .month-more-root.is-popover-open) {
  overflow: visible;
  z-index: 45;
}

.date-number {
  position: relative;
  z-index: 1;
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
  grid-row: 1;
  align-self: start;
}

.date-cell.empty .date-number {
  color: #d1d5db;
}

.month-booking-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 2px;
  grid-row: 2;
}

.date-cell.has-more-trigger .month-more-root {
  grid-row: 3;
  flex-shrink: 0;
}

.month-event-bar {
  flex-shrink: 0;
  width: 100%;
  border-radius: 3px;
  border-left-width: 4px;
  border-left-style: solid;
  /* 色条颜色与背景由 getMonthEventStyle 内联设置 */
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

.month-event-bar.is-blocked .month-event-text {
  color: #dc2626;
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

}

@media (min-width: 768px) and (max-width: 1099px) {}

@media (min-width: 1100px) and (max-width: 1599px) {}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}
</style>
