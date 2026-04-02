<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Meeting Approval</h2>
      <div class="header-actions">
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
              <div class="custom-date-section">
                <div class="custom-date-label">Custom Range:</div>
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  :teleported="false"
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

        <el-button type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane name="pending">
          <template #label>
            <span>
              Pending Approval
              <el-badge :value="filteredPendingList.length" :max="99" class="badge-item" />
            </span>
          </template>

          <div class="table-card">
          <el-table :data="paginatedPendingData" height="100%" border stripe table-layout="auto" style="width: 100%">
            <el-table-column
              type="index"
              label="#"
              width="70"
              align="center"
              header-align="center"
              fixed="left"
              :index="getPendingRowIndex"
            />
            <el-table-column prop="venueName" label="Venue" min-width="180" />
            <el-table-column label="Reserved By" min-width="200">
              <template #default="{ row }">
                {{ formatReservedBy(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="meetingTitle" label="Meeting Title" min-width="200" />
            <el-table-column prop="date" label="Date" min-width="120" />
            <el-table-column prop="time" label="Time" min-width="130" />
            <el-table-column prop="submittedAt" label="Submitted" min-width="160" />
            <el-table-column label="Actions" width="120" fixed="right" class-name="actions-col">
              <template #default="{ row }">
                <div class="actions-cell">
                  <el-button size="small" class="action-btn action-edit" @click="handleOpen(row)">Handle</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ pendingStartIndex + 1 }}-{{ pendingEndIndex }} of {{ filteredPendingList.length }} records
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="pendingCurrentPage === 1" @click="pendingCurrentPage--">Previous</button>
              <button
                v-for="page in pendingVisiblePages"
                :key="page"
                :class="['pagination-btn', 'page-number', { active: page === pendingCurrentPage }]"
                @click="pendingCurrentPage = page"
              >
                {{ page }}
              </button>
              <button class="pagination-btn" :disabled="pendingCurrentPage === pendingTotalPages" @click="pendingCurrentPage++">Next</button>
            </div>
            <div class="pagination-size">
              <select v-model.number="pendingPageSize" class="page-size-select" @change="pendingCurrentPage = 1">
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
                <option :value="100">100 / page</option>
              </select>
            </div>
          </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Approved" name="approved">
          <div class="table-card">
          <el-table :data="paginatedApprovedData" height="100%" border stripe table-layout="auto" style="width: 100%">
            <el-table-column
              type="index"
              label="#"
              width="70"
              align="center"
              header-align="center"
              fixed="left"
              :index="getApprovedRowIndex"
            />
            <el-table-column prop="venueName" label="Venue" min-width="180" />
            <el-table-column label="Reserved By" min-width="200">
              <template #default="{ row }">
                {{ formatReservedBy(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="meetingTitle" label="Meeting Title" min-width="200" />
            <el-table-column prop="date" label="Date" min-width="120" />
            <el-table-column prop="time" label="Time" min-width="130" />
            <el-table-column prop="approvedBy" label="Approved By" min-width="120" />
            <el-table-column prop="approvedAt" label="Approved At" min-width="160" />
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ approvedStartIndex + 1 }}-{{ approvedEndIndex }} of {{ filteredApprovedList.length }} records
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="approvedCurrentPage === 1" @click="approvedCurrentPage--">Previous</button>
              <button
                v-for="page in approvedVisiblePages"
                :key="page"
                :class="['pagination-btn', 'page-number', { active: page === approvedCurrentPage }]"
                @click="approvedCurrentPage = page"
              >
                {{ page }}
              </button>
              <button class="pagination-btn" :disabled="approvedCurrentPage === approvedTotalPages" @click="approvedCurrentPage++">Next</button>
            </div>
            <div class="pagination-size">
              <select v-model.number="approvedPageSize" class="page-size-select" @change="approvedCurrentPage = 1">
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
                <option :value="100">100 / page</option>
              </select>
            </div>
          </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Rejected" name="rejected">
          <div class="table-card">
          <el-table :data="paginatedRejectedData" height="100%" border stripe table-layout="auto" style="width: 100%">
            <el-table-column
              type="index"
              label="#"
              width="70"
              align="center"
              header-align="center"
              fixed="left"
              :index="getRejectedRowIndex"
            />
            <el-table-column prop="venueName" label="Venue" min-width="180" />
            <el-table-column label="Reserved By" min-width="200">
              <template #default="{ row }">
                {{ formatReservedBy(row) }}
              </template>
            </el-table-column>
            <el-table-column prop="meetingTitle" label="Meeting Title" min-width="180" />
            <el-table-column prop="date" label="Date" min-width="120" />
            <el-table-column prop="time" label="Time" min-width="130" />
            <el-table-column prop="rejectedBy" label="Rejected By" min-width="120" />
            <el-table-column prop="rejectedAt" label="Rejected At" min-width="160" />
            <el-table-column prop="reason" label="Reason" min-width="200" />
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ rejectedStartIndex + 1 }}-{{ rejectedEndIndex }} of {{ filteredRejectedList.length }} records
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="rejectedCurrentPage === 1" @click="rejectedCurrentPage--">Previous</button>
              <button
                v-for="page in rejectedVisiblePages"
                :key="page"
                :class="['pagination-btn', 'page-number', { active: page === rejectedCurrentPage }]"
                @click="rejectedCurrentPage = page"
              >
                {{ page }}
              </button>
              <button class="pagination-btn" :disabled="rejectedCurrentPage === rejectedTotalPages" @click="rejectedCurrentPage++">Next</button>
            </div>
            <div class="pagination-size">
              <select v-model.number="rejectedPageSize" class="page-size-select" @change="rejectedCurrentPage = 1">
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
                <option :value="100">100 / page</option>
              </select>
            </div>
          </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <BookingStyleModal
      v-model="showHandleDialog"
      title="Handle Booking"
      max-width="620px"
      :max-height="handleBookingModalMaxHeight"
    >
      <el-form :model="handleForm" label-width="130px">
        <el-form-item label="Venue">
          <el-input v-model="handleForm.venueName" disabled />
        </el-form-item>
        
        <el-form-item label="Meeting Title">
          <el-input v-model="handleForm.meetingTitle" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Date">
          <el-input v-model="handleForm.date" disabled />
        </el-form-item>
        <el-form-item label="Time">
          <el-input v-model="handleForm.time" disabled />
        </el-form-item>
        <div class="contact-info-section">
          <el-form-item label="Full Name" label-width="154px">
            <el-input v-model="handleForm.userName" disabled />
          </el-form-item>
          <el-form-item label="Department / Unit" label-width="154px">
            <el-input v-model="handleForm.departmentUnit" disabled />
          </el-form-item>
          <el-form-item label="Contact Telephone No" label-width="154px">
            <el-input v-model="handleForm.contactPhone" disabled />
          </el-form-item>
          <el-form-item label="Contact Email" label-width="154px">
            <el-input v-model="handleForm.contactEmail" disabled />
          </el-form-item>
        </div>
        <el-form-item label="Reject Reason">
          <el-select
            v-model="handleForm.rejectTemplateKey"
            placeholder="Select reject template"
            style="width: 100%; margin-bottom: 8px;"
            :teleported="false"
            @change="handleRejectTemplateChange"
          >
            <el-option
              v-for="tpl in rejectTemplateOptions"
              :key="tpl.key"
              :label="tpl.name"
              :value="tpl.key"
            />
          </el-select>
          <el-input
            v-model="handleForm.reason"
            type="textarea"
            :rows="3"
            placeholder="Required only when rejecting"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showHandleDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmHandleReject">Reject</el-button>
        <el-button type="default" class="action-btn action-approve" @click="confirmHandleApprove">Approve</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { useAdminStore } from '@/stores/admin'
