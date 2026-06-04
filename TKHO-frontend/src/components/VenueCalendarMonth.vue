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
        :data-cell-key="dayCellKey(day, 'prev')"
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
        :data-cell-key="dayCellKey(day, 'current')"
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
        :data-cell-key="dayCellKey(day, 'next')"
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

    <!-- 隐藏：测量单条 / +N 底栏真实高度（随 zoom、断点变化） -->
    <div class="month-layout-probes" aria-hidden="true">
      <div ref="measureBarRef" class="month-event-bar">
        <span class="month-event-text">00:00 Measure</span>
      </div>
      <div ref="measureMoreRef" class="month-more-footer">+9</div>
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
const measureBarRef = ref(null)
const measureMoreRef = ref(null)
/** 每格可见条数（DOM 实测后写入，key = dayCellKey） */
const dayLayoutMap = ref(new Map())
const layoutEpoch = ref(0)
let gridResizeObserver = null
let layoutRafId = null

const LAYOUT_SLACK_PX = 6
const EMPTY_DAY_LAYOUT = { visibleCount: 0, hiddenCount: 0 }

function remPx (multiplier = 1) {
  if (typeof document === 'undefined') return 16 * multiplier
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return (Number.isFinite(root) ? root : 16) * multiplier
}

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

function stackBarsHeight (n, barPx, gapPx) {
  if (n <= 0) return 0
  return n * barPx + (n - 1) * gapPx
}

function measureEventBarPx () {
  const probe = measureBarRef.value
  if (probe) {
    const h = probe.getBoundingClientRect().height
    if (h > 0) return Math.ceil(h)
  }
  const live = monthGridRef.value?.querySelector('.month-event-bar')
  if (live) {
    const h = live.getBoundingClientRect().height
    if (h > 0) return Math.ceil(h)
  }
  return Math.ceil(remPx(1.35))
}

function measureMoreFooterPx () {
  const probe = measureMoreRef.value
  if (probe) {
    const h = probe.getBoundingClientRect().height
    if (h > 0) return Math.ceil(h)
  }
  return Math.ceil(remPx(1.375))
}

function measureListGapPx () {
  const listEl = monthGridRef.value?.querySelector('.month-booking-list')
  if (listEl) {
    const gap = parseFloat(getComputedStyle(listEl).gap)
    if (Number.isFinite(gap) && gap >= 0) return gap
  }
  return 4
}

/** 从已渲染格子 DOM 扣出中间列表区可用高度（用整格高度，不用已渲染条数撑开的列表高度） */
function measureListAreaPx (cellEl, reserveMoreFooter) {
  if (!cellEl) return 0

  const cellH = cellEl.getBoundingClientRect().height
  if (cellH < 1) return 0

  const dateEl = cellEl.querySelector('.date-number')
  const dateH = dateEl ? dateEl.offsetHeight : 0
  const cs = getComputedStyle(cellEl)
  const pad =
    (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0)
  const rowGap = parseFloat(cs.rowGap) || parseFloat(cs.gap) || 0

  const footerEl = cellEl.querySelector('.month-more-footer')
  let moreBlock = 0
  if (footerEl) {
    moreBlock = footerEl.offsetHeight + 2
  } else if (reserveMoreFooter) {
    moreBlock = 2 + measureMoreFooterPx()
  }

  return Math.max(0, cellH - pad - dateH - rowGap - moreBlock)
}

function computeLayoutFromListAreas (total, listNoMore, listWithMore, barPx, gapPx) {
  if (total <= 0) return EMPTY_DAY_LAYOUT

  const stack = (n) => stackBarsHeight(n, barPx, gapPx)
  if (stack(total) <= listNoMore + LAYOUT_SLACK_PX) {
    return { visibleCount: total, hiddenCount: 0 }
  }

  let visibleCount = 1
  for (let n = total; n >= 1; n--) {
    if (stack(n) <= listWithMore + LAYOUT_SLACK_PX) {
      visibleCount = n
      break
    }
  }

  return {
    visibleCount,
    hiddenCount: Math.max(0, total - visibleCount)
  }
}

