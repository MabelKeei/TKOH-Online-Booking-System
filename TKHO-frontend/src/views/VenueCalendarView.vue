<template>
  <div class="calendar-page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden pt-[64px]">
    <AppHeader @logout="onLogout" />

    <!-- Progress steps (temporarily hidden) -->
    <!-- <BookingSteps
      :steps="['Log in', 'Booking', 'Submission', 'Confirmation']"
      :current="1"
    /> -->

    <!-- Main content -->
    <main class="calendar-main flex-1 flex flex-col px-2 md:px-3 lg:px-4 py-1 md:py-2 overflow-hidden">
      <!-- Top toolbar -->
      <div class="toolbar mb-1 flex items-center justify-between gap-3">
        <div class="toolbar-left flex items-center gap-2">
          <!-- Previous period -->
          <button class="nav-btn" @click="goToPreviousPeriod">
            <span class="nav-arrow">&larr;</span> Prev {{ currentView === 'month' ? 'Month' : currentView === 'week' ? 'Week' : 'Day' }}
          </button>

          <!-- Add booking -->
          <button class="add-booking-btn" @click="showBookingDialog">
            Add Booking
          </button>

          <!-- Room filter -->
          <div class="room-filter-wrapper">
            <button
              :class="['room-filter-btn', { active: showRoomFilter }]"
              @click="toggleRoomFilter"
            >
              Room Filter
            </button>

            <!-- Room filter dropdown -->
            <div v-if="showRoomFilter" class="room-filter-dropdown" @click.stop>
              <div class="filter-header">
                <span class="filter-title">Show rooms:</span>
                <div class="filter-actions">
                  <button class="filter-action-btn" @click="selectOtherOnly">Other</button>
                  <button class="filter-action-btn" @click="selectConferenceOnly">Conference Rooms Only</button>
                  <button class="filter-action-btn" @click="selectAllRooms">Select All</button>
                  <button class="filter-action-btn" @click="clearAllRooms">Clear All</button>
                </div>
              </div>

              <div class="filter-body">
                <div class="filter-section">
                  <h4 class="section-title">Conference & Discussion</h4>
                  <div class="room-list">
                    <label v-for="room in conferenceRooms" :key="room.id" class="room-checkbox">
                      <input type="checkbox" v-model="room.selected" />
                      <span class="room-name-wrapper">
                        <span>{{ room.name }}</span>
                        <span class="room-color-dot" :style="{ backgroundColor: room.color }"></span>
                      </span>
                    </label>
                  </div>
                </div>

                <div class="filter-section">
                  <h4 class="section-title">Other Venues</h4>
                  <div class="room-list">
                    <label v-for="room in otherVenues" :key="room.id" class="room-checkbox">
                      <input type="checkbox" v-model="room.selected" />
                      <span class="room-name-wrapper">
                        <span>{{ room.name }}</span>
                        <span class="room-color-dot" :style="{ backgroundColor: room.color }"></span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Center date display + today -->
        <div class="flex items-center gap-2 relative">
          <div class="date-display-wrapper">
            <h3
              class="text-lg font-semibold text-gray-800 cursor-pointer hover:text-[#00723a] transition-colors"
              @click="toggleDatePicker"
            >
              {{ dateRangeDisplay }}
            </h3>

            <!-- Date picker dropdown -->
            <div v-if="showDatePicker" class="date-picker-dropdown" @click.stop>
              <div class="date-picker-calendar">
                <!-- Calendar header -->
                <div class="calendar-header">
                  <button class="nav-arrow-btn" @click="changeYear(-1)">&laquo;</button>
                  <button class="nav-arrow-btn" @click="changeMonth(-1)">&lsaquo;</button>
                  <span class="calendar-title">{{ calendarTitle }}</span>
                  <button class="nav-arrow-btn" @click="changeMonth(1)">&rsaquo;</button>
                  <button class="nav-arrow-btn" @click="changeYear(1)">&raquo;</button>
                </div>

                <!-- Calendar grid -->
                <div class="calendar-body">
                  <div class="weekday-row">
                    <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="weekday-cell">
                      {{ day }}
                    </div>
                  </div>
                  <div class="dates-grid">
                    <div
                      v-for="(day, index) in calendarDays"
                      :key="index"
                      class="date-cell-picker"
                      :class="{
                        'is-other-month': day.isOtherMonth,
                        'is-today': day.isToday,
                        'is-selected': day.isSelected
                      }"
                      @click="selectDate(day.date)"
                    >
                      {{ day.day }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button class="today-btn" @click="goToToday">
            Today
          </button>
        </div>

        <div class="toolbar-right flex items-center gap-2">
          <!-- View switch -->
          <div class="view-switcher flex gap-2">
            <button
              :class="['view-btn', { active: currentView === 'day' }]"
              @click="currentView = 'day'"
            >
              Day
            </button>
            <button
              :class="['view-btn', { active: currentView === 'week' }]"
              @click="currentView = 'week'"
            >
              Week
            </button>
            <button
              :class="['view-btn', { active: currentView === 'month' }]"
              @click="currentView = 'month'"
            >
              Month
            </button>
          </div>

          <!-- Next period -->
          <button class="nav-btn" @click="goToNextPeriod">
            Next {{ currentView === 'month' ? 'Month' : currentView === 'week' ? 'Week' : 'Day' }} <span class="nav-arrow">&rarr;</span>
          </button>
        </div>
      </div>

      <!-- Calendar content area -->
      <div class="calendar-container flex-1 overflow-hidden">
        <!-- Month view -->
        <div v-if="currentView === 'month'" class="month-view h-full">
          <VenueCalendarMonth
            :current-date="currentDate"
            :bookings="bookings"
            :selected-rooms="selectedRoomsList"
            @day-click="selectDay"
          />
        </div>

        <!-- Week view -->
        <div v-else-if="currentView === 'week'" class="week-view h-full overflow-y-auto">
          <VenueCalendarWeek
            :current-date="currentDate"
            :bookings="bookings"
            :selected-rooms="selectedRoomsList"
            @time-slot-click="openBookingDialog"
            @booking-click="handleBookingClick"
          />
        </div>

        <!-- Day view -->
        <div v-else-if="currentView === 'day'" class="day-view h-full overflow-y-auto relative">
          <VenueCalendarDay
            :current-date="currentDate"
            :bookings="filteredDayBookings"
            :selected-rooms="selectedRoomsList"
            @time-slot-click="openBookingDialog"
          />

          <!-- Empty state -->
          <div v-if="selectedRoomsList.length === 0" class="empty-state-fixed">
            <p class="empty-text">Please select at least one room from Room Filter</p>
          </div>
          <div v-else-if="selectedRoomsList.length === 1 && filteredDayBookings.filter(b => b.roomName === selectedRoomsList[0].name).length === 0" class="empty-state-fixed">
            <p class="empty-text">No bookings for this day</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit booking dialog -->
    <VenueBookingDialog
      :visible="dialogVisible"
      :booking="editingBooking"
      :room-type="roomType"
      :selected-time="selectedTime"
      @confirm="handleBookingConfirm"
      @close="closeBookingDialog"
    />

    <!-- Booking detail dialog -->
    <VenueBookingDetailDialog
      :visible="detailDialogVisible"
      :booking="selectedBooking"
      @close="detailDialogVisible = false"
      @delete="handleDeleteBooking"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'
import BookingSteps from '../components/BookingSteps.vue'
import VenueCalendarMonth from '../components/VenueCalendarMonth.vue'
import VenueCalendarWeek from '../components/VenueCalendarWeek.vue'
import VenueCalendarDay from '../components/VenueCalendarDay.vue'
import VenueBookingDialog from '../components/VenueBookingDialog.vue'
import VenueBookingDetailDialog from '../components/VenueBookingDetailDialog.vue'
// import { getBookingsByMonth, getBookingsByWeek, getBookingsByDate } from '../api/calendar'

const router = useRouter()
const route = useRoute()

// Current calendar view mode
const currentView = ref('day')

// Current anchor date
const currentDate = ref(new Date())

// Room type from route query
const roomType = ref(route.query.roomType || 'conference')

// Booking dataset
const bookings = ref([])

// Dialog and UI states
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const editingBooking = ref(null)
const selectedBooking = ref(null)
const selectedTime = ref(null)
const showDatePicker = ref(false)
const pickerDate = ref(new Date()) // Month/year shown in the date picker
const showRoomFilter = ref(false)

// Room options and colors
const conferenceRooms = ref([
  { id: 1, name: 'Conference Room 1', selected: true, color: '#3b82f6' },
  { id: 2, name: 'Conference Room 2', selected: true, color: '#10b981' },
  { id: 3, name: 'Conference Room 3', selected: true, color: '#06b6d4' },
  { id: 4, name: 'Discussion Room', selected: false, color: '#f59e0b' }
])

const otherVenues = ref([
  { id: 5, name: 'Function Room', selected: false, color: '#ec4899' },
  { id: 6, name: 'Lecture Theatre', selected: false, color: '#6366f1' },
  { id: 7, name: 'Auditorium', selected: false, color: '#8b5cf6' }
])

// Resolve display color by room name
function getRoomColor(roomName) {
  const allRooms = [...conferenceRooms.value, ...otherVenues.value]
  const room = allRooms.find(r => r.name === roomName)
  return room?.color || '#3b82f6'
}

// Date-picker title text
const calendarTitle = computed(() => {
  return pickerDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Build fixed 6-row calendar grid
const calendarDays = computed(() => {
  const year = pickerDate.value.getFullYear()
  const month = pickerDate.value.getMonth()

  // First and last day of current month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Weekday index of first day
  const firstDayOfWeek = firstDay.getDay()

  // Last day number of previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const days = []

  // Fill leading dates from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(year, month - 1, day)
    days.push({
      day,
      date,
      isOtherMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, currentDate.value)
    })
  }

  // Fill current month dates
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      day: i,
      date,
      isOtherMonth: false,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, currentDate.value)
    })
  }

  // Fill trailing dates to keep 42 cells
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      day: i,
      date,
      isOtherMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: isSameDay(date, currentDate.value)
    })
  }

  return days
})

