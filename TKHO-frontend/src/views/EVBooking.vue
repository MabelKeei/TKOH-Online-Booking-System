<template>
  <div class="calendar-page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden pt-[64px]">
    <AppHeader @logout="onLogout" />

    <!-- 主体内容 -->
    <main class="calendar-main flex-1 flex flex-col px-2 md:px-3 lg:px-4 py-1 md:py-2 overflow-hidden">
      <div class="booking-window-tip">
        Current EV booking date range: {{ evBookingWindow.currentStartDate }} to {{ evBookingWindow.currentEndDate }}
      </div>
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
                  <div class="availability">{{ getAvailabilityText(day.date, period.id) }}</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import EVBookingDialog from '../components/EVBookingDialog.vue'
import { generateEVBookingsMock, getMockBookingWindow } from '@/mocks/mockData'

const router = useRouter()

// 对话框状态
const dialogVisible = ref(false)
const selectedDate = ref('')
const selectedPeriod = ref('')
const evBookingWindow = ref(getMockBookingWindow('ev'))
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

// 获取周开始日期（周日）
function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function isDateInEvWindow(dateLike) {
  const date = new Date(dateLike)
  if (Number.isNaN(date.getTime())) return false
  const { start, end } = evWindowRange.value
  return date >= start && date <= end
}

// 生成两周的数据（固定显示未来14天）
const weeks = computed(() => {
  const result = []
  const today = new Date()
  const startDate = getWeekStart(today)

  for (let weekIndex = 0; weekIndex < 2; weekIndex++) {
    const weekStart = new Date(startDate)
    weekStart.setDate(weekStart.getDate() + weekIndex * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)

      const isToday = date.toDateString() === today.toDateString()

      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: String(date.getDate()).padStart(2, '0'),
        isToday
      })
    }

    result.push({
      id: weekIndex,
      dateRange: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      days
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
function getAvailabilityText(date, period) {
  const data = getAvailabilityData(date, period)
  if (data.outOfWindow) return 'Closed'
  if (data.available === 0) {
    return 'Full'
  }
  return `${data.available}/${data.total}`
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
  if (data.available === 1) {
    return 'is-limited'
  }
  return ''
}

// 选择时间段
function selectTimeSlot(date, period) {
  if (!isDateInEvWindow(`${date}T12:00:00`)) {
    ElMessage.warning('This date is outside the EV booking date range')
    return
  }
  const data = getAvailabilityData(date, period)
  if (data.available === 0) {
    ElMessage.warning('This time slot is fully booked')
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
  ElMessage.success('Booking created successfully!')
}

// 退出登录
function onLogout() {
  router.push('/login')
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

.time-cell.is-limited {
  background-color: #fef3c7;
}

.time-cell.is-limited:hover {
  background-color: #fde68a;
}

.time-cell::before {
  content: attr(data-period);
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  font-size: clamp(0.625rem, 1.5vw, 0.75rem);
  font-weight: 600;
  color: #6b7280;
}

.time-row:nth-child(2) .time-cell::before {
  content: 'AM';
}

.time-row:nth-child(3) .time-cell::before {
  content: 'PM';
}

.time-row:nth-child(4) .time-cell::before {
  content: 'Night';
}

.availability {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 600;
  color: #374151;
}

.time-cell.is-full .availability {
  color: #dc2626;
  font-weight: 700;
  font-style: italic;
}

.time-cell.is-limited .availability {
  color: #d97706;
  font-weight: 700;
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

  .time-cell::before {
    top: 0.125rem;
    left: 0.125rem;
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