import {
  getMockMeetingPendingList,
  getMockMeetingApprovedList,
  getMockMeetingRejectedList,
  getMockEmployeeListNormalized,
  getMockPromptList
} from '@/mocks/mockData'

const adminStore = useAdminStore()

const activeTab = ref('pending')

const pendingList = ref(getMockMeetingPendingList())
const employeeList = ref(getMockEmployeeListNormalized())

const approvedList = ref(getMockMeetingApprovedList())

const rejectedList = ref(getMockMeetingRejectedList())
const rejectTemplateOptions = computed(() =>
  getMockPromptList().filter(
    item => item.category === 'reject_template' && item.templateType === 'meeting_approval'
  )
)
const showDateFilter = ref(false)
const dateRange = ref(null)
const quickDateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' }
]

const pendingCurrentPage = ref(1)
const pendingPageSize = ref(10)
const approvedCurrentPage = ref(1)
const approvedPageSize = ref(10)
const rejectedCurrentPage = ref(1)
const rejectedPageSize = ref(10)

const dateFilterLabel = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) return 'All dates'
  const [start, end] = dateRange.value
  const startDate = new Date(start)
  const endDate = new Date(end)
  const fmt = (date) => `${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`
  return `${fmt(startDate)} - ${fmt(endDate)}`
})