// Compare two dates by day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// Header date range text
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

// Bookings for current day
const filteredDayBookings = computed(() => {
  return bookings.value.filter(booking => {
    const bookingDate = new Date(booking.date)
    return bookingDate.toDateString() === currentDate.value.toDateString()
  })
})

// Currently selected rooms
const selectedRoomsList = computed(() => {
  const allRooms = [...conferenceRooms.value, ...otherVenues.value]
  return allRooms.filter(room => room.selected)
})

// Get week start (Sunday)
function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  // getDay() uses Sunday=0, Monday=1...
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Navigate to previous period
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

// Navigate to next period
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

// Jump to today
function goToToday() {
  currentDate.value = new Date()
}

// Toggle date picker popup
function toggleDatePicker(event) {
  event.stopPropagation()
  showDatePicker.value = !showDatePicker.value

  // Keep picker month in sync with current date
  if (showDatePicker.value) {
    pickerDate.value = new Date(currentDate.value)
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, { once: false })
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
}

// Change picker year
function changeYear(offset) {
  const newDate = new Date(pickerDate.value)
  newDate.setFullYear(newDate.getFullYear() + offset)
  pickerDate.value = newDate
}

// Change picker month
function changeMonth(offset) {
  const newDate = new Date(pickerDate.value)
  newDate.setMonth(newDate.getMonth() + offset)
  pickerDate.value = newDate
}

