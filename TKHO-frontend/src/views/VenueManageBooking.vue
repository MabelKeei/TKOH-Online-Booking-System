<template>
  <div class="page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden pt-[52px]">
    <AppHeader @logout="onLogout" />

    <main class="flex-1 flex flex-col px-2 md:px-3 lg:px-4 py-2 md:py-3 pb-1 overflow-hidden">
      <!-- Toolbar -->
      <div class="toolbar bg-white rounded-lg shadow-sm p-3 mb-1 flex items-center justify-between gap-3">
        <div class="toolbar-left flex items-center gap-3">
          <!-- Status Filter -->
          <div class="status-filter-wrapper">
            <button class="status-filter-btn" @click="toggleStatusFilter">
              {{ statusFilterLabel }}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Status filter dropdown -->
            <div v-if="showStatusFilter" class="status-filter-dropdown" @click.stop>
              <div class="status-filter-header">
                <span class="filter-title">Show bookings:</span>
              </div>
              <div class="status-filter-body">
                <label class="status-checkbox">
                  <input type="checkbox" v-model="statusFilters.upcoming" />
                  <span>Upcoming</span>
                </label>
                <label class="status-checkbox">
                  <input type="checkbox" v-model="statusFilters.past" />
                  <span>Past</span>
                </label>
                <label class="status-checkbox">
                  <input type="checkbox" v-model="statusFilters.canceled" />
                  <span>Canceled</span>
                </label>
                <label class="status-checkbox select-all-option">
                  <input type="checkbox" v-model="allStatusesSelected" />
                  <span>Select All</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="date-filter-wrapper">
            <button class="date-filter-btn" @click="toggleDateFilter">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="calendar-icon">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{{ dateFilterLabel }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Date filter dropdown -->
            <div v-if="showDateFilter" class="date-filter-dropdown" @click.stop>
              <div class="date-filter-header">
                <span class="filter-title">Select date range:</span>
                <button v-if="dateRange" class="clear-all-btn" @click="clearDateFilter" title="Clear filter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div class="date-filter-body">
                <!-- Quick date range options -->
                <div class="quick-date-options">
                  <button
                    v-for="option in quickDateOptions"
                    :key="option.label"
                    class="quick-date-btn"
                    :class="{ active: isQuickDateActive(option) }"
                    @click="selectQuickDate(option)"
                  >
                    {{ option.label }}
                  </button>
                </div>

                <!-- Custom date range picker -->
                <div class="custom-date-section">
                  <div class="custom-date-label">Custom Range:</div>
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="to"
                    start-placeholder="Start date"
                    end-placeholder="End date"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="date-range-picker"
                    size="default"
                    :clearable="true"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Search -->
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search by topic, room, date or reserved by"
            class="search-input"
          />
        </div>

        <div class="toolbar-right flex items-center gap-2">
          <!-- Columns Filter (only show in table view) -->
          <div v-if="currentView === 'table'" class="columns-filter-wrapper">
            <button class="columns-filter-btn" @click="toggleColumnsFilter">
              Columns
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <!-- Columns filter dropdown -->
            <div v-if="showColumnsFilter" class="columns-filter-dropdown" @click.stop>
              <div class="columns-filter-header">
                <span class="filter-title">Show columns:</span>
              </div>
              <div class="columns-filter-body">
                <label v-for="col in availableColumns" :key="col.key" class="column-checkbox">
                  <input type="checkbox" v-model="col.visible" :disabled="col.required" />
                  <span>{{ col.label }}</span>
                </label>
                <label class="column-checkbox select-all-option">
                  <input type="checkbox" v-model="allColumnsSelected" />
                  <span>Select All</span>
                </label>
              </div>
            </div>
          </div>

          <!-- View Switcher -->
          <button
            :class="['view-toggle-btn', { active: currentView === 'card' }]"
            @click="currentView = 'card'"
            title="Card View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button
            :class="['view-toggle-btn', { active: currentView === 'table' }]"
            @click="currentView = 'table'"
            title="Table View"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area flex-1 overflow-hidden flex flex-col">
        <!-- Card View -->
        <div v-if="currentView === 'card'" class="card-view flex-1 overflow-y-auto">
          <div class="cards-grid">
            <div
              v-for="booking in paginatedBookings"
              :key="booking.id"
              class="booking-card"
              :class="'status-' + booking.status"
            >
              <div class="card-header">
                <h3 class="card-title">{{ booking.topic }}</h3>
                <span :class="['status-badge', 'badge-' + booking.status]">
                  {{ formatStatus(booking.status) }}
                </span>
              </div>
              <div class="card-body">
                <div class="card-row">
                  <span class="card-label">Room</span>
                  <span class="card-value">{{ booking.room }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Date</span>
                  <span class="card-value">{{ booking.date }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Time</span>
                  <span class="card-value">{{ booking.time }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Booked on</span>
                  <span class="card-value">{{ booking.bookedOn }}</span>
                </div>
              </div>
              <div class="card-footer">
                <div v-if="booking.reason" class="reason-row">
                  <span class="reason-label">Reason:</span>
                  <span class="reason-text">{{ booking.reason }}</span>
                </div>
                <button v-if="booking.status == 'upcoming'" class="btn-cancel" @click="cancelBooking(booking.id)">
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-else class="table-view flex-1 overflow-hidden">
          <div class="table-wrapper">
            <table class="bookings-table">
              <thead>
                <tr>
                  <th class="col-no">#</th>
                  <th v-if="availableColumns[0].visible" class="col-datetime">Date & Time</th>
                  <th v-if="availableColumns[1].visible">Type</th>
                  <th v-if="availableColumns[2].visible">Room</th>
                  <th v-if="availableColumns[3].visible">Topic</th>
                  <th v-if="availableColumns[4].visible">Reserved By</th>
                  <th v-if="availableColumns[5].visible">Contact</th>
                  <th v-if="availableColumns[6].visible">Email</th>
                  <th v-if="availableColumns[7].visible">Status</th>
                  <th v-if="availableColumns[8].visible">Booked On</th>
                  <th v-if="availableColumns[9].visible">Reason</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(booking, index) in paginatedBookings" :key="booking.id">
                  <td class="no-cell">{{ startIndex + index + 1 }}</td>
                  <td v-if="availableColumns[0].visible" class="datetime-cell">
                    <div class="date">{{ booking.date }}</div>
                    <div class="time">{{ booking.time }}</div>
                  </td>
                  <td v-if="availableColumns[1].visible">{{ booking.type }}</td>
                  <td v-if="availableColumns[2].visible">{{ booking.room }}</td>
                  <td v-if="availableColumns[3].visible">{{ booking.topic }}</td>
                  <td v-if="availableColumns[4].visible">{{ booking.reservedBy }}</td>
                  <td v-if="availableColumns[5].visible">{{ booking.contact }}</td>
                  <td v-if="availableColumns[6].visible">{{ booking.email }}</td>
                  <td v-if="availableColumns[7].visible">
                    <span :class="['status-badge', 'badge-' + booking.status]">
                      {{ formatStatus(booking.status) }}
                    </span>
                  </td>
                  <td v-if="availableColumns[8].visible">{{ booking.bookedOn }}</td>
                  <td v-if="availableColumns[9].visible">{{ booking.reason || '-' }}</td>
                  <td class="actions-td">
                    <div class="actions-cell">
                      <button class="btn-action btn-edit" @click="editBooking(booking.id)">
                        Edit
                      </button>
                      <button class="btn-action btn-cancel-small" @click="cancelBooking(booking.id)">
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar">
          <div class="pagination-info">
            Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filteredBookings.length }} bookings
          </div>
          <div class="pagination-controls">
            <button
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Previous
            </button>
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['pagination-btn', 'page-number', { active: page === currentPage }]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Next
            </button>
          </div>
          <div class="pagination-size">
            <select v-model="pageSize" class="page-size-select">
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
              <option :value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>
    </main>

    <!-- Cancel Booking Dialog -->
    <el-dialog v-model="showCancelDialog" title="Cancel Booking" width="400px">
      <p class="cancel-message">Please provide a reason for cancellation:</p>
      <el-input
        v-model="cancelReason"
        type="textarea"
        :rows="3"
        placeholder="e.g., Meeting rescheduled, Room no longer needed"
        maxlength="100"
        show-word-limit
      />
      <template #footer>
        <el-button @click="showCancelDialog = false">Cancel</el-button>
        <el-button type="danger" @click="confirmCancel">Confirm</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()

const currentView = ref('card')
const searchQuery = ref('')
const showColumnsFilter = ref(false)
const showStatusFilter = ref(false)
const showDateFilter = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const showCancelDialog = ref(false)
const cancelReason = ref('')
const cancelBookingId = ref(null)
const dateRange = ref(null)

// Status filters (multi-select)
const statusFilters = ref({
  upcoming: true,
  past: true,
  canceled: true
})

// Available columns for table view
const availableColumns = ref([
  { key: 'datetime', label: 'Date & Time', visible: true, required: true },
  { key: 'type', label: 'Type', visible: true, required: false },
  { key: 'room', label: 'Room', visible: true, required: false },
  { key: 'topic', label: 'Topic', visible: true, required: false },
  { key: 'reservedBy', label: 'Reserved By', visible: true, required: false },
  { key: 'contact', label: 'Contact', visible: true, required: false },
  { key: 'email', label: 'Email', visible: true, required: false },
  { key: 'status', label: 'Status', visible: true, required: false },
  { key: 'bookedOn', label: 'Booked On', visible: true, required: false },
  { key: 'reason', label: 'Reason', visible: true, required: false }
])

// Mock booking data
const bookings = ref([
  {
    id: 1,
    topic: 'Department Monthly Review',
    room: 'Conference Room 1',
    date: '10 Feb 2026',
    time: '10:00 - 11:30',
    bookedOn: '28 Jan 2026 14:30',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Chan Tai Man',
    contact: '12345678',
    email: 'abc@xyz.com'
  },
  {
    id: 2,
    topic: 'Project Kick-off Meeting',
    room: 'Discussion Room',
    date: '5 Feb 2026',
    time: '14:00 - 15:30',
    bookedOn: '30 Jan 2026 09:15',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Karen Shen',
    contact: '12345678',
    email: 'karen.shen@ha.org.hk'
  },
  {
    id: 3,
    topic: 'Training Session - New Staff',
    room: 'Lecture Theatre',
    date: '20 Jan 2026',
    time: '09:00 - 10:45',
    bookedOn: '10 Jan 2026 16:20',
    status: 'past',
    type: 'venue',
    reservedBy: 'John Doe',
    contact: '87654321',
    email: 'john.doe@ha.org.hk'
  },
  {
    id: 4,
    topic: 'Budget Planning Meeting',
    room: 'Conference Room 2',
    date: '12 Feb 2026',
    time: '13:00 - 14:30',
    bookedOn: '29 Jan 2026 11:45',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Mary Wong',
    contact: '23456789',
    email: 'mary.wong@ha.org.hk'
  },
  {
    id: 5,
    topic: 'Team Building Workshop',
    room: 'Function Room',
    date: '15 Feb 2026',
    time: '09:00 - 17:00',
    bookedOn: '01 Feb 2026 08:30',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Peter Lee',
    contact: '34567890',
    email: 'peter.lee@ha.org.hk'
  },
  {
    id: 6,
    topic: 'Client Presentation',
    room: 'Conference Room 3',
    date: '18 Jan 2026',
    time: '15:00 - 16:30',
    bookedOn: '08 Jan 2026 13:10',
    status: 'past',
    type: 'venue',
    reservedBy: 'Sarah Chen',
    contact: '45678901',
    email: 'sarah.chen@ha.org.hk'
  },
  {
    id: 7,
    topic: 'IT Security Briefing',
    room: 'Discussion Room 2',
    date: '08 Feb 2026',
    time: '10:30 - 12:00',
    bookedOn: '25 Jan 2026 15:40',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'David Lam',
    contact: '56789012',
    email: 'david.lam@ha.org.hk'
  },
  {
    id: 8,
    topic: 'Annual Performance Review',
    room: 'Conference Room 1',
    date: '22 Jan 2026',
    time: '14:00 - 16:00',
    bookedOn: '12 Jan 2026 10:25',
    status: 'past',
    type: 'venue',
    reservedBy: 'Emily Ng',
    contact: '67890123',
    email: 'emily.ng@ha.org.hk'
  },
  {
    id: 9,
    topic: 'Product Launch Planning',
    room: 'Auditorium',
    date: '20 Feb 2026',
    time: '09:30 - 11:00',
    bookedOn: '03 Feb 2026 12:50',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Michael Chow',
    contact: '78901234',
    email: 'michael.chow@ha.org.hk'
  },
  {
    id: 10,
    topic: 'HR Policy Update Session',
    room: 'Lecture Theatre',
    date: '25 Feb 2026',
    time: '13:30 - 15:00',
    bookedOn: '05 Feb 2026 09:05',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Linda Tsang',
    contact: '89012345',
    email: 'linda.tsang@ha.org.hk'
  },
  {
    id: 11,
    topic: 'Quarterly Business Review',
    room: 'Conference Room 2',
    date: '28 Feb 2026',
    time: '10:00 - 12:00',
    bookedOn: '06 Feb 2026 14:15',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Robert Chan',
    contact: '90123456',
    email: 'robert.chan@ha.org.hk'
  },
  {
    id: 12,
    topic: 'Marketing Strategy Meeting',
    room: 'Discussion Room',
    date: '15 Jan 2026',
    time: '11:00 - 12:30',
    bookedOn: '05 Jan 2026 16:55',
    status: 'canceled',
    type: 'venue',
    reservedBy: 'Jessica Liu',
    contact: '01234567',
    email: 'jessica.liu@ha.org.hk'
  },
  {
    id: 13,
    topic: 'Vendor Negotiation',
    room: 'Conference Room 3',
    date: '03 Mar 2026',
    time: '14:30 - 16:00',
    bookedOn: '07 Feb 2026 11:20',
    status: 'upcoming',
    type: 'venue',
    reservedBy: 'Thomas Yip',
    contact: '11223344',
    email: 'thomas.yip@ha.org.hk'
  }
])

const filteredBookings = computed(() => {
  let result = bookings.value

  // Filter by status (multi-select)
  const activeStatuses = Object.keys(statusFilters.value).filter(key => statusFilters.value[key])
  if (activeStatuses.length > 0 && activeStatuses.length < 3) {
    result = result.filter(b => activeStatuses.includes(b.status))
  }

  // Filter by date range
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    result = result.filter(b => {
      const bookingDate = parseDate(b.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return bookingDate >= start && bookingDate <= end
    })
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(b =>
      b.topic.toLowerCase().includes(query) ||
      b.room.toLowerCase().includes(query) ||
      b.date.toLowerCase().includes(query) ||
      b.reservedBy.toLowerCase().includes(query)
    )
  }

  return result
})

// Helper function to parse date string "10 Feb 2026" to Date object
const parseDate = (dateStr) => {
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  }
  const parts = dateStr.split(' ')
  const day = parseInt(parts[0])
  const month = months[parts[1]]
  const year = parseInt(parts[2])
  return new Date(year, month, day)
}

// Status filter label
const statusFilterLabel = computed(() => {
  const activeStatuses = Object.keys(statusFilters.value).filter(key => statusFilters.value[key])
  if (activeStatuses.length === 3) {
    return 'All bookings'
  } else if (activeStatuses.length === 0) {
    return 'No status selected'
  } else if (activeStatuses.length === 1) {
    return formatStatus(activeStatuses[0])
  } else {
    return `${activeStatuses.length} statuses`
  }
})

const allStatusesSelected = computed({
  get: () => Object.values(statusFilters.value).every(Boolean),
  set: (checked) => {
    statusFilters.value = {
      upcoming: checked,
      past: checked,
      canceled: checked
    }
  }
})

const allColumnsSelected = computed({
  get: () => availableColumns.value.every(col => col.visible),
  set: (checked) => {
    availableColumns.value.forEach((col) => {
      col.visible = col.required ? true : checked
    })
  }
})

// Date filter label
const dateFilterLabel = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) {
    return 'All dates'
  }
  const [start, end] = dateRange.value
  const startDate = new Date(start)
  const endDate = new Date(end)
  const formatDate = (date) => {
    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    return `${day} ${month}`
  }
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredBookings.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredBookings.value.length))