function layoutMapSignature (map) {
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v.visibleCount}/${v.hiddenCount}`)
    .join('|')
}

/** 读取网格中任意一格的真实高度（同月各行等高） */
function getReferenceCellEl () {
  const grid = monthGridRef.value
  if (!grid) return null
  return (
    grid.querySelector('.date-cell.has-bookings') ||
    grid.querySelector('.date-cell')
  )
}

function recalculateDayLayoutsOnce () {
  const grid = monthGridRef.value
  if (!grid) return false

  const refCell = getReferenceCellEl()
  const refHeight = refCell?.getBoundingClientRect().height ?? 0
  if (refHeight < 12) return false

  const barPx = measureEventBarPx()
  const gapPx = measureListGapPx()
  const newMap = new Map()

  for (const cell of monthCellsInGridOrder.value) {
    const key = dayCellKey(cell.day, cell.segment)
    const total = getBookingsForDay(cell.day, cell.segment).length
    if (total <= 0) {
      newMap.set(key, EMPTY_DAY_LAYOUT)
      continue
    }

    const el =
      grid.querySelector(`[data-cell-key="${key}"]`) || refCell
    const listNoMore = measureListAreaPx(el, false)
    const listWithMore = measureListAreaPx(el, true)
    newMap.set(
      key,
      computeLayoutFromListAreas(total, listNoMore, listWithMore, barPx, gapPx)
    )
  }

  dayLayoutMap.value = newMap
  layoutEpoch.value += 1
  return true
}

async function runLayoutRecalcStable () {
  let lastSig = ''
  for (let pass = 0; pass < 5; pass++) {
    await nextTick()
    await new Promise((resolve) => requestAnimationFrame(resolve))
    if (!recalculateDayLayoutsOnce()) continue
    const sig = layoutMapSignature(dayLayoutMap.value)
    if (sig && sig === lastSig) break
    lastSig = sig
  }
}

function scheduleLayoutRecalc () {
  if (layoutRafId != null) cancelAnimationFrame(layoutRafId)
  layoutRafId = requestAnimationFrame(() => {
    layoutRafId = null
    void runLayoutRecalcStable()
  })
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

/** 各行均分网格高度，占满月历可视区域（5 行 / 6 行月格子高度不同） */
const monthGridStyle = computed(() => ({
  gridTemplateRows: `repeat(${gridRows.value}, minmax(0, 1fr))`
}))

function getDayLayout (day, segment = 'current') {
  void layoutEpoch.value
  const key = dayCellKey(day, segment)
  const cached = dayLayoutMap.value.get(key)
  if (cached) return cached

  const total = getBookingsForDay(day, segment).length
  if (total <= 0) return EMPTY_DAY_LAYOUT

  const refCell = getReferenceCellEl()
  if (!refCell) {
    return { visibleCount: total, hiddenCount: 0 }
  }

  const barPx = measureEventBarPx()
  const gapPx = measureListGapPx()
  const listNoMore = measureListAreaPx(refCell, false)
  const listWithMore = measureListAreaPx(refCell, true)
  return computeLayoutFromListAreas(total, listNoMore, listWithMore, barPx, gapPx)
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

function observeLayoutTargets () {
  if (!monthGridRef.value || typeof ResizeObserver === 'undefined') return
  gridResizeObserver?.disconnect()
  gridResizeObserver = new ResizeObserver(() => {
    scheduleLayoutRecalc()
  })
  const targets = new Set()
  const add = (el) => {
    if (el && !targets.has(el)) {
      targets.add(el)
      gridResizeObserver.observe(el)
    }
  }
  add(monthGridRef.value)
  add(monthGridRef.value.closest('.calendar-month'))
  add(monthGridRef.value.closest('.month-view'))
  add(monthGridRef.value.closest('.calendar-container'))
  add(monthGridRef.value.closest('.calendar-main'))
  add(monthGridRef.value.closest('.calendar-page'))
}

onMounted(() => {
  nextTick(() => {
    observeLayoutTargets()
    scheduleLayoutRecalc()
  })
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', scheduleLayoutRecalc)
  }
})

onUnmounted(() => {
  if (layoutRafId != null) cancelAnimationFrame(layoutRafId)
  layoutRafId = null
  gridResizeObserver?.disconnect()
  gridResizeObserver = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', scheduleLayoutRecalc)
  }
})

watch(
  () => [
    props.currentDate.getFullYear(),
    props.currentDate.getMonth(),
    gridRows.value,
    props.bookings,
    props.selectedRooms
  ],
  () => {
    scheduleLayoutRecalc()
  },
  { deep: true }
)
</script>

<style scoped>
.calendar-month {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}

.month-layout-probes {
  position: absolute;
  left: -9999px;
  top: 0;
  width: 140px;
  visibility: hidden;
  pointer-events: none;
  overflow: hidden;
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