function parseYmdDate(ymd) {
  const [year, month, day] = String(ymd || '').split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function isDateInRange(item) {
  if (!dateRange.value || dateRange.value.length !== 2) return true
  const [startDate, endDate] = dateRange.value
  const itemDate = parseYmdDate(item.date)
  if (!itemDate) return true
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return itemDate >= start && itemDate <= end
}

const filteredPendingList = computed(() => pendingList.value.filter(isDateInRange))
const filteredApprovedList = computed(() => approvedList.value.filter(isDateInRange))
const filteredRejectedList = computed(() => rejectedList.value.filter(isDateInRange))

const paginatedPendingData = computed(() => {
  const start = (pendingCurrentPage.value - 1) * pendingPageSize.value
  const end = start + pendingPageSize.value
  return filteredPendingList.value.slice(start, end)
})
const pendingTotalPages = computed(() => Math.max(1, Math.ceil(filteredPendingList.value.length / pendingPageSize.value)))
const pendingStartIndex = computed(() => (pendingCurrentPage.value - 1) * pendingPageSize.value)
const pendingEndIndex = computed(() => Math.min(pendingStartIndex.value + pendingPageSize.value, filteredPendingList.value.length))
const pendingVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pendingCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(pendingTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedApprovedData = computed(() => {
  const start = (approvedCurrentPage.value - 1) * approvedPageSize.value
  const end = start + approvedPageSize.value
  return filteredApprovedList.value.slice(start, end)
})
const approvedTotalPages = computed(() => Math.max(1, Math.ceil(filteredApprovedList.value.length / approvedPageSize.value)))
const approvedStartIndex = computed(() => (approvedCurrentPage.value - 1) * approvedPageSize.value)
const approvedEndIndex = computed(() => Math.min(approvedStartIndex.value + approvedPageSize.value, filteredApprovedList.value.length))
const approvedVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, approvedCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(approvedTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedRejectedData = computed(() => {
  const start = (rejectedCurrentPage.value - 1) * rejectedPageSize.value
  const end = start + rejectedPageSize.value
  return filteredRejectedList.value.slice(start, end)
})
const rejectedTotalPages = computed(() => Math.max(1, Math.ceil(filteredRejectedList.value.length / rejectedPageSize.value)))
const rejectedStartIndex = computed(() => (rejectedCurrentPage.value - 1) * rejectedPageSize.value)
const rejectedEndIndex = computed(() => Math.min(rejectedStartIndex.value + rejectedPageSize.value, filteredRejectedList.value.length))
const rejectedVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, rejectedCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(rejectedTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function toggleDateFilter(event) {
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

function handleDateFilterClickOutside(event) {
  const dropdown = document.querySelector('.date-filter-dropdown')
  const filterBtn = event.target.closest('.date-filter-wrapper')
  const datePickerPopup = document.querySelector('.el-picker__popper')
  if (datePickerPopup && datePickerPopup.contains(event.target)) return
  if (!dropdown?.contains(event.target) && !filterBtn) {
    showDateFilter.value = false
    document.removeEventListener('click', handleDateFilterClickOutside)
  }
}

function clearDateFilter() {
  dateRange.value = null
}

function formatDateToString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getQuickDateRange(option) {
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

function selectQuickDate(option) {
  const quickRange = getQuickDateRange(option.value)
  if (isQuickDateActive(option)) {
    dateRange.value = null
  } else {
    dateRange.value = quickRange
  }
}

function isQuickDateActive(option) {
  if (!dateRange.value || dateRange.value.length !== 2) return false
  const quickRange = getQuickDateRange(option.value)
  if (!quickRange) return false
  return dateRange.value[0] === quickRange[0] && dateRange.value[1] === quickRange[1]
}

watch(dateRange, () => {
  pendingCurrentPage.value = 1
  approvedCurrentPage.value = 1
  rejectedCurrentPage.value = 1
})

const showHandleDialog = ref(false)
const currentHandleRow = ref(null)

/** 14" ????100??599??Handle Booking ????????UserManagement ???????*/
const HANDLE_BOOKING_MODAL_MQ = '(min-width: 1100px) and (max-width: 1599px)'
const handleBookingModalMaxHeight = ref('94vh')

function updateHandleBookingModalMaxHeight () {
  if (typeof window === 'undefined') return
  handleBookingModalMaxHeight.value = window.matchMedia(HANDLE_BOOKING_MODAL_MQ).matches ? '120vh' : '94vh'
}

let handleBookingModalMq = null

onMounted(() => {
  updateHandleBookingModalMaxHeight()
  handleBookingModalMq = window.matchMedia(HANDLE_BOOKING_MODAL_MQ)
  handleBookingModalMq.addEventListener('change', updateHandleBookingModalMaxHeight)
})

onUnmounted(() => {
  if (handleBookingModalMq) {
    handleBookingModalMq.removeEventListener('change', updateHandleBookingModalMaxHeight)
  }
  document.removeEventListener('click', handleDateFilterClickOutside)
})

const handleForm = ref({
  venueName: '',
  userName: '',
  departmentUnit: '',
  contactPhone: '',
  contactEmail: '',
  meetingTitle: '',
  date: '',
  time: '',
  rejectTemplateKey: 'meeting_approval_reject_template',
  reason: ''
})

const getPendingRowIndex = (index) => (pendingCurrentPage.value - 1) * pendingPageSize.value + index + 1
const getApprovedRowIndex = (index) => (approvedCurrentPage.value - 1) * approvedPageSize.value + index + 1
const getRejectedRowIndex = (index) => (rejectedCurrentPage.value - 1) * rejectedPageSize.value + index + 1

/** 展示姓名 + corpId；优先 bookerCorpId（mock 中与员工表关联），否则按姓名查员工表 */
function formatReservedBy (row) {
  const name = row.userName || ''
  const corpFromRow = row.bookerCorpId
  if (corpFromRow) {
    return name ? `${name} (${corpFromRow})` : corpFromRow
  }
  const emp = employeeList.value.find((e) => e.name === name)
  const uid = emp?.corpId || emp?.username || ''
  if (name && uid) return `${name} (${uid})`
  return name || uid || '-'
}

const handleExport = () => {
  const allData = [
    ...pendingList.value.map(item => ({ ...item, status: 'Pending' })),
    ...approvedList.value.map(item => ({ ...item, status: 'Approved' })),
    ...rejectedList.value.map(item => ({ ...item, status: 'Rejected' }))
  ]

  const exportData = allData.map(item => ({
    'Booking ID': item.bookingId,
    'Venue ID': item.venueId ?? '',
    'Venue': item.venueName,
    'Reserved By': formatReservedBy(item),
    'Department': item.department || '',
    'Meeting Title': item.meetingTitle,
    'Date': item.date,
    'Time': item.time,
    'Status': item.status,
    'Processed At': item.approvedAt || item.rejectedAt || item.submittedAt,
    'Processed By': item.approvedBy || item.rejectedBy || '',
    'Reason': item.reason || ''
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Meeting Approvals')
  XLSX.writeFile(wb, `Meeting_Approval_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('Excel file exported successfully')
}

const handleOpen = (row) => {
  const matchedEmployee = employeeList.value.find(item => item.name === row.userName)
    || (row.bookerCorpId ? employeeList.value.find(item => item.corpId === row.bookerCorpId) : null)
  currentHandleRow.value = row
  handleForm.value = {
    venueName: row.venueName || '',
    userName: row.userName || '',
    departmentUnit: matchedEmployee?.department || row.department || '-',
    contactPhone: matchedEmployee?.contactPhone || matchedEmployee?.phone || '-',
    contactEmail: matchedEmployee?.email || '-',
    meetingTitle: row.meetingTitle || '',
    date: row.date || '',
    time: row.time || '',
    rejectTemplateKey: 'meeting_approval_reject_template',
    reason: ''
  }
  handleRejectTemplateChange(handleForm.value.rejectTemplateKey)
  showHandleDialog.value = true
}

const handleRejectTemplateChange = (templateKey) => {
  const selectedTemplate = rejectTemplateOptions.value.find(item => item.key === templateKey)
  if (!selectedTemplate) return
  handleForm.value.reason = selectedTemplate.content || ''
}

const confirmHandleApprove = () => {
  if (!currentHandleRow.value) return
  const row = currentHandleRow.value
  const payload = {
    ...row,
    meetingTitle: handleForm.value.meetingTitle
  }
  approvedList.value.push({
    ...payload,
    approvedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    approvedBy: 'Admin'
  })
  const index = pendingList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
  }
  showHandleDialog.value = false
  currentHandleRow.value = null
  ElMessage.success('Booking approved successfully')
  adminStore.fetchPendingCounts()
}

const confirmHandleReject = () => {
  if (!currentHandleRow.value) return
  if (!handleForm.value.reason.trim()) {
    ElMessage.warning('Please provide a reason for rejection')
    return
  }

  const row = currentHandleRow.value
  const payload = {
    ...row,
    meetingTitle: handleForm.value.meetingTitle
  }
  rejectedList.value.push({
    ...payload,
    rejectedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    rejectedBy: 'Admin',
    reason: handleForm.value.reason.trim()
  })
  const index = pendingList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
  }
  showHandleDialog.value = false
  currentHandleRow.value = null
  ElMessage.success('Booking rejected')
  adminStore.fetchPendingCounts()
}

</script>

<style scoped>
.page-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.4s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  position: relative;
  overflow: visible;
  background: #ffffff;
  color: #111827;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin: 0.5rem 0.75rem 0.3rem;
}

.page-header::before {
  content: none;
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.page-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

.page-header :deep(.el-button) {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  box-shadow: none;
  transition: all 0.2s ease;
}

.page-header :deep(.el-button:hover) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.3rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.35rem;
}

.page-content :deep(.el-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.page-content :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.page-content :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
}

.page-content :deep(.el-tabs__item.is-active) {
  color: #00723a;
  font-weight: 600;
}

.page-content :deep(.el-tabs__active-bar) {
  background-color: #00723a;
  height: 3px;
}

.page-content :deep(.el-table) {
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  font-size: 0.8125rem;
}

.page-content :deep(.el-table th) {
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.5rem;
  border-bottom: 2px solid #d1d5db;
  white-space: nowrap;
}

.page-content :deep(.el-table th .cell) {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

.page-content :deep(.el-table td) {
  padding: 0.5rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-content :deep(.el-table__row:hover) {
  background: #f9fafb;
}

.page-content :deep(.el-button--small) {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-content :deep(.el-button--small:hover) {
  transform: none;
  box-shadow: none;
}

.page-content :deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

.badge-item {
  margin-left: 8px;
}

.badge-item :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: 2px solid #ffffff;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

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
  right: 0;
  left: auto;
  min-width: 320px;
  background: white;
  border: 2px solid #00723a;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

.date-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 2px solid #00723a;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.filter-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #00723a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-title::before {
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
  gap: 0.375rem;
}

.quick-date-btn {
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  line-height: 1.2;
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
  color: #6b7280;
  font-size: 0.75rem;
}

:deep(.el-date-editor .el-range__icon) {
  color: #00723a;
}

:deep(.el-date-editor .el-range__close-icon) {
  color: #6b7280;
}

.date-range-picker {
  width: 100%;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding: 0.475rem 0.5rem 0.375rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
  flex-shrink: 0;
}

.pagination-info {
  font-size: 0.8125rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.375rem;
  align-items: center;
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

.pagination-size {
  display: flex;
  align-items: center;
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

.table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.3rem;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-card :deep(.el-table) {
  flex: 1;
  min-height: 0;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 6px;
}

.actions-cell :deep(.el-button) {
  margin-left: 0 !important;
  white-space: nowrap;
}

.action-btn {
  border: none !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 0.25rem !important;
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
  color: #ffffff !important;
  transition: all 0.2s !important;
}

.action-edit {
  background-color: #f97316 !important;
}

.action-edit:hover {
  background-color: #ea580c !important;
}

.action-approve {
  background-color: #00723a !important;
}

.action-approve:hover {
  background-color: #005a2e !important;
}

.action-delete {
  background-color: #ef4444 !important;
}

.action-delete:hover {
  background-color: #dc2626 !important;
}

/* ????Handle ??????????*/
.contact-info-section {
  background-color: #f3f4f6;
  padding: 0.75rem 0.75rem 0.25rem 1.25rem;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.contact-info-section :deep(.el-form-item__label) {
  white-space: nowrap;
}

.contact-info-section :deep(.el-form-item__content) {
  min-width: 0;
}

.contact-info-section :deep(.el-input) {
  width: 96%;
  max-width: 100%;
}
</style>