const paginatedBookings = computed(() => {
  return filteredBookings.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Watch for filter changes and reset to page 1
watch([statusFilters, searchQuery, dateRange], () => {
  currentPage.value = 1
}, { deep: true })

const onLogout = () => {
  router.push('/login')
}

// Format status to capitalize first letter
const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Toggle status filter
const toggleStatusFilter = (event) => {
  event.stopPropagation()
  showStatusFilter.value = !showStatusFilter.value

  if (showStatusFilter.value) {
    setTimeout(() => {
      document.addEventListener('click', handleStatusFilterClickOutside, { once: false })
    }, 0)
  } else {
    document.removeEventListener('click', handleStatusFilterClickOutside)
  }
}

// Click outside to close status filter
const handleStatusFilterClickOutside = (event) => {
  const dropdown = document.querySelector('.status-filter-dropdown')
  const filterBtn = event.target.closest('.status-filter-wrapper')

  if (!dropdown?.contains(event.target) && !filterBtn) {
    showStatusFilter.value = false
    document.removeEventListener('click', handleStatusFilterClickOutside)
  }
}

// Toggle columns filter
const toggleColumnsFilter = (event) => {
  event.stopPropagation()
  showColumnsFilter.value = !showColumnsFilter.value

  if (showColumnsFilter.value) {
    setTimeout(() => {
      document.addEventListener('click', handleColumnsFilterClickOutside, { once: false })
    }, 0)
  } else {
    document.removeEventListener('click', handleColumnsFilterClickOutside)
  }
}

// Click outside to close columns filter
const handleColumnsFilterClickOutside = (event) => {
  const dropdown = document.querySelector('.columns-filter-dropdown')
  const filterBtn = event.target.closest('.columns-filter-wrapper')

  if (!dropdown?.contains(event.target) && !filterBtn) {
    showColumnsFilter.value = false
    document.removeEventListener('click', handleColumnsFilterClickOutside)
  }
}

// Toggle date filter
const toggleDateFilter = (event) => {
  event.stopPropagation()
  showDateFilter.value = !showDateFilter.value

  if (showDateFilter.value) {
    setTimeout(() => {
      document.addEventListener('click', handleDateFilterClickOutside, { once: false })
    }, 0)
  } else {
    document.removeEventListener('click', handleDateFilterClickOutside)
  }
}

// Click outside to close date filter
const handleDateFilterClickOutside = (event) => {
  const dropdown = document.querySelector('.date-filter-dropdown')
  const filterBtn = event.target.closest('.date-filter-wrapper')

  // Check if click is inside el-date-picker popup
  const datePickerPopup = document.querySelector('.el-picker__popper')
  if (datePickerPopup && datePickerPopup.contains(event.target)) {
    return
  }

  if (!dropdown?.contains(event.target) && !filterBtn) {
    showDateFilter.value = false
    document.removeEventListener('click', handleDateFilterClickOutside)
  }
}

// Clear date filter
const clearDateFilter = () => {
  dateRange.value = null
}

// Quick date options
const quickDateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' }
]

// Get date range for quick options
const getQuickDateRange = (option) => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (option) {
    case 'today':
      return [formatDateToString(today), formatDateToString(today)]

    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return [formatDateToString(yesterday), formatDateToString(yesterday)]
    }

    case 'thisMonth': {
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      return [formatDateToString(firstDay), formatDateToString(lastDay)]
    }

    case 'lastMonth': {
      const firstDay = new Date(year, month - 1, 1)
      const lastDay = new Date(year, month, 0)
      return [formatDateToString(firstDay), formatDateToString(lastDay)]
    }

    case 'thisYear': {
      const firstDay = new Date(year, 0, 1)
      const lastDay = new Date(year, 11, 31)
      return [formatDateToString(firstDay), formatDateToString(lastDay)]
    }

    case 'lastYear': {
      const firstDay = new Date(year - 1, 0, 1)
      const lastDay = new Date(year - 1, 11, 31)
      return [formatDateToString(firstDay), formatDateToString(lastDay)]
    }

    default:
      return null
  }
}

