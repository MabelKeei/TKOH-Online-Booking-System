<template>
  <div class="calendar-page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden">
    <AppHeader @logout="onLogout" />

    <!-- 进度步骤条 -->
    <BookingSteps
      :steps="['Log in', 'Booking', 'Submission', 'Confirmation']"
      :current="1"
    />

    <!-- 主体内容 -->
    <main class="calendar-main flex-1 flex flex-col px-4 md:px-8 lg:px-12 py-4 md:py-6 overflow-hidden">
      <!-- 顶部工具栏 -->
      <div class="toolbar mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="toolbar-left flex items-center gap-3">
          <h2 class="text-xl md:text-2xl font-semibold text-gray-900">
            Venue Booking Calendar
          </h2>
          <el-tag type="success">{{ roomTypeLabel }}</el-tag>
        </div>

        <div class="toolbar-right flex flex-col md:flex-row items-center gap-3">
          <!-- 视图切换 -->
          <div class="view-switcher flex gap-2">
            <el-button
              :type="currentView === 'day' ? 'primary' : 'default'"
              size="small"
              @click="currentView = 'day'"
            >
              Day
            </el-button>
            <el-button
              :type="currentView === 'week' ? 'primary' : 'default'"
              size="small"
              @click="currentView = 'week'"
            >
              Week
            </el-button>
            <el-button
              :type="currentView === 'month' ? 'primary' : 'default'"
              size="small"
              @click="currentView = 'month'"
            >
              Month
            </el-button>
          </div>

          <!-- 新增预订按钮 -->
          <el-button type="warning" @click="showBookingDialog">
            <font-awesome-icon icon="plus" class="mr-2" />
            Add Booking
          </el-button>
        </div>
      </div>

      <!-- 日期导航 -->
      <div class="date-nav mb-6 flex items-center justify-between">
        <el-button type="text" @click="goToPreviousPeriod">
          <font-awesome-icon icon="chevron-left" /> Prev {{ currentView === 'month' ? 'Month' : currentView === 'week' ? 'Week' : 'Day' }}
        </el-button>
        <h3 class="text-lg font-semibold text-gray-800">
          {{ dateRangeDisplay }}
        </h3>
        <el-button type="text" @click="goToNextPeriod">
          Next {{ currentView === 'month' ? 'Month' : currentView === 'week' ? 'Week' : 'Day' }} <font-awesome-icon icon="chevron-right" />
        </el-button>
      </div>

      <!-- 日历内容区域 -->
      <div class="calendar-container flex-1 overflow-y-auto">
        <!-- 月视图 -->
        <div v-if="currentView === 'month'" class="month-view">
          <CalendarMonth
            :current-date="currentDate"
            :bookings="bookings"
            @day-click="selectDay"
          />
        </div>

        <!-- 周视图 -->
        <div v-else-if="currentView === 'week'" class="week-view">
          <CalendarWeek
            :current-date="currentDate"
            :bookings="bookings"
            @time-slot-click="openBookingDialog"
          />
        </div>

        <!-- 日视图 -->
        <div v-else-if="currentView === 'day'" class="day-view">
          <CalendarDay
            :current-date="currentDate"
            :bookings="filteredDayBookings"
            @time-slot-click="openBookingDialog"
          />
        </div>
      </div>
    </main>

    <!-- 新增/编辑预订对话框 -->
    <BookingDialog
      :visible="dialogVisible"
      :booking="editingBooking"
      :room-type="roomType"
      :selected-time="selectedTime"
      @confirm="handleBookingConfirm"
      @close="closeBookingDialog"
    />

    <!-- 预订详情对话框 -->
    <BookingDetailDialog
      :visible="detailDialogVisible"
      :booking="selectedBooking"
      @close="detailDialogVisible = false"
      @delete="handleDeleteBooking"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import BookingSteps from '../components/BookingSteps.vue'
import CalendarMonth from '../components/CalendarMonth.vue'
import CalendarWeek from '../components/CalendarWeek.vue'
import CalendarDay from '../components/CalendarDay.vue'
import BookingDialog from '../components/BookingDialog.vue'
import BookingDetailDialog from '../components/BookingDetailDialog.vue'
// import { getBookingsByMonth, getBookingsByWeek, getBookingsByDate } from '../api/calendar'

