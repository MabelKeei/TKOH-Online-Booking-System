<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Access Right Management</h2>
      <div class="header-actions">
        <el-button type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
        <el-button type="default" class="submit-btn" @click="handleAdd">
          <font-awesome-icon :icon="['fas', 'plus']" /> {{ activeTab === 'role' ? 'Add Role' : 'Add Department' }}
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Role" name="role">
          <div class="table-card">
      <el-table :data="paginatedData" height="100%" border stripe table-layout="auto" style="width: 100%">
        <el-table-column
          type="index"
          label="#"
          width="70"
          align="center"
          header-align="center"
          fixed="left"
          :index="getRoleRowIndex"
        />
        <el-table-column prop="roleName" label="Role Name" min-width="170" />
        <el-table-column prop="description" label="Description" min-width="240" />
        <el-table-column label="Venue Quota" min-width="150">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.venueQuota }} bookings/year</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="EV Quota" min-width="130">
          <template #default="{ row }">
            <el-tag type="success">{{ row.evQuota }} bookings/year</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="employeeCount" label="Users" min-width="120" />
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
          Showing {{ roleStartIndex + 1 }}-{{ roleEndIndex }} of {{ roleList.length }} records
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn" :disabled="roleCurrentPage === 1" @click="roleCurrentPage--">Previous</button>
          <button
            v-for="page in roleVisiblePages"
            :key="page"
            :class="['pagination-btn', 'page-number', { active: page === roleCurrentPage }]"
            @click="roleCurrentPage = page"
          >
            {{ page }}
          </button>
          <button class="pagination-btn" :disabled="roleCurrentPage === roleTotalPages" @click="roleCurrentPage++">Next</button>
        </div>
        <div class="pagination-size">
          <select v-model.number="rolePageSize" class="page-size-select" @change="roleCurrentPage = 1">
            <option :value="10">10 / page</option>
            <option :value="20">20 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
          </select>
        </div>
      </div>
      </div>
        </el-tab-pane>

        <el-tab-pane label="Department" name="department">
          <div class="table-card">
      <el-table :data="paginatedDepartmentData" height="100%" border stripe table-layout="auto" style="width: 100%">
        <el-table-column
          type="index"
          label="#"
          width="70"
          align="center"
          header-align="center"
          fixed="left"
          :index="getDepartmentRowIndex"
        />
        <el-table-column prop="departmentName" label="Department Name" min-width="200" />
        <el-table-column prop="description" label="Description" min-width="280" />
        <el-table-column prop="employeeCount" label="Users" min-width="120" />
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
          Showing {{ departmentStartIndex + 1 }}-{{ departmentEndIndex }} of {{ departmentList.length }} records
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn" :disabled="departmentCurrentPage === 1" @click="departmentCurrentPage--">Previous</button>
          <button
            v-for="page in departmentVisiblePages"
            :key="page"
            :class="['pagination-btn', 'page-number', { active: page === departmentCurrentPage }]"
            @click="departmentCurrentPage = page"
          >
            {{ page }}
          </button>
          <button class="pagination-btn" :disabled="departmentCurrentPage === departmentTotalPages" @click="departmentCurrentPage++">Next</button>
        </div>
        <div class="pagination-size">
          <select v-model.number="departmentPageSize" class="page-size-select" @change="departmentCurrentPage = 1">
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
      <el-form :model="formData" label-width="140px">
        <el-form-item :label="activeTab === 'role' ? 'Role Name' : 'Department Name'">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="Description">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <template v-if="activeTab === 'role'">
          <el-form-item label="Venue Quota">
            <el-input-number v-model="formData.venueQuota" :min="0" />
            <span style="margin-left: 10px; color: #666;">bookings per year</span>
          </el-form-item>
          <el-form-item label="EV Quota">
            <el-input-number v-model="formData.evQuota" :min="0" />
            <span style="margin-left: 10px; color: #666;">bookings per year</span>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showForm = false">Cancel</el-button>
        <el-button type="default" class="submit-btn" @click="handleSave">Save</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showDeleteDialog" title="Confirm Delete" max-width="450px">
      <p>Are you sure you want to delete this {{ activeTab === 'role' ? 'role' : 'department' }}?</p>
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
import { getMockAccessRoleList, getMockDepartmentList } from '@/mocks/mockData'

const activeTab = ref('role')

const roleList = ref(getMockAccessRoleList())

const departmentList = ref(getMockDepartmentList())

const roleCurrentPage = ref(1)
const rolePageSize = ref(10)
const departmentCurrentPage = ref(1)
const departmentPageSize = ref(10)

const paginatedData = computed(() => {
  const start = (roleCurrentPage.value - 1) * rolePageSize.value
  const end = start + rolePageSize.value
  return roleList.value.slice(start, end)
})