// Format date to YYYY-MM-DD string
const formatDateToString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Select quick date option
const selectQuickDate = (option) => {
  const quickRange = getQuickDateRange(option.value)

  // If clicking the same option again, clear the filter
  if (isQuickDateActive(option)) {
    dateRange.value = null
  } else {
    dateRange.value = quickRange
  }
}

// Check if quick date option is active
const isQuickDateActive = (option) => {
  if (!dateRange.value || dateRange.value.length !== 2) return false
  const quickRange = getQuickDateRange(option.value)
  if (!quickRange) return false
  return dateRange.value[0] === quickRange[0] && dateRange.value[1] === quickRange[1]
}

const cancelBooking = (id) => {
  cancelBookingId.value = id
  cancelReason.value = ''
  showCancelDialog.value = true
}

const confirmCancel = () => {
  if (!cancelReason.value.trim()) {
    ElMessage.warning('Please provide a reason for cancellation')
    return
  }

  const booking = bookings.value.find(b => b.id === cancelBookingId.value)
  if (booking) {
    booking.status = 'canceled'
    booking.reason = cancelReason.value.trim()
  }

  showCancelDialog.value = false
  ElMessage.success('Venue booking cancelled successfully!')
}

const editBooking = (id) => {
  ElMessage.info('Edit booking: ' + id)
}
</script>

