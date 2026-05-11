<template>
  <div class="calendar-page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden" style="padding-top: var(--app-header-height, 64px);">
    <AppHeader />

    <div v-if="!showTopTip" class="top-tip-toggle-wrapper">
      <button
        type="button"
        class="top-tip-toggle-btn"
        aria-label="显示重要提示"
        title="显示重要提示"
        @click="showTopTip = true"
      ></button>
    </div>
    <div v-if="showTopTip" class="top-tip-wrapper px-2 md:px-3 lg:px-4 pt-2 pb-0">
      <div class="booking-window-tip">
        <span>Important Note: Updates on Booking Rules of EV Charging Facilities.</span>
        <button type="button" class="read-more-link" @click="noticeDialogVisible = true">Read more...</button>
        <button type="button" class="tip-close-btn" aria-label="关闭重要提示" @click="showTopTip = false">
          &times;
        </button>
      </div>
    </div>

    <!-- 主体内容 -->
    <main
      class="calendar-main flex-1 flex flex-col px-2 md:px-3 lg:px-4 pt-0 pb-1 md:pb-2 overflow-hidden"
      :class="{ 'tip-collapsed-gap': !showTopTip }"
    >
      <!-- 日历内容区域 -->
      <div class="calendar-container flex-1 overflow-auto">
        <div class="calendar-wrapper">
          <!-- 周视图 -->
          <div v-for="week in weeks" :key="week.id" class="week-section">
            <div class="week-header">
              {{ week.dateRange }}
            </div>
            <div class="week-grid">
              <!-- 表头 -->
              <div class="grid-header">
                <div v-for="day in week.days" :key="day.date" class="day-header" :class="{ 'is-today': day.isToday }">
                  <div class="day-name">{{ day.dayName }}</div>
                  <div class="day-number">{{ day.dayNumber }}</div>
                </div>
              </div>

              <!-- 时间段行 -->
              <div v-for="period in timePeriods" :key="period.id" class="time-row">
                <div class="time-label">{{ period.label }}</div>
                <div
                  v-for="day in week.days"
                  :key="`${day.date}-${period.id}`"
                  class="time-cell"
                  :class="getAvailabilityClass(day.date, period.id)"
                  @click="selectTimeSlot(day.date, period.id)"
                >
                  <div class="availability">{{ getAvailabilityText(day.date, period.id, period.label) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- EV预订对话框 -->
    <EVBookingDialog
      :visible="dialogVisible"
      :selected-date="selectedDate"
      :selected-period="selectedPeriod"
      :available-slots="bookings"
      @close="closeDialog"
      @confirm="handleBookingConfirm"
    />
    <BookingStyleModal
      v-model="noticeDialogVisible"
      title="Important Note"
      max-width="720px"
      custom-class="important-note-modal"
    >
      <div class="ev-rule-notice-content" v-html="evRuleNoticeContent"></div>
    </BookingStyleModal>

    <div v-if="statusDialog.visible" class="status-modal-overlay" @click.self="statusDialog.visible = false">
      <div class="status-modal-wrapper">
        <div class="status-modal-header">
          <span class="status-modal-title">Reminder</span>
          <button type="button" class="status-modal-close" @click="statusDialog.visible = false">
            <svg viewBox="0 0 24 24" class="status-close-icon">
              <path d="M18 6L6 18M6 6l12 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="status-modal-body">
          <p class="status-dialog-message">{{ statusDialog.message }}</p>
        </div>
        <div class="status-modal-footer">
          <el-button class="status-confirm-btn" type="default" @click="statusDialog.visible = false">OK</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from '../components/AppHeader.vue'
import EVBookingDialog from '../components/EVBookingDialog.vue'
import BookingStyleModal from '../components/BookingStyleModal.vue'
import { generateEVBookingsMock, getMockPromptList } from '@/mocks/mockData'

// 对话框状态
const dialogVisible = ref(false)
const noticeDialogVisible = ref(false)
const showTopTip = ref(true)
const selectedDate = ref('')
const selectedPeriod = ref('')
const statusDialog = ref({
  visible: false,
  message: ''
})
const DAY_MS = 24 * 60 * 60 * 1000
const createDateAtMidnight = (baseDate = new Date()) => {
  const date = new Date(baseDate)
  date.setHours(0, 0, 0, 0)
  return date
}
const formatDateToYmd = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const getDynamicEvBookingWindow = () => {
  const today = createDateAtMidnight()
  const start = new Date(today.getTime() + DAY_MS)
  const end = new Date(today.getTime() + 14 * DAY_MS)
  return {
    currentStartDate: formatDateToYmd(start),
    currentEndDate: formatDateToYmd(end)
  }
}
const evBookingWindow = ref(getDynamicEvBookingWindow())
const promptList = getMockPromptList()
const evRuleNoticeContent = computed(() => {
  return promptList.find(item => item.key === 'ev_booking_rule_update_notice')?.content || ''
})
const evWindowRange = computed(() => ({
  start: new Date(`${evBookingWindow.value.currentStartDate}T00:00:00`),
  end: new Date(`${evBookingWindow.value.currentEndDate}T23:59:59`)
}))

// 时间段定义
const timePeriods = [
  { id: 'am', label: 'AM' },
  { id: 'pm', label: 'PM' },
  { id: 'night', label: 'Night' }
]

// 预订数据（示例）
const bookings = ref({})

function isDateInEvWindow(dateLike) {
  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return false
  const { start, end } = evWindowRange.value
  return date >= start && date <= end
}

// 生成两周的数据（动态显示：明天到第14天）
const weeks = computed(() => {
  const { start, end } = evWindowRange.value
  const result = []
  const today = createDateAtMidnight()
  const allDays = []

  for (let dateMs = start.getTime(); dateMs <= end.getTime(); dateMs += DAY_MS) {
    const date = new Date(dateMs)
    allDays.push({
      date: formatDateToYmd(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: String(date.getDate()).padStart(2, '0'),
      isToday: date.toDateString() === today.toDateString()
    })
  }

  for (let weekIndex = 0; weekIndex < allDays.length; weekIndex += 7) {
    const weekDays = allDays.slice(weekIndex, weekIndex + 7)
    const weekStart = new Date(`${weekDays[0].date}T00:00:00`)
    const weekEnd = new Date(`${weekDays[weekDays.length - 1].date}T00:00:00`)
    result.push({
      id: weekIndex / 7,
      dateRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      days: weekDays
    })
  }

  return result
})

// 获取可用性数据
function getAvailabilityData(date, period) {
  if (!isDateInEvWindow(`${date}T12:00:00`)) {
    return { available: 0, total: 0, outOfWindow: true }
  }
  const key = `${date}-${period}`
  return bookings.value[key] || { available: 3, total: 3 }
}

// 获取可用性文本
function getAvailabilityText(date, period, periodLabel) {
  const data = getAvailabilityData(date, period)
  if (data.outOfWindow) return 'Closed'
  if (data.available === 0) {
    return 'Full'
  }
  return periodLabel
}

// 获取可用性样式类
function getAvailabilityClass(date, period) {
  const data = getAvailabilityData(date, period)
  if (data.outOfWindow) {
    return 'is-closed'
  }
  if (data.available === 0) {
    return 'is-full'
  }
  return ''
}

// 选择时间段
function selectTimeSlot(date, period) {
  if (!isDateInEvWindow(`${date}T12:00:00`)) {
    statusDialog.value = {
      visible: true,
      message: 'This date is outside the EV booking date range'
    }
    return
  }
  const data = getAvailabilityData(date, period)
  if (data.available === 0) {
    statusDialog.value = {
      visible: true,
      message: 'This time slot is fully booked'
    }
    return
  }
  selectedDate.value = date
  selectedPeriod.value = period
  dialogVisible.value = true
}

// 关闭对话框
function closeDialog() {
  dialogVisible.value = false
  selectedDate.value = ''
  selectedPeriod.value = ''
}

// 处理预订确认
function handleBookingConfirm(bookingData) {
  console.log('Booking confirmed:', bookingData)

  // 更新预订数据
  const key = `${bookingData.date}-${bookingData.timePeriod}`
  const currentData = bookings.value[key] || { available: 3, total: 3 }
  bookings.value[key] = {
    ...currentData,
    available: Math.max(0, currentData.available - 1)
  }

  closeDialog()
  statusDialog.value = {
    visible: true,
    message: 'Booking created successfully!'
  }
}

// 初始化数据
onMounted(() => {
  bookings.value = generateEVBookingsMock({
    days: 14,
    periods: timePeriods.map((p) => p.id),
    totalPerSlot: 3
  })
})
</script>

<style scoped>
.calendar-page {
  height: var(--zoom-vh);
  background: linear-gradient(135deg, #f8ecdd 0%, #f5e6d3 50%, #f8ecdd 100%);
  position: relative;
}

.calendar-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 114, 58, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 114, 58, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.calendar-main {
  position: relative;
  z-index: 1;
}

.calendar-main.tip-collapsed-gap {
  margin-top: 6px;
}

.calendar-container {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border: 1px solid rgba(0, 114, 58, 0.08);
  transition: box-shadow 0.3s ease;
}

.calendar-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.booking-window-tip {
  margin-bottom: 0.25rem;
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
  color: #166534;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.read-more-link {
  border: none;
  background: transparent;
  color: #0f766e;
  font-size: inherit;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

.read-more-link:hover {
  color: #115e59;
}

.tip-close-btn {
  margin-left: auto;
  width: 22px;
  height: 22px;
  border: 1px solid #86efac;
  border-radius: 9999px;
  background: #dcfce7;
  color: #166534;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.tip-close-btn:hover {
  background: #bbf7d0;
  border-color: #4ade80;
}

.top-tip-toggle-wrapper {
  position: relative;
  height: 0;
  z-index: 30;
}

.top-tip-toggle-btn {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 34px;
  height: 18px;
  border: 1px solid #166534;
  border-top: none;
  border-radius: 0 0 16px 16px;
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-tip-toggle-btn::before {
  content: '';
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7px solid #ffffff;
  opacity: 0.95;
}

.top-tip-toggle-btn:hover {
  background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
  transform: translateX(-50%) translateY(1px);
  box-shadow: 0 3px 10px rgba(22, 101, 52, 0.32);
}

.top-tip-toggle-btn:focus-visible {
  outline: 2px solid #bbf7d0;
  outline-offset: 2px;
}

.ev-rule-notice-content {
  color: #1f2937;
  font-size: 14px;
  line-height: 1.6;
}

.ev-rule-notice-content :deep(p) {
  margin: 0 0 8px;
}

.ev-rule-notice-content :deep(strong) {
  color: #111827;
}

.ev-rule-notice-content :deep(.attention-line),
.ev-rule-notice-content :deep(.main-title) {
  color: #ef4444;
  font-weight: 700;
  text-align: center;
}

.ev-rule-notice-content :deep(.attention-line) {
  margin-bottom: 2px;
  font-size: 14px;
}

.ev-rule-notice-content :deep(.main-title) {
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.5;
}

.ev-rule-notice-content :deep(.section-title) {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  text-decoration: underline;
}

.ev-rule-notice-content :deep(.line-item) {
  margin-bottom: 2px;
  font-size: 14px;
  color: #111827;
}

.ev-rule-notice-content :deep(.line-item .change-highlight) {
  color: #ef4444;
}

.calendar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.week-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.week-header {
  font-size: clamp(0.875rem, 2vw, 1.125rem);
  font-weight: 600;
  color: #111827;
  text-align: center;
  padding: 0.25rem;
}

.week-grid {
  border: 2px solid #00723a;
  border-radius: 6px;
  overflow: hidden;
}

.grid-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #00723a;
}

.day-header {
  padding: clamp(0.375rem, 1.5vw, 0.75rem);
  text-align: center;
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.day-header:last-child {
  border-right: none;
}

.day-header.is-today {
  background: rgba(255, 255, 255, 0.15);
}

.day-name {
  font-size: clamp(0.625rem, 1.5vw, 0.875rem);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.day-number {
  font-size: clamp(1rem, 3vw, 1.5rem);
  font-weight: 700;
}

.time-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
}

.time-row:last-child {
  border-bottom: none;
}

.time-label {
  display: none;
}

.time-cell {
  padding: clamp(0.75rem, 2vw, 1.5rem) clamp(0.25rem, 1vw, 0.5rem);
  text-align: center;
  border-right: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-cell:last-child {
  border-right: none;
}

.time-cell:hover:not(.is-full) {
  background-color: #f3f4f6;
}

.time-cell.is-full {
  background-color: #fecaca;
  cursor: not-allowed;
}

.time-cell.is-closed {
  background-color: #e5e7eb;
  cursor: not-allowed;
}

.time-cell.is-closed .availability {
  color: #6b7280;
  font-weight: 700;
}

.time-cell.is-full:hover {
  background-color: #fca5a5;
}

.availability {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 700;
  color: #374151;
}

.status-modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.status-modal-wrapper {
  width: min(92vw, 420px);
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.status-modal-header {
  background: #00723a;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.5;
}

.status-modal-close {
  background: none;
  border: none;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.status-close-icon {
  width: 20px;
  height: 20px;
  stroke: #ffffff;
  fill: none;
}

.status-modal-close:hover .status-close-icon {
  stroke: #d1fae5;
}

.status-modal-body {
  padding: 1.25rem 1.5rem 1rem;
}

.status-dialog-message {
  margin: 0;
  font-size: 15px;
  text-align: center;
  line-height: 1.5;
  color: #333333;
}

.status-modal-footer {
  padding: 0.9rem 1.25rem 1.1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.status-confirm-btn {
  background-color: #00723a;
  border-color: #00723a;
  color: #ffffff;
  font-weight: 600;
  min-width: 88px;
}

.status-confirm-btn:hover {
  background-color: #005a2e;
  border-color: #005a2e;
  color: #ffffff;
}

.time-cell.is-full .availability {
  color: #dc2626;
  font-weight: 700;
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 389px), (min-width: 390px) and (max-width: 767px) {
  .calendar-container {
    padding: 0.5rem;
    border-radius: 6px;
  }

  .calendar-wrapper {
    gap: 0.75rem;
  }

  .week-grid {
    border-width: 1px;
  }

  .time-cell {
    min-height: 2.5rem;
  }

}

@media (max-width: 389px) {
  .calendar-container {
    padding: 0.375rem;
  }

  .week-section {
    gap: 0.125rem;
  }

  .day-header {
    gap: 0;
  }

  .time-cell {
    min-height: 2rem;
  }
}

/* Responsive adjustments */
@media (min-width: 2240px) {
  .calendar-container {
    padding: 1.5rem;
  }

  .calendar-wrapper {
    gap: 1.5rem;
  }

  .week-section {
    gap: 0.5rem;
  }
}
</style>