// Select date from picker
function selectDate(date) {
  currentDate.value = new Date(date)
}

// Close date picker when clicking outside
function handleClickOutside(event) {
  const dropdown = document.querySelector('.date-picker-dropdown')
  const dateTitle = event.target.closest('.date-display-wrapper')

  if (!dropdown?.contains(event.target) && !dateTitle) {
    showDatePicker.value = false
    document.removeEventListener('click', handleClickOutside)
  }
}

// Toggle room filter popup
function toggleRoomFilter(event) {
  event.stopPropagation()
  showRoomFilter.value = !showRoomFilter.value

  if (showRoomFilter.value) {
    setTimeout(() => {
      document.addEventListener('click', handleRoomFilterClickOutside, { once: false })
    }, 0)
  } else {
    document.removeEventListener('click', handleRoomFilterClickOutside)
  }
}

// Close room filter when clicking outside
function handleRoomFilterClickOutside(event) {
  const dropdown = document.querySelector('.room-filter-dropdown')
  const filterBtn = event.target.closest('.room-filter-wrapper')

  if (!dropdown?.contains(event.target) && !filterBtn) {
    showRoomFilter.value = false
    document.removeEventListener('click', handleRoomFilterClickOutside)
  }
}

// Quick action: conference rooms only
function selectConferenceOnly() {
  conferenceRooms.value.forEach(room => {
    room.selected = room.name.includes('Conference Room')
  })
  otherVenues.value.forEach(room => {
    room.selected = false
  })
}