<style scoped>
.toolbar {
  flex-shrink: 0;
}

.filter-select {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: #374151;
  background-color: white;
  cursor: pointer;
  min-width: 130px;
}

.filter-select:focus {
  outline: none;
  border-color: #00723a;
}

.search-input {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: #374151;
  min-width: 350px;
  flex: 1;
  max-width: 500px;
}

.search-input:focus {
  outline: none;
  border-color: #00723a;
}

/* Date Filter */
.date-filter-wrapper {
  position: relative;
  display: inline-block;
}

.date-filter-btn {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 160px;
}

.date-filter-btn .calendar-icon {
  color: #00723a;
  flex-shrink: 0;
}

.date-filter-btn .arrow-icon {
  transition: transform 0.2s;
  margin-left: auto;
  flex-shrink: 0;
}

.date-filter-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.date-filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1000;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 2px solid #00723a;
  min-width: 320px;
  animation: slideDown 0.2s ease-out;
}

.date-filter-header {
  padding: 12px 16px;
  border-bottom: 2px solid #00723a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.date-filter-header .filter-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #00723a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-filter-header .filter-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #00723a;
  border-radius: 2px;
}

.clear-all-btn {
  padding: 0.375rem;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  width: 28px;
  height: 28px;
}

.clear-all-btn:hover {
  background-color: #fecaca;
}

