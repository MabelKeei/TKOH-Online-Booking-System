<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Meeting Approval</h2>
      <div class="header-actions">
        <el-button @click="handleExport">
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
              <el-badge :value="pendingList.length" :max="99" class="badge-item" />
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
            <el-table-column prop="bookingId" label="Booking ID" min-width="140" />
            <el-table-column prop="venueName" label="Venue" min-width="180" />
            <el-table-column prop="employeeName" label="Employee" min-width="130" />
            <el-table-column prop="department" label="Department" min-width="120" />
            <el-table-column prop="meetingTitle" label="Meeting Title" min-width="200" />
            <el-table-column prop="date" label="Date" min-width="120" />
            <el-table-column prop="time" label="Time" min-width="130" />
            <el-table-column prop="submittedAt" label="Submitted" min-width="160" />
            <el-table-column label="Actions" width="220" fixed="right" class-name="actions-col">
              <template #default="{ row }">
                <div class="actions-cell">
                  <el-button size="small" class="action-btn action-approve" @click="handleApprove(row)">Approve</el-button>
                  <el-button size="small" class="action-btn action-delete" @click="handleReject(row)">Reject</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ pendingStartIndex + 1 }}-{{ pendingEndIndex }} of {{ pendingList.length }} records
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
            <el-table-column prop="bookingId" label="Booking ID" min-width="140" />
            <el-table-column prop="venueName" label="Venue" min-width="180" />
            <el-table-column prop="employeeName" label="Employee" min-width="130" />
            <el-table-column prop="meetingTitle" label="Meeting Title" min-width="200" />
            <el-table-column prop="date" label="Date" min-width="120" />
            <el-table-column prop="time" label="Time" min-width="130" />
            <el-table-column prop="approvedAt" label="Approved At" min-width="160" />
            <el-table-column prop="approvedBy" label="Approved By" min-width="120" />
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ approvedStartIndex + 1 }}-{{ approvedEndIndex }} of {{ approvedList.length }} records
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
            <el-table-column prop="bookingId" label="Booking ID" min-width="140" />
            <el-table-column prop="venueName" label="Venue" min-width="180" />
            <el-table-column prop="employeeName" label="Employee" min-width="130" />
            <el-table-column prop="meetingTitle" label="Meeting Title" min-width="180" />
            <el-table-column prop="date" label="Date" min-width="120" />
            <el-table-column prop="time" label="Time" min-width="130" />
            <el-table-column prop="rejectedAt" label="Rejected At" min-width="160" />
            <el-table-column prop="rejectedBy" label="Rejected By" min-width="120" />
            <el-table-column prop="reason" label="Reason" min-width="200" />
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ rejectedStartIndex + 1 }}-{{ rejectedEndIndex }} of {{ rejectedList.length }} records
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

    <el-dialog
      v-model="showRejectDialog"
      title="Reject Booking"
      width="500px"
    >
      <el-form :model="rejectForm" label-width="100px">
        <el-form-item label="Reason">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="Please provide a reason for rejection" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">Cancel</el-button>
        <el-button type="danger" @click="confirmReject">Confirm Reject</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

const activeTab = ref('pending')

const pendingList = ref([
  {
    id: 1,
    bookingId: 'BK20260320001',
    venueName: 'Conference Room A',
    employeeName: 'John Doe',
    department: 'IT',
    meetingTitle: 'Q1 Project Review Meeting',
    date: '2026-03-25',
    time: '14:00-16:00',
    submittedAt: '2026-03-20 10:30'
  },
  {
    id: 2,
    bookingId: 'BK20260320002',
    venueName: 'Conference Room B',
    employeeName: 'Jane Smith',
    department: 'HR',
    meetingTitle: 'Team Building Planning',
    date: '2026-03-26',
    time: '10:00-12:00',
    submittedAt: '2026-03-20 11:15'
  }
])

const approvedList = ref([
  {
    id: 101,
    bookingId: 'BK20260319001',
    venueName: 'Conference Room A',
    employeeName: 'Bob Wilson',
    meetingTitle: 'Budget Review',
    date: '2026-03-24',
    time: '09:00-11:00',
    approvedAt: '2026-03-19 15:30',
    approvedBy: 'Admin'
  }
])