// Quick action: select other venues only
function selectOtherOnly() {
  conferenceRooms.value.forEach(room => {
    room.selected = false
  })
  otherVenues.value.forEach(room => {
    room.selected = true
  })
}

// Quick action: select all rooms
function selectAllRooms() {
  conferenceRooms.value.forEach(room => room.selected = true)
  otherVenues.value.forEach(room => room.selected = true)
}

// Quick action: clear all rooms
function clearAllRooms() {
  conferenceRooms.value.forEach(room => room.selected = false)
  otherVenues.value.forEach(room => room.selected = false)
}

// Switch to day view from month cell
function selectDay(date) {
  currentDate.value = date
  currentView.value = 'day'
}

// Open create booking dialog
function showBookingDialog() {
  editingBooking.value = null
  selectedTime.value = null
  dialogVisible.value = true
}

// Open booking dialog from selected slot
function openBookingDialog(timeInfo) {
  editingBooking.value = null
  selectedTime.value = timeInfo
  dialogVisible.value = true
}

// Close booking dialog
function closeBookingDialog() {
  dialogVisible.value = false
  editingBooking.value = null
  selectedTime.value = null
}

// Handle booking create/update
function handleBookingConfirm(bookingData) {
  // TODO: persist booking via API
  bookings.value.push({
    id: Date.now(),
    ...bookingData,
    roomType: roomType.value
  })
  closeBookingDialog()
  ElMessage.success('Booking added successfully!')
}

// Handle booking delete
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

// Open day view from week/month booking click
function handleBookingClick(dayDate) {
  currentDate.value = new Date(dayDate)
  currentView.value = 'day'
}

// Logout handler
function onLogout() {
  router.push('/login')
}