.clear-all-btn svg {
  stroke-width: 3;
}

.date-filter-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-date-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.quick-date-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.quick-date-btn:hover {
  background-color: #f0fdf4;
  border-color: #00723a;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-date-btn.active {
  background: linear-gradient(135deg, #00723a 0%, #059669 100%);
  border-color: #00723a;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 114, 58, 0.3);
  transform: translateY(-1px);
}

.custom-date-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
}

.custom-date-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #00723a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.date-range-picker {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

:deep(.el-date-editor:hover) {
  border-color: #00723a;
}

:deep(.el-date-editor.is-active) {
  border-color: #00723a;
  box-shadow: 0 0 0 3px rgba(0, 114, 58, 0.1);
}

:deep(.el-date-editor .el-range-input) {
  font-size: 0.8125rem;
  color: #111827;
}

:deep(.el-date-editor .el-range-separator) {
  font-size: 0.75rem;
  color: #00723a;
  font-weight: 600;
}

:deep(.el-date-editor .el-range__icon) {
  color: #00723a;
}

:deep(.el-date-editor .el-range__close-icon) {
  color: #ef4444;
}

.view-toggle-btn {
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.view-toggle-btn.active {
  background-color: #00723a;
  border-color: #00723a;
  color: white;
}

.content-area {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
}

/* Card View */
.card-view::-webkit-scrollbar {
  width: 8px;
}

.card-view::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.card-view::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.booking-card {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  background-color: white;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.booking-card.status-upcoming {
  border-left: 4px solid #00723a;
}

.booking-card.status-past {
  border-left: 4px solid #9ca3af;
}

.booking-card.status-canceled {
  border-left: 4px solid #ef4444;
}

.booking-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 0.5rem;
  background-color: #f3f4f6;
  padding: 0.5rem;
  margin: -0.75rem -0.75rem 0.5rem -0.75rem;
  border-bottom: 2px solid #d1d5db;
}

.card-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.status-badge {
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
  display: inline-block;
}

.badge-upcoming {
  background-color: #d1fae5;
  color: #065f46;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
}

.badge-past {
  background-color: #e5e7eb;
  color: #4b5563;
}

.badge-canceled {
  background-color: #fee2e2;
  color: #991b1b;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  margin-bottom: 0.625rem;
  flex: 1;
}

.card-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.card-label {
  color: #6b7280;
  font-weight: 500;
}

.card-value {
  color: #111827;
  font-weight: 400;
  text-align: right;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 24px;
  margin-top: auto;
}

.reason-row {
  display: flex;
  gap: 0.25rem;
  font-size: 0.75rem;
  align-items: flex-start;
}

.reason-label {
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.reason-text {
  color: #111827;
  font-weight: 400;
  flex: 1;
  word-break: break-word;
}

.btn-cancel {
  background-color: #ef4444;
  color: white;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  font-size: 0.625rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-end;
}

.btn-cancel:hover {
  background-color: #dc2626;
}

/* Table View */
.table-view {
  position: relative;
}

.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  height: 100%;
}

.table-view::-webkit-scrollbar,
.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-view::-webkit-scrollbar-track,
.table-wrapper::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.table-view::-webkit-scrollbar-thumb,
.table-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.bookings-table thead {
  background-color: #f3f4f6;
  color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 2px solid #d1d5db;
}

.bookings-table th {
  padding: 0.5rem;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.8125rem;
}

.bookings-table th.col-datetime {
  width: 140px;
  min-width: 140px;
}

.bookings-table th.col-no {
  width: 50px;
  min-width: 50px;
  text-align: center;
}

.bookings-table th.col-actions {
  width: 130px;
  min-width: 130px;
  text-align: center;
  position: sticky;
  right: 0;
  background-color: #f3f4f6;
  z-index: 11;
}

.bookings-table td {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.bookings-table td.actions-td {
  position: sticky;
  right: 0;
  background-color: white;
  text-align: center;
  width: 130px;
  min-width: 130px;
}

.bookings-table tbody tr:hover td.actions-td {
  background-color: #f9fafb;
}

.bookings-table tbody tr:hover {
  background-color: #f9fafb;
}

.no-cell {
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}

.datetime-cell {
  white-space: nowrap;
}

.datetime-cell .date {
  font-weight: 500;
  color: #111827;
  font-size: 0.8125rem;
}

.datetime-cell .time {
  font-size: 0.75rem;
  color: #6b7280;
}

.actions-cell {
  display: flex;
  gap: 0.3125rem;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
}

.btn-action {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-approve {
  background-color: #00723a;
  color: white;
}

.btn-approve:hover {
  background-color: #005a2e;
}

.btn-edit {
  background-color: #f97316;
  color: white;
}

.btn-edit:hover {
  background-color: #ea580c;
}

.btn-cancel-small {
  background-color: #ef4444;
  color: white;
}

.btn-cancel-small:hover {
  background-color: #dc2626;
}

/* Status Filter */
.status-filter-wrapper {
  position: relative;
  display: inline-block;
}

.status-filter-btn {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 150px;
}

.status-filter-btn .arrow-icon {
  transition: transform 0.2s;
  margin-left: auto;
}

.status-filter-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.status-filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1000;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-width: 200px;
  animation: slideDown 0.2s ease-out;
}

.status-filter-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.status-filter-header .filter-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.status-filter-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.status-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #00723a;
}

.status-checkbox:hover {
  color: #00723a;
}

.select-all-option {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

/* Columns Filter */
.columns-filter-wrapper {
  position: relative;
  display: inline-block;
}

.columns-filter-btn {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.columns-filter-btn .arrow-icon {
  transition: transform 0.2s;
}

.columns-filter-btn:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.columns-filter-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 1000;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-width: 200px;
  animation: slideDown 0.2s ease-out;
}

.columns-filter-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.columns-filter-header .filter-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
}

.columns-filter-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.column-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #00723a;
}