const router = useRouter()
const route = useRoute()

// 视图类型
const currentView = ref('month')

// 当前日期
const currentDate = ref(new Date())

// 房间类型（从路由参数获取）
const roomType = ref(route.query.roomType || 'conference')

// 预订列表
const bookings = ref([])

// 对话框状态
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingBooking = ref(null)
const selectedBooking = ref(null)
const selectedTime = ref(null)

// 房间类型标签
const roomTypeLabel = computed(() => {
  return roomType.value === 'conference'
    ? 'Conference Rooms & Discussion Rooms'
    : 'Other Venues'
})

// 日期范围显示
const dateRangeDisplay = computed(() => {
  const date = currentDate.value
  if (currentView.value === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } else if (currentView.value === 'week') {
    const weekStart = getWeekStart(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
})

// 当天的预订列表
const filteredDayBookings = computed(() => {
  return bookings.value.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate.toDateString() === currentDate.value.toDateString()
  })
})

// 获取周开始日期
function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

// 上一个时期
function goToPreviousPeriod() {
  const date = new Date(currentDate.value)
  if (currentView.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (currentView.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}

// 下一个时期
function goToNextPeriod() {
  const date = new Date(currentDate.value)
  if (currentView.value === 'month') {
    date.setMonth(date.getMonth() + 1)
  } else if (currentView.value === 'week') {
    date.setDate(date.getDate() + 7)
  } else {
    date.setDate(date.getDate() + 1)
  }
  currentDate.value = date
}

// 选择日期（从月视图）
function selectDay(date) {
  currentDate.value = date
  currentView.value = 'day'
}

// 显示新增预订对话框
function showBookingDialog() {
  editingBooking.value = null
  selectedTime.value = null
  dialogVisible.value = true
}

// 打开预订对话框（带时间）
function openBookingDialog(timeInfo) {
  editingBooking.value = null
  selectedTime.value = timeInfo
  dialogVisible.value = true
}

// 关闭预订对话框
function closeBookingDialog() {
  dialogVisible.value = false
  editingBooking.value = null
  selectedTime.value = null
}

// 处理预订确认
function handleBookingConfirm(bookingData) {
  // 这里应该调用 API 保存预订
  bookings.value.push({
    id: Date.now(),
    ...bookingData,
    roomType: roomType.value
  })
  closeBookingDialog()
  ElMessage.success('Booking added successfully!')
}

// 处理删除预订
function handleDeleteBooking(bookingId) {
  ElMessageBox.confirm(
    'Are you sure to delete this booking?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  )
    .then(() => {
      bookings.value = bookings.value.filter(b => b.id !== bookingId)
      detailDialogVisible.value = false
      ElMessage.success('Booking deleted successfully!')
    })
    .catch(() => {})
}

// 退出登录
function onLogout() {
  router.push('/login')
}

// 初始化数据
onMounted(() => {
  // 这里应该调用 API 获取预订数据
  // fetchBookings()
  
  // 示例数据
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  // 添加示例预订
  bookings.value = [
    {
      id: 1,
      roomName: 'Conference Room A',
      date: today.toISOString(),
      startTime: '09:00',
      endTime: '10:30',
      attendees: 5,
      notes: 'Weekly team meeting',
      color: '#f97316'
    },
    {
      id: 2,
      roomName: 'Conference Room B',
      date: today.toISOString(),
      startTime: '14:00',
      endTime: '15:30',
      attendees: 8,
      notes: 'Client presentation',
      color: '#3b82f6'
    },
    {
      id: 3,
      roomName: 'Discussion Room 1',
      date: tomorrow.toISOString(),
      startTime: '10:00',
      endTime: '11:30',
      attendees: 3,
      notes: 'Project discussion',
      color: '#10b981'
    },
    {
      id: 4,
      roomName: 'Conference Room A',
      date: nextWeek.toISOString(),
      startTime: '13:00',
      endTime: '14:00',
      attendees: 4,
      notes: 'Training session',
      color: '#f43f5e'
    }
  ]
  
  console.log('Calendar view initialized with roomType:', roomType.value)
})
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  height: auto;
}

.calendar-main {
  background-color: #f5f5f5;
}

.toolbar {
  background-color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.calendar-container {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.view-switcher {
  display: flex;
  gap: 0.5rem;
}
</style>