const rejectedList = ref([
  {
    id: 201,
    bookingId: 'BK20260318001',
    venueName: 'Conference Room B',
    employeeName: 'Alice Brown',
    meetingTitle: 'Casual Discussion',
    date: '2026-03-23',
    time: '15:00-17:00',
    rejectedAt: '2026-03-18 16:45',
    rejectedBy: 'Admin',
    reason: 'Meeting title not specific enough'
  }
])

const pendingCurrentPage = ref(1)
const pendingPageSize = ref(10)
const approvedCurrentPage = ref(1)
const approvedPageSize = ref(10)
const rejectedCurrentPage = ref(1)
const rejectedPageSize = ref(10)

const paginatedPendingData = computed(() => {
  const start = (pendingCurrentPage.value - 1) * pendingPageSize.value
  const end = start + pendingPageSize.value
  return pendingList.value.slice(start, end)
})
const pendingTotalPages = computed(() => Math.max(1, Math.ceil(pendingList.value.length / pendingPageSize.value)))
const pendingStartIndex = computed(() => (pendingCurrentPage.value - 1) * pendingPageSize.value)
const pendingEndIndex = computed(() => Math.min(pendingStartIndex.value + pendingPageSize.value, pendingList.value.length))
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
  return approvedList.value.slice(start, end)
})
const approvedTotalPages = computed(() => Math.max(1, Math.ceil(approvedList.value.length / approvedPageSize.value)))
const approvedStartIndex = computed(() => (approvedCurrentPage.value - 1) * approvedPageSize.value)
const approvedEndIndex = computed(() => Math.min(approvedStartIndex.value + approvedPageSize.value, approvedList.value.length))
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
  return rejectedList.value.slice(start, end)
})
const rejectedTotalPages = computed(() => Math.max(1, Math.ceil(rejectedList.value.length / rejectedPageSize.value)))
const rejectedStartIndex = computed(() => (rejectedCurrentPage.value - 1) * rejectedPageSize.value)
const rejectedEndIndex = computed(() => Math.min(rejectedStartIndex.value + rejectedPageSize.value, rejectedList.value.length))
const rejectedVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, rejectedCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(rejectedTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showRejectDialog = ref(false)
const rejectForm = ref({
  reason: '',
  currentRow: null
})

const getPendingRowIndex = (index) => (pendingCurrentPage.value - 1) * pendingPageSize.value + index + 1
const getApprovedRowIndex = (index) => (approvedCurrentPage.value - 1) * approvedPageSize.value + index + 1
const getRejectedRowIndex = (index) => (rejectedCurrentPage.value - 1) * rejectedPageSize.value + index + 1

const handleExport = () => {
  const allData = [
    ...pendingList.value.map(item => ({ ...item, status: 'Pending' })),
    ...approvedList.value.map(item => ({ ...item, status: 'Approved' })),
    ...rejectedList.value.map(item => ({ ...item, status: 'Rejected' }))
  ]

  const exportData = allData.map(item => ({
    'Booking ID': item.bookingId,
    'Venue': item.venueName,
    'Employee': item.employeeName,
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

const handleApprove = (row) => {
  ElMessageBox.confirm(`Approve booking "${row.meetingTitle}"?`, 'Confirm', {
    type: 'success'
  }).then(() => {
    approvedList.value.push({
      ...row,
      approvedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
      approvedBy: 'Admin'
    })
    const index = pendingList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      pendingList.value.splice(index, 1)
    }
    ElMessage.success('Booking approved successfully')
  })
}

const handleReject = (row) => {
  rejectForm.value.currentRow = row
  rejectForm.value.reason = ''
  showRejectDialog.value = true
}

const confirmReject = () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('Please provide a reason for rejection')
    return
  }

  const row = rejectForm.value.currentRow
  rejectedList.value.push({
    ...row,
    rejectedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    rejectedBy: 'Admin',
    reason: rejectForm.value.reason
  })
  const index = pendingList.value.findIndex(item => item.id === row.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
  }
  showRejectDialog.value = false
  ElMessage.success('Booking rejected')
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
  overflow: hidden;
  background: #ffffff;
  color: #111827;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin: 0.5rem 0.75rem 0.5rem;
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
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.5rem;
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
</style>