.column-checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.column-checkbox:hover {
  color: #00723a;
}

/* Pagination */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* padding: 0.1875rem 1rem; */
  padding: 0.475rem 0.5rem 0.375rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-bottom: -8px;
}

.pagination-controls {
  display: flex;
  gap: 0.375rem;
  align-items: center;
  margin-bottom: -8px;
  /* margin-top: 6px; */
}

.pagination-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.page-number {
  min-width: 36px;
  text-align: center;
}

.pagination-btn.page-number.active {
  background-color: #00723a;
  border-color: #00723a;
  color: white;
}

.pagination-btn.page-number.active:hover {
  background-color: #005a2e;
  border-color: #005a2e;
}

.cancel-message {
  margin-bottom: 1rem;
  color: #374151;
  font-size: 0.875rem;
}

.pagination-size {
  display: flex;
  align-items: center;
  margin-bottom: -8px;
}

.page-size-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #00723a;
}

@media (max-width: 389px), (min-width: 390px) and (max-width: 767px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .search-input {
    min-width: 0;
    flex: 1;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .bookings-table {
    font-size: 0.75rem;
  }

  .bookings-table th,
  .bookings-table td {
    padding: 0.5rem;
  }

  .pagination-bar {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }

  .pagination-info,
  .pagination-size {
    text-align: center;
  }
}
</style>