// Initialize demo bookings
onMounted(() => {
  // 根据 roomType 参数自动应用筛选
  const roomTypeParam = route.query.roomType
  if (roomTypeParam === 'conference') {
    // 选择 Conference Rooms and Discussion Room
    conferenceRooms.value.forEach(room => room.selected = true)
    otherVenues.value.forEach(room => room.selected = false)
  } else if (roomTypeParam === 'other') {
    // 选择 Other Venues
    conferenceRooms.value.forEach(room => room.selected = false)
    otherVenues.value.forEach(room => room.selected = true)
  }

  // TODO: fetch bookings from API
  // fetchBookings()

  // Demo dates
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  // Demo data
  bookings.value = [
    {
      id: 1,
      roomName: 'Conference Room 1',
      date: today.toISOString(),
      startTime: '08:00',
      endTime: '09:00',
      attendees: 5,
      topic: 'Morning Briefing',
      notes: 'Weekly team meeting',
      reservedBy: 'John Smith',
      color: getRoomColor('Conference Room 1')
    },
    {
      id: 2,
      roomName: 'Conference Room 2',
      date: today.toISOString(),
      startTime: '09:00',
      endTime: '11:00',
      attendees: 8,
      topic: 'Technical Review',
      notes: 'Client presentation',
      reservedBy: 'Mary Johnson',
      color: getRoomColor('Conference Room 2')
    },
    {
      id: 3,
      roomName: 'Conference Room 3',
      date: today.toISOString(),
      startTime: '11:00',
      endTime: '12:00',
      attendees: 6,
      topic: 'Testing Session',
      notes: 'QA meeting',
      reservedBy: 'David Lee',
      color: getRoomColor('Conference Room 3')
    },
    {
      id: 4,
      roomName: 'Conference Room 1',
      date: today.toISOString(),
      startTime: '13:30',
      endTime: '15:00',
      attendees: 10,
      topic: 'Strategy Planning',
      notes: 'Quarterly review',
      reservedBy: 'Sarah Wilson',
      color: getRoomColor('Conference Room 1')
    },
    {
      id: 5,
      roomName: 'Discussion Room',
      date: today.toISOString(),
      startTime: '10:00',
      endTime: '11:30',
      attendees: 4,
      topic: 'Project Discussion',
      notes: 'Sprint planning',
      reservedBy: 'Michael Chen',
      color: getRoomColor('Discussion Room')
    },
    {
      id: 6,
      roomName: 'Conference Room 2',
      date: today.toISOString(),
      startTime: '14:00',
      endTime: '16:00',
      attendees: 12,
      topic: 'Training Workshop',
      notes: 'New employee orientation',
      reservedBy: 'Lisa Brown',
      color: getRoomColor('Conference Room 2')
    },
    {
      id: 7,
      roomName: 'Function Room',
      date: today.toISOString(),
      startTime: '09:30',
      endTime: '12:00',
      attendees: 20,
      topic: 'Department Meeting',
      notes: 'Monthly all-hands',
      reservedBy: 'Robert Taylor',
      color: getRoomColor('Function Room')
    },
    {
      id: 8,
      roomName: 'Conference Room 3',
      date: today.toISOString(),
      startTime: '15:00',
      endTime: '17:00',
      attendees: 8,
      topic: 'Client Presentation',
      notes: 'Product demo',
      reservedBy: 'Jennifer White',
      color: getRoomColor('Conference Room 3')
    },
    {
      id: 9,
      roomName: 'Lecture Theatre',
      date: today.toISOString(),
      startTime: '13:00',
      endTime: '15:30',
      attendees: 50,
      topic: 'Annual Conference',
      notes: 'Company-wide event',
      reservedBy: 'James Anderson',
      color: getRoomColor('Lecture Theatre')
    },
    {
      id: 10,
      roomName: 'Discussion Room',
      date: today.toISOString(),
      startTime: '16:00',
      endTime: '17:30',
      attendees: 5,
      topic: 'Code Review',
      notes: 'Development team sync',
      reservedBy: 'Emily Davis',
      color: getRoomColor('Discussion Room')
    },
    {
      id: 11,
      roomName: 'Conference Room 1',
      date: tomorrow.toISOString(),
      startTime: '10:00',
      endTime: '11:30',
      attendees: 3,
      topic: 'Project discussion',
      notes: 'Project discussion',
      reservedBy: 'Tom Harris',
      color: getRoomColor('Conference Room 1')
    },
    {
      id: 12,
      roomName: 'Conference Room 2',
      date: tomorrow.toISOString(),
      startTime: '14:00',
      endTime: '15:30',
      attendees: 6,
      topic: 'Budget Review',
      notes: 'Finance meeting',
      reservedBy: 'Patricia Moore',
      color: getRoomColor('Conference Room 2')
    },
    {
      id: 13,
      roomName: 'Conference Room 3',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '09:00',
      endTime: '10:30',
      attendees: 8,
      topic: 'Design Review',
      notes: 'UI/UX discussion',
      reservedBy: 'Kevin Garcia',
      color: getRoomColor('Conference Room 3')
    },
    {
      id: 14,
      roomName: 'Conference Room 1',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '11:00',
      endTime: '12:00',
      attendees: 5,
      topic: 'Sprint Planning',
      notes: 'Agile team meeting',
      reservedBy: 'Amanda Martinez',
      color: getRoomColor('Conference Room 1')
    },
    {
      id: 15,
      roomName: 'Discussion Room',
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      startTime: '15:00',
      endTime: '16:30',
      attendees: 4,
      topic: 'Team Sync',
      notes: 'Weekly standup',
      reservedBy: 'Christopher Lee',
      color: getRoomColor('Discussion Room')
    },
    {
      id: 16,
      roomName: 'Conference Room A',
      date: nextWeek.toISOString(),
      startTime: '13:00',
      endTime: '14:00',
      attendees: 4,
      topic: 'Training session',
      notes: 'Training session',
      reservedBy: 'Nancy Martin',
      color: '#f43f5e'
    }
  ]

  console.log('Calendar view initialized with roomType:', roomType.value)
})

// Cleanup listeners on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('click', handleRoomFilterClickOutside)
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

.toolbar {
  background: #ffffff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  border: 1px solid rgba(0, 114, 58, 0.08);
  transition: box-shadow 0.3s ease;
}

.toolbar:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
}

