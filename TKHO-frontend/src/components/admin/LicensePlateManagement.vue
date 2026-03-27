<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">License Plate Management</h2>
      <div class="header-actions">
        <el-button type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
        <el-button type="default" class="submit-btn" @click="handleAdd">
          <font-awesome-icon :icon="['fas', 'plus']" /> Add License Plate
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <div class="table-card">
        <el-table :data="paginatedData" height="100%" border stripe table-layout="auto" style="width: 100%">
          <el-table-column
            type="index"
            label="#"
            width="70"
            align="center"
            header-align="center"
            fixed="left"
            :index="getRowIndex"
          />
          <el-table-column prop="plateNumber" label="Plate Number" min-width="170" />
          <el-table-column prop="brand" label="Brand" min-width="150" />
          <el-table-column prop="type" label="Type" min-width="140">
            <template #default="{ row }">
              <el-tag
                effect="light"
                :class="row.type === 'company' ? 'plate-type-tag plate-type-company' : 'plate-type-tag plate-type-personal'"
              >
                {{ row.type === 'company' ? 'Company' : 'Personal' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="owner" label="Owner" min-width="200">
            <template #default="{ row }">
              {{ row.owner }} ({{ row.corpId }})
            </template>
          </el-table-column>
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
            Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ licensePlateList.length }} records
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">Previous</button>
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['pagination-btn', 'page-number', { active: page === currentPage }]"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
          </div>
          <div class="pagination-size">
            <select v-model.number="pageSize" class="page-size-select" @change="currentPage = 1">
              <option :value="10">10 / page</option>
              <option :value="20">20 / page</option>
              <option :value="50">50 / page</option>
              <option :value="100">100 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <BookingStyleModal
      v-model="showForm"
      :title="formMode === 'add' ? 'Add License Plate' : 'Edit License Plate'"
      max-width="520px"
    >
      <el-form :model="formData" label-width="140px">
        <el-form-item label="Owner">
          <el-select
            v-model="formData.owner"
            filterable
            allow-create
            default-first-option
            style="width: 100%"
            placeholder="Type to search or enter owner name"
            :teleported="false"
            popper-class="license-plate-owner-select"
          >
            <el-option
              v-for="user in employeeOptions"
              :key="user.corpId"
              :label="`${user.name} (${user.corpId})`"
              :value="user.name"
            >
              <span>{{ user.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ user.corpId }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Type">
          <el-select
            v-model="formData.type"
            style="width: 100%"
            placeholder="Select type"
            :teleported="false"
            popper-class="license-plate-type-select"
          >
            <el-option label="Personal" value="personal" />
            <el-option label="Company" value="company" />
          </el-select>
        </el-form-item>
        <el-form-item label="Plate Number">
          <el-input v-model="formData.plateNumber" />
        </el-form-item>
        <el-form-item label="Brand">
          <el-input v-model="formData.brand" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showForm = false">Cancel</el-button>
        <el-button type="default" class="submit-btn" @click="handleSave">Save</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showDeleteDialog" title="Confirm Delete" max-width="450px">
      <p>Are you sure you want to delete this license plate?</p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showDeleteDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmDelete">Delete</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { getMockLicensePlateList, getMockEmployeeListNormalized } from '@/mocks/mockData'

const licensePlateList = ref(getMockLicensePlateList())
const employeeList = ref(getMockEmployeeListNormalized())

const employeeOptions = computed(() => {
  return employeeList.value.filter(u => u.status === 'active')
})

const currentPage = ref(1)
const pageSize = ref(10)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return licensePlateList.value.slice(start, end)
})

const totalPages = computed(() => Math.max(1, Math.ceil(licensePlateList.value.length / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, licensePlateList.value.length))
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showForm = ref(false)
const formMode = ref('add')
const formData = ref({
  corpId: '',
  owner: '',
  brand: '',
  type: 'personal',
  plateNumber: ''
})

const showDeleteDialog = ref(false)
const currentRow = ref(null)

const getRowIndex = (index) => (currentPage.value - 1) * pageSize.value + index + 1

const handleExport = () => {
  const exportData = licensePlateList.value.map(item => ({
    'Corp ID': item.corpId,
    'Plate Number': item.plateNumber,
    'Brand': item.brand ?? '',
    'Owner': item.owner,
    'Type': item.type === 'company' ? 'Company' : 'Personal'
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'License Plates')
  XLSX.writeFile(wb, `License_Plates_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('Excel file exported successfully')
}

const handleAdd = () => {
  formMode.value = 'add'
  formData.value = { corpId: '', owner: '', brand: '', type: 'personal', plateNumber: '' }
  showForm.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  showForm.value = true
}

const handleSave = () => {
  // Auto-fill corpId based on selected owner from employee list
  const matchedEmployee = employeeList.value.find(u => u.name === formData.value.owner)
  const corpId = matchedEmployee ? matchedEmployee.corpId : ''

  if (formMode.value === 'add') {
    licensePlateList.value.push({ ...formData.value, corpId, id: Date.now() })
    ElMessage.success('License plate added successfully')
  } else {
    const index = licensePlateList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      licensePlateList.value[index] = { ...formData.value, corpId }
      ElMessage.success('License plate updated successfully')
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  currentRow.value = row
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  const index = licensePlateList.value.findIndex(item => item.id === currentRow.value.id)
  if (index !== -1) {
    licensePlateList.value.splice(index, 1)
    ElMessage.success('Deleted successfully')
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

.page-content :deep(.plate-type-tag) {
  border-radius: 999px;
  font-weight: 600;
  padding: 0 10px;
}

.page-content :deep(.plate-type-company) {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.page-content :deep(.plate-type-personal) {
  background-color: #fef3c7;
  color: #92400e;
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

.license-plate-owner-select {
  max-height: 150px;
}

.license-plate-type-select {
  max-height: 100px;
}
</style>
