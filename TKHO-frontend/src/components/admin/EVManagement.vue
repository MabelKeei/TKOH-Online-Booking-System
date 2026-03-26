<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">EV Management</h2>
      <div class="header-actions">
        <el-button type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
        <el-button type="default" class="submit-btn" @click="handleAdd">
          <font-awesome-icon :icon="['fas', 'plus']" /> {{ activeTab === 'parking' ? 'Add EV' : 'Add Time Period' }}
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="EV Parking Slots" name="parking">
          <div class="table-card">
            <el-table :data="paginatedParkingData" height="100%" border stripe table-layout="auto" style="width: 100%">
              <el-table-column
                type="index"
                label="#"
                width="70"
                align="center"
                header-align="center"
                fixed="left"
                :index="getParkingRowIndex"
              />
              <el-table-column prop="slotNumber" label="Slot Number" min-width="140" />
              <el-table-column prop="location" label="Location" min-width="180" />
              <el-table-column prop="space" label="Space" min-width="100" />
              <el-table-column prop="quantity" label="Quantity" min-width="100" />
              <el-table-column label="Actions" width="160" fixed="right" class-name="actions-col">
                <template #default="{ row }">
                  <div class="actions-cell">
                    <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
                    <el-button size="small" class="action-btn action-delete" @click="handleDelete(row)">Delete</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ parkingStartIndex + 1 }}-{{ parkingEndIndex }} of {{ parkingList.length }} records
              </div>
              <div class="pagination-controls">
                <button class="pagination-btn" :disabled="parkingCurrentPage === 1" @click="parkingCurrentPage--">Previous</button>
                <button
                  v-for="page in parkingVisiblePages"
                  :key="page"
                  :class="['pagination-btn', 'page-number', { active: page === parkingCurrentPage }]"
                  @click="parkingCurrentPage = page"
                >
                  {{ page }}
                </button>
                <button class="pagination-btn" :disabled="parkingCurrentPage === parkingTotalPages" @click="parkingCurrentPage++">Next</button>
              </div>
              <div class="pagination-size">
                <select v-model.number="parkingPageSize" class="page-size-select" @change="parkingCurrentPage = 1">
                  <option :value="10">10 / page</option>
                  <option :value="20">20 / page</option>
                  <option :value="50">50 / page</option>
                  <option :value="100">100 / page</option>
                </select>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Time Periods" name="timePeriods">
          <div class="table-card">
            <el-table :data="paginatedTimePeriodsData" height="100%" border stripe table-layout="auto" style="width: 100%">
              <el-table-column
                type="index"
                label="#"
                width="70"
                align="center"
                header-align="center"
                fixed="left"
                :index="getTimePeriodsRowIndex"
              />
              <el-table-column prop="period" label="Period" min-width="120" />
              <el-table-column prop="startTime" label="Start Time" min-width="140" />
              <el-table-column prop="endTime" label="End Time" min-width="140" />
              <el-table-column label="Actions" width="160" fixed="right" class-name="actions-col">
                <template #default="{ row }">
                  <div class="actions-cell">
                    <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
                    <el-button size="small" class="action-btn action-delete" @click="handleDelete(row)">Delete</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ timePeriodsStartIndex + 1 }}-{{ timePeriodsEndIndex }} of {{ timePeriodsList.length }} records
              </div>
              <div class="pagination-controls">
                <button class="pagination-btn" :disabled="timePeriodsCurrentPage === 1" @click="timePeriodsCurrentPage--">Previous</button>
                <button
                  v-for="page in timePeriodsVisiblePages"
                  :key="page"
                  :class="['pagination-btn', 'page-number', { active: page === timePeriodsCurrentPage }]"
                  @click="timePeriodsCurrentPage = page"
                >
                  {{ page }}
                </button>
                <button class="pagination-btn" :disabled="timePeriodsCurrentPage === timePeriodsTotalPages" @click="timePeriodsCurrentPage++">Next</button>
              </div>
              <div class="pagination-size">
                <select v-model.number="timePeriodsPageSize" class="page-size-select" @change="timePeriodsCurrentPage = 1">
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
      v-model="showForm"
      :title="getFormTitle"
      max-width="500px"
    >
      <el-form :model="formData" label-width="120px">
        <template v-if="activeTab === 'parking'">
          <el-form-item label="Slot Number">
            <el-input v-model="formData.slotNumber" />
          </el-form-item>
          <el-form-item label="Location">
            <el-input v-model="formData.location" />
          </el-form-item>
          <el-form-item label="Space">
            <el-input v-model="formData.space" />
          </el-form-item>
          <el-form-item label="Quantity">
            <el-input-number v-model="formData.quantity" :min="1" :max="100" style="width: 100%" />
          </el-form-item>
          <el-form-item label="Status">
            <el-switch v-model="formData.status" active-value="active" inactive-value="inactive" />
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="Period">
            <el-input v-model="formData.period" placeholder="e.g., AM, PM, Night" />
          </el-form-item>
          <el-form-item label="Start Time">
            <el-time-picker
              v-model="formData.startTime"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="End Time">
            <el-time-picker
              v-model="formData.endTime"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="Status">
            <el-switch v-model="formData.status" active-value="active" inactive-value="inactive" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showForm = false">Cancel</el-button>
        <el-button type="default" class="submit-btn" @click="handleSave">Save</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showDeleteDialog" title="Confirm Delete" max-width="450px">
      <p>Are you sure you want to delete this {{ activeTab === 'parking' ? 'EV' : 'time period' }}?</p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showDeleteDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmDelete">Delete</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { getMockEVParkingList, getMockEVTimePeriods } from '@/mocks/mockData'