.calendar-container {
  background: #ffffff;
  border-radius: 12px;
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

.month-view {
  min-height: 0;
}

.week-view::-webkit-scrollbar {
  width: 8px;
}

.week-view::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.week-view::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.week-view::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.day-view::-webkit-scrollbar {
  width: 8px;
}

.day-view::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.day-view::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.day-view::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.empty-state-fixed {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 10;
}

.empty-state-fixed .empty-text {
  font-size: 1.5rem;
  font-weight: 500;
  color: #9ca3af;
  margin: 0;
}

.view-switcher {
  display: flex;
  gap: 0.5rem;
}

/* Add Booking Button - Green background with white text */
.add-booking-btn {
  background: linear-gradient(135deg, #00723a 0%, #005a2f 100%);
  color: #ffffff;
  /* Keep toolbar button sizing consistent with Room Filter button */
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 114, 58, 0.2);
  letter-spacing: 0.3px;
}

.add-booking-btn:hover {
  background: linear-gradient(135deg, #005a2f 0%, #004a25 100%);
  box-shadow: 0 4px 12px rgba(0, 114, 58, 0.3);
  transform: translateY(-1px);
}

/* View Switcher Buttons - Equal width, green when active, gray when inactive */
.view-btn {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #4b5563;
  /* Keep toolbar button sizing consistent with Room Filter button */
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 70px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
}

.view-btn:hover {
  background: linear-gradient(135deg, #d1d5db 0%, #b8bcc2 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.view-btn.active {
  background: linear-gradient(135deg, #00723a 0%, #005a2f 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 114, 58, 0.3);
}

.view-btn.active:hover {
  background: linear-gradient(135deg, #005a2f 0%, #004a25 100%);
  box-shadow: 0 4px 12px rgba(0, 114, 58, 0.4);
}

/* Navigation Buttons - Orange background with white text */
.nav-btn {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  /* Keep toolbar button sizing consistent with Room Filter button */
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
  letter-spacing: 0.3px;
}

.nav-btn:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
  transform: translateY(-1px);
}

.nav-arrow {
  font-weight: 900;
  font-size: 1rem;
  line-height: 1;
  display: inline-block;
  transform: translateY(1px);
}

/* Today Button - Blue background with white text */
.today-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  /* Keep toolbar button sizing consistent with Room Filter button */
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.25);
  letter-spacing: 0.3px;
}

.today-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.date-display-wrapper {
  position: relative;
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 114, 58, 0.1);
  animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.date-picker-dropdown :deep(.el-date-picker) {
  border: none;
  box-shadow: none;
}

.date-picker-dropdown :deep(.el-picker-panel) {
  border: none;
  box-shadow: none;
}

.date-picker-calendar {
  padding: 0;
  min-width: 320px;
  background: white;
  border-radius: 0.5rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  flex: 1;
  text-align: center;
}

.nav-arrow-btn {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-arrow-btn:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.calendar-body {
  padding: 12px;
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-cell {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  padding: 8px 4px;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-cell-picker {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.date-cell-picker:hover {
  background-color: #d6f3c5;
}

.date-cell-picker.is-other-month {
  color: #d1d5db;
}

.date-cell-picker.is-today {
  background-color: #00723a;
  color: white;
  font-weight: 700;
}

.date-cell-picker.is-selected {
  background-color: #00723a;
  color: white;
  font-weight: 700;
}

.date-cell-picker.is-selected:hover {
  background-color: #005a2e;
}

.date-cell-picker.is-today:hover {
  background-color: #005a2e;
}

/* Room Filter Button */
.room-filter-wrapper {
  position: relative;
  display: inline-block;
}

.room-filter-btn {
  /* Match interaction style of other toolbar buttons (hover/active/transition) */
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #4b5563;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.8125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
  display: inline-flex;
  align-items: center;
}

.room-filter-btn:hover {
  background: linear-gradient(135deg, #d1d5db 0%, #b8bcc2 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.room-filter-btn.active {
  background: linear-gradient(135deg, #00723a 0%, #005a2f 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 114, 58, 0.3);
}

.room-filter-btn.active:hover {
  background: linear-gradient(135deg, #005a2f 0%, #004a25 100%);
  box-shadow: 0 4px 12px rgba(0, 114, 58, 0.4);
  transform: translateY(-1px);
}

.room-filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1000;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-width: 700px;
  animation: slideDownSimple 0.2s ease-out;
}

@keyframes slideDownSimple {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-header {
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.filter-action-btn {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-action-btn:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.filter-body {
  padding: 20px;
  display: flex;
  gap: 32px;
}

.filter-section {
  flex: 1;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #00723a;
  margin: 0 0 14px 0;
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.room-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #374151;
}

.room-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.room-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.room-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00723a;
}

.room-checkbox:hover {
  color: #00723a;
}

</style>