const roleTotalPages = computed(() => Math.max(1, Math.ceil(roleList.value.length / rolePageSize.value)))
const roleStartIndex = computed(() => (roleCurrentPage.value - 1) * rolePageSize.value)
const roleEndIndex = computed(() => Math.min(roleStartIndex.value + rolePageSize.value, roleList.value.length))
const roleVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, roleCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(roleTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedDepartmentData = computed(() => {
  const start = (departmentCurrentPage.value - 1) * departmentPageSize.value
  const end = start + departmentPageSize.value
  return departmentList.value.slice(start, end)
})

const departmentTotalPages = computed(() => Math.max(1, Math.ceil(departmentList.value.length / departmentPageSize.value)))
const departmentStartIndex = computed(() => (departmentCurrentPage.value - 1) * departmentPageSize.value)
const departmentEndIndex = computed(() => Math.min(departmentStartIndex.value + departmentPageSize.value, departmentList.value.length))
const departmentVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, departmentCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(departmentTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showForm = ref(false)
const formMode = ref('add')
const formData = ref({
  name: '',
  description: '',
  venueQuota: 30,
  evQuota: 60
})

const getFormTitle = computed(() => {
  if (activeTab.value === 'role') {
    return formMode.value === 'add' ? 'Add Role' : 'Edit Role'
  } else {
    return formMode.value === 'add' ? 'Add Department' : 'Edit Department'
  }
})

const showDeleteDialog = ref(false)
const currentRow = ref(null)

const getRoleRowIndex = (index) => (roleCurrentPage.value - 1) * rolePageSize.value + index + 1
const getDepartmentRowIndex = (index) => (departmentCurrentPage.value - 1) * departmentPageSize.value + index + 1

const handleExport = () => {
  if (activeTab.value === 'role') {
    const exportData = roleList.value.map(item => ({
      'Role Name': item.roleName,
      'Description': item.description,
      'Venue Quota': item.venueQuota,
      'EV Quota': item.evQuota,
      'User Count': item.employeeCount
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Roles')
    XLSX.writeFile(wb, `Role_Management_${new Date().toISOString().split('T')[0]}.xlsx`)
  } else {
    const exportData = departmentList.value.map(item => ({
      'Department Name': item.departmentName,
      'Description': item.description,
      'User Count': item.employeeCount
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Departments')
    XLSX.writeFile(wb, `Department_Management_${new Date().toISOString().split('T')[0]}.xlsx`)
  }
  ElMessage.success('Excel file exported successfully')
}

const handleAdd = () => {
  formMode.value = 'add'
  if (activeTab.value === 'role') {
    formData.value = { name: '', description: '', venueQuota: 30, evQuota: 60 }
  } else {
    formData.value = { name: '', description: '' }
  }
  showForm.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  if (activeTab.value === 'role') {
    formData.value = { ...row, name: row.roleName }
  } else {
    formData.value = { ...row, name: row.departmentName }
  }
  showForm.value = true
}

const handleSave = () => {
  if (activeTab.value === 'role') {
    if (formMode.value === 'add') {
      roleList.value.push({
        ...formData.value,
        id: Date.now(),
        roleName: formData.value.name,
        employeeCount: 0
      })
      ElMessage.success('Role added successfully')
    } else {
      const index = roleList.value.findIndex(item => item.id === formData.value.id)
      if (index !== -1) {
        roleList.value[index] = {
          ...formData.value,
          roleName: formData.value.name,
          employeeCount: roleList.value[index].employeeCount
        }
        ElMessage.success('Role updated successfully')
      }
    }
  } else {
    if (formMode.value === 'add') {
      departmentList.value.push({
        ...formData.value,
        id: Date.now(),
        departmentName: formData.value.name,
        employeeCount: 0
      })
      ElMessage.success('Department added successfully')
    } else {
      const index = departmentList.value.findIndex(item => item.id === formData.value.id)
      if (index !== -1) {
        departmentList.value[index] = {
          ...formData.value,
          departmentName: formData.value.name,
          employeeCount: departmentList.value[index].employeeCount
        }
        ElMessage.success('Department updated successfully')
      }
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  if (row.employeeCount > 0) {
    ElMessage.warning(`Cannot delete ${activeTab.value} with assigned employees`)
    return
  }
  currentRow.value = row
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (activeTab.value === 'role') {
    const index = roleList.value.findIndex(item => item.id === currentRow.value.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  } else {
    const index = departmentList.value.findIndex(item => item.id === currentRow.value.id)
    if (index !== -1) {
      departmentList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  }
  showDeleteDialog.value = false
  currentRow.value = null
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

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.5rem;
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
</style>