const activeTab = ref('parking')
const parkingList = ref(getMockEVParkingList())
const timePeriodsList = ref(getMockEVTimePeriods())

// Parking pagination
const parkingCurrentPage = ref(1)
const parkingPageSize = ref(10)

const paginatedParkingData = computed(() => {
  const start = (parkingCurrentPage.value - 1) * parkingPageSize.value
  const end = start + parkingPageSize.value
  return parkingList.value.slice(start, end)
})

const parkingTotalPages = computed(() => Math.max(1, Math.ceil(parkingList.value.length / parkingPageSize.value)))
const parkingStartIndex = computed(() => (parkingCurrentPage.value - 1) * parkingPageSize.value)
const parkingEndIndex = computed(() => Math.min(parkingStartIndex.value + parkingPageSize.value, parkingList.value.length))
const parkingVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, parkingCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(parkingTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Time Periods pagination
const timePeriodsCurrentPage = ref(1)
const timePeriodsPageSize = ref(10)

const paginatedTimePeriodsData = computed(() => {
  const start = (timePeriodsCurrentPage.value - 1) * timePeriodsPageSize.value
  const end = start + timePeriodsPageSize.value
  return timePeriodsList.value.slice(start, end)
})

const timePeriodsTotalPages = computed(() => Math.max(1, Math.ceil(timePeriodsList.value.length / timePeriodsPageSize.value)))
const timePeriodsStartIndex = computed(() => (timePeriodsCurrentPage.value - 1) * timePeriodsPageSize.value)
const timePeriodsEndIndex = computed(() => Math.min(timePeriodsStartIndex.value + timePeriodsPageSize.value, timePeriodsList.value.length))
const timePeriodsVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, timePeriodsCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(timePeriodsTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showForm = ref(false)
const formMode = ref('add')
const formData = ref({
  slotNumber: '',
  location: '',
  space: '',
  quantity: 1,
  period: '',
  startTime: '',
  endTime: '',
  status: 'active'
})

const showDeleteDialog = ref(false)
const currentRow = ref(null)

const getFormTitle = computed(() => {
  if (activeTab.value === 'parking') {
    return formMode.value === 'add' ? 'Add EV' : 'Edit EV'
  } else {
    return formMode.value === 'add' ? 'Add Time Period' : 'Edit Time Period'
  }
})

const getParkingRowIndex = (index) => (parkingCurrentPage.value - 1) * parkingPageSize.value + index + 1
const getTimePeriodsRowIndex = (index) => (timePeriodsCurrentPage.value - 1) * timePeriodsPageSize.value + index + 1

const handleExport = () => {
  if (activeTab.value === 'parking') {
    const exportData = parkingList.value.map(item => ({
      'Slot Number': item.slotNumber,
      'Location': item.location,
      'Space': item.space,
      'Quantity': item.quantity,
      'Status': item.status === 'active' ? 'Active' : 'Inactive'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'EV Parking')
    XLSX.writeFile(wb, `EV_Parking_${new Date().toISOString().split('T')[0]}.xlsx`)
  } else {
    const exportData = timePeriodsList.value.map(item => ({
      'Period': item.period,
      'Start Time': item.startTime,
      'End Time': item.endTime,
      'Status': item.status === 'active' ? 'Active' : 'Inactive'
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Time Periods')
    XLSX.writeFile(wb, `EV_Time_Periods_${new Date().toISOString().split('T')[0]}.xlsx`)
  }
  ElMessage.success('Excel file exported successfully')
}

const handleAdd = () => {
  formMode.value = 'add'
  if (activeTab.value === 'parking') {
    formData.value = { slotNumber: '', location: '', space: '', quantity: 1, status: 'active' }
  } else {
    formData.value = { period: '', startTime: '', endTime: '', status: 'active' }
  }
  showForm.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  showForm.value = true
}

const handleSave = () => {
  if (activeTab.value === 'parking') {
    if (formMode.value === 'add') {
      parkingList.value.push({ ...formData.value, id: Date.now(), type: 'EV' })
      ElMessage.success('EV added successfully')
    } else {
      const index = parkingList.value.findIndex(item => item.id === formData.value.id)
      if (index !== -1) {
        parkingList.value[index] = { ...formData.value }
        ElMessage.success('EV updated successfully')
      }
    }
  } else {
    if (formMode.value === 'add') {
      timePeriodsList.value.push({ ...formData.value, id: Date.now() })
      ElMessage.success('Time period added successfully')
    } else {
      const index = timePeriodsList.value.findIndex(item => item.id === formData.value.id)
      if (index !== -1) {
        timePeriodsList.value[index] = { ...formData.value }
        ElMessage.success('Time period updated successfully')
      }
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  currentRow.value = row
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (activeTab.value === 'parking') {
    const index = parkingList.value.findIndex(item => item.id === currentRow.value.id)
    if (index !== -1) {
      parkingList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  } else {
    const index = timePeriodsList.value.findIndex(item => item.id === currentRow.value.id)
    if (index !== -1) {
      timePeriodsList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  }
  showDeleteDialog.value = false
  currentRow.value = null
}
</script>

<style scoped>
.page-container {
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
  position: relative;
  z-index: 1;
}

.page-header :deep(.el-button:hover) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-header :deep(.el-button:active) {
  transform: translateY(0);
}

.page-content :deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
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

.page-content :deep(.el-table__row:hover) {
  background: #f9fafb;
}

.page-content :deep(.el-table td) {
  padding: 0.5rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-content :deep(.el-button--small) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-content :deep(.el-button--small:hover) {
  transform: none;
  box-shadow: none;
}

.page-content :deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  border: none;
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

.page-content :deep(.el-table) {
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  font-size: 0.8125rem;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.3rem;
  height: 100%;
  min-height: 0;
  flex: 1;
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

.action-delete {
  background-color: #ef4444 !important;
}

.action-delete:hover {
  background-color: #dc2626 !important;
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
</style>
