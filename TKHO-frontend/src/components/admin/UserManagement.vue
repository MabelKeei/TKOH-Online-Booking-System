<template>
  <div class="page-container">
    <div class="page-content">
      <div class="toolbar">
        <div class="toolbar-left">
          <h3 class="toolbar-title">User Management</h3>
        </div>
        <div class="toolbar-right">
          <el-input
            v-model="currentSearch"
            placeholder="Search current table data"
            clearable
            class="toolbar-search"
          />
          <el-button @click="handleExport">
            <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <font-awesome-icon :icon="['fas', 'plus']" /> Add Employee
          </el-button>
          <el-button @click="showQRCode = true">
            <font-awesome-icon :icon="['fas', 'qrcode']" /> Registration QR Code
          </el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="Employee List" name="list">
          <div class="table-card">
            <div class="table-view">
              <div class="table-wrapper">
                <el-table :data="paginatedEmployeeData" height="100%" border stripe table-layout="auto" style="width: 100%">
                  <el-table-column
                    type="index"
                    label="#"
                    width="70"
                    align="center"
                    header-align="center"
                    fixed="left"
                    :index="getEmployeeRowIndex"
                  />
                  <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                  <el-table-column prop="name" label="Name" min-width="140" />
                  <el-table-column prop="department" label="Department" min-width="150" />
                  <el-table-column prop="position" label="Position" min-width="140" />
                  <el-table-column prop="email" label="Email" min-width="220" />
                  <el-table-column label="Annual Quota" min-width="130">
                    <template #default="{ row }">
                      {{ row.usedQuota }} / {{ row.annualQuota }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="Status" min-width="110">
                    <template #default="{ row }">
                      <span :class="['status-pill', `status-${row.status}`]">
                        {{ row.status === 'active' ? 'Active' : 'Inactive' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Actions" width="260" fixed="right" class-name="actions-col">
                    <template #default="{ row }">
                      <div class="actions-cell">
                        <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
                        <el-button size="small" class="action-btn action-reset" @click="handleResetQuota(row)">Reset</el-button>
                        <el-button size="small" class="action-btn action-delete" @click="handleDelete(row)">Delete</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ employeeStartIndex + 1 }}-{{ employeeEndIndex }} of {{ filteredEmployeeList.length }} records
              </div>
              <div class="pagination-controls">
                <button
                  class="pagination-btn"
                  :disabled="employeeCurrentPage === 1"
                  @click="employeeCurrentPage--"
                >
                  Previous
                </button>
                <button
                  v-for="page in employeeVisiblePages"
                  :key="page"
                  :class="['pagination-btn', 'page-number', { active: page === employeeCurrentPage }]"
                  @click="employeeCurrentPage = page"
                >
                  {{ page }}
                </button>
                <button
                  class="pagination-btn"
                  :disabled="employeeCurrentPage === employeeTotalPages"
                  @click="employeeCurrentPage++"
                >
                  Next
                </button>
              </div>
              <div class="pagination-size">
                <select v-model.number="employeePageSize" class="page-size-select" @change="employeeCurrentPage = 1">
                  <option :value="10">10 / page</option>
                  <option :value="20">20 / page</option>
                  <option :value="50">50 / page</option>
                  <option :value="100">100 / page</option>
                </select>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="pending">
          <template #label>
            <span>
              Pending Approval
              <el-badge :value="pendingList.length" :max="99" class="badge-item" />
            </span>
          </template>
          <div class="table-card">
            <div class="table-view">
              <div class="table-wrapper">
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
                  <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                  <el-table-column prop="name" label="Name" min-width="140" />
                  <el-table-column prop="department" label="Department" min-width="150" />
                  <el-table-column prop="position" label="Position" min-width="140" />
                  <el-table-column prop="email" label="Email" min-width="220" />
                  <el-table-column prop="submittedAt" label="Submitted At" min-width="180" />
                  <el-table-column label="Actions" width="220" fixed="right" class-name="actions-col">
                    <template #default="{ row }">
                      <div class="actions-cell">
                        <el-button size="small" class="action-btn action-approve" @click="handleApprove(row)">Approve</el-button>
                        <el-button size="small" class="action-btn action-delete" @click="handleReject(row)">Reject</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ pendingStartIndex + 1 }}-{{ pendingEndIndex }} of {{ filteredPendingList.length }} records
              </div>
              <div class="pagination-controls">
                <button
                  class="pagination-btn"
                  :disabled="pendingCurrentPage === 1"
                  @click="pendingCurrentPage--"
                >
                  Previous
                </button>
                <button
                  v-for="page in pendingVisiblePages"
                  :key="page"
                  :class="['pagination-btn', 'page-number', { active: page === pendingCurrentPage }]"
                  @click="pendingCurrentPage = page"
                >
                  {{ page }}
                </button>
                <button
                  class="pagination-btn"
                  :disabled="pendingCurrentPage === pendingTotalPages"
                  @click="pendingCurrentPage++"
                >
                  Next
                </button>
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
      </el-tabs>
    </div>

    <el-dialog
      v-model="showForm"
      :title="formMode === 'add' ? 'Add Employee' : 'Edit Employee'"
      width="600px"
    >
      <el-form :model="formData" label-width="140px">
        <el-form-item label="Corp ID">
          <el-input v-model="formData.corpId" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="Department">
          <el-input v-model="formData.department" />
        </el-form-item>
        <el-form-item label="Position">
          <el-input v-model="formData.position" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="formData.email" type="email" />
        </el-form-item>
        <el-form-item label="Annual Quota">
          <el-input-number v-model="formData.annualQuota" :min="0" />
        </el-form-item>
        <el-form-item label="Status">
          <el-switch v-model="formData.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showForm = false">Cancel</el-button>
        <el-button type="primary" @click="handleSave">Save</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showQRCode" title="Employee Registration QR Code" width="400px">
      <div style="text-align: center;">
        <div style="font-size: 120px; color: #00723a;">
          <font-awesome-icon :icon="['fas', 'qrcode']" />
        </div>
        <p style="margin-top: 1rem; color: #666;">Scan to register as new employee</p>
        <p style="font-size: 12px; color: #999;">{{ registrationUrl }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

const activeTab = ref('list')

const employeeList = ref([
  { id: 1, corpId: 'E001', name: 'John Doe', department: 'IT', position: 'Manager', email: 'john@tkoh.com', annualQuota: 50, usedQuota: 12, status: 'active' },
  { id: 2, corpId: 'E002', name: 'Jane Smith', department: 'HR', position: 'Staff', email: 'jane@tkoh.com', annualQuota: 30, usedQuota: 5, status: 'active' },
  { id: 3, corpId: 'E003', name: 'Michael Tan', department: 'Finance', position: 'Senior Staff', email: 'michael.tan@tkoh.com', annualQuota: 40, usedQuota: 9, status: 'active' },
  { id: 4, corpId: 'E004', name: 'Emily Wong', department: 'Operations', position: 'Staff', email: 'emily.wong@tkoh.com', annualQuota: 30, usedQuota: 3, status: 'active' },
  { id: 5, corpId: 'E005', name: 'Daniel Lee', department: 'IT', position: 'Engineer', email: 'daniel.lee@tkoh.com', annualQuota: 35, usedQuota: 14, status: 'active' },
  { id: 6, corpId: 'E006', name: 'Olivia Chan', department: 'Admin', position: 'Assistant', email: 'olivia.chan@tkoh.com', annualQuota: 25, usedQuota: 2, status: 'active' },
  { id: 7, corpId: 'E007', name: 'Ryan Lim', department: 'Logistics', position: 'Coordinator', email: 'ryan.lim@tkoh.com', annualQuota: 30, usedQuota: 7, status: 'active' },
  { id: 8, corpId: 'E008', name: 'Sophia Ng', department: 'HR', position: 'Executive', email: 'sophia.ng@tkoh.com', annualQuota: 30, usedQuota: 11, status: 'active' },
  { id: 9, corpId: 'E009', name: 'Kevin Ho', department: 'Sales', position: 'Staff', email: 'kevin.ho@tkoh.com', annualQuota: 30, usedQuota: 6, status: 'active' },
  { id: 10, corpId: 'E010', name: 'Grace Low', department: 'Marketing', position: 'Executive', email: 'grace.low@tkoh.com', annualQuota: 35, usedQuota: 15, status: 'active' },
  { id: 11, corpId: 'E011', name: 'Jason Chua', department: 'IT', position: 'Analyst', email: 'jason.chua@tkoh.com', annualQuota: 35, usedQuota: 8, status: 'active' },
  { id: 12, corpId: 'E012', name: 'Alicia Koh', department: 'Legal', position: 'Officer', email: 'alicia.koh@tkoh.com', annualQuota: 25, usedQuota: 4, status: 'active' },
  { id: 13, corpId: 'E013', name: 'Marcus Teo', department: 'Operations', position: 'Supervisor', email: 'marcus.teo@tkoh.com', annualQuota: 40, usedQuota: 18, status: 'active' },
  { id: 14, corpId: 'E014', name: 'Hannah Goh', department: 'Finance', position: 'Staff', email: 'hannah.goh@tkoh.com', annualQuota: 30, usedQuota: 10, status: 'active' },
  { id: 15, corpId: 'E015', name: 'Brandon Yap', department: 'Procurement', position: 'Officer', email: 'brandon.yap@tkoh.com', annualQuota: 30, usedQuota: 5, status: 'active' },
  { id: 16, corpId: 'E016', name: 'Natalie Sim', department: 'Admin', position: 'Manager', email: 'natalie.sim@tkoh.com', annualQuota: 45, usedQuota: 13, status: 'active' },
  { id: 17, corpId: 'E017', name: 'Darren Ang', department: 'Security', position: 'Lead', email: 'darren.ang@tkoh.com', annualQuota: 25, usedQuota: 1, status: 'active' },
  { id: 18, corpId: 'E018', name: 'Chloe Tan', department: 'Customer Service', position: 'Staff', email: 'chloe.tan@tkoh.com', annualQuota: 30, usedQuota: 12, status: 'active' },
  { id: 19, corpId: 'E019', name: 'Samuel Neo', department: 'Warehouse', position: 'Coordinator', email: 'samuel.neo@tkoh.com', annualQuota: 30, usedQuota: 7, status: 'inactive' },
  { id: 20, corpId: 'E020', name: 'Ivy Cheong', department: 'Marketing', position: 'Staff', email: 'ivy.cheong@tkoh.com', annualQuota: 30, usedQuota: 9, status: 'active' },
  { id: 21, corpId: 'E021', name: 'Leonard Fong', department: 'Sales', position: 'Manager', email: 'leonard.fong@tkoh.com', annualQuota: 50, usedQuota: 20, status: 'active' },
  { id: 22, corpId: 'E022', name: 'Vanessa Liew', department: 'IT', position: 'Support', email: 'vanessa.liew@tkoh.com', annualQuota: 30, usedQuota: 6, status: 'inactive' }
])

const pendingList = ref([
  { id: 101, corpId: 'E003', name: 'Bob Wilson', department: 'Finance', position: 'Staff', email: 'bob@tkoh.com', submittedAt: '2026-03-20 10:30' }
])

const employeeCurrentPage = ref(1)
const employeePageSize = ref(10)
const pendingCurrentPage = ref(1)
const pendingPageSize = ref(10)
const employeeSearch = ref('')
const pendingSearch = ref('')

const filteredEmployeeList = computed(() => {
  const keyword = employeeSearch.value.trim().toLowerCase()
  if (!keyword) return employeeList.value
  return employeeList.value.filter(item =>
    String(item.corpId).toLowerCase().includes(keyword) ||
    String(item.name).toLowerCase().includes(keyword) ||
    String(item.department).toLowerCase().includes(keyword) ||
    String(item.email).toLowerCase().includes(keyword)
  )
})

const filteredPendingList = computed(() => {
  const keyword = pendingSearch.value.trim().toLowerCase()
  if (!keyword) return pendingList.value
  return pendingList.value.filter(item =>
    String(item.corpId).toLowerCase().includes(keyword) ||
    String(item.name).toLowerCase().includes(keyword) ||
    String(item.department).toLowerCase().includes(keyword) ||
    String(item.email).toLowerCase().includes(keyword)
  )
})

const currentSearch = computed({
  get: () => (activeTab.value === 'list' ? employeeSearch.value : pendingSearch.value),
  set: (value) => {
    if (activeTab.value === 'list') {
      employeeSearch.value = value
      employeeCurrentPage.value = 1
    } else {
      pendingSearch.value = value
      pendingCurrentPage.value = 1
    }
  }
})

const paginatedEmployeeData = computed(() => {
  const start = (employeeCurrentPage.value - 1) * employeePageSize.value
  const end = start + employeePageSize.value
  return filteredEmployeeList.value.slice(start, end)
})

const employeeTotalPages = computed(() => Math.max(1, Math.ceil(filteredEmployeeList.value.length / employeePageSize.value)))
const employeeStartIndex = computed(() => (employeeCurrentPage.value - 1) * employeePageSize.value)
const employeeEndIndex = computed(() => Math.min(employeeStartIndex.value + employeePageSize.value, filteredEmployeeList.value.length))
const employeeVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, employeeCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(employeeTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

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
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch([employeeTotalPages, pendingTotalPages], () => {
  if (employeeCurrentPage.value > employeeTotalPages.value) {
    employeeCurrentPage.value = employeeTotalPages.value
  }
  if (pendingCurrentPage.value > pendingTotalPages.value) {
    pendingCurrentPage.value = pendingTotalPages.value
  }
})

const showForm = ref(false)
const showQRCode = ref(false)
const formMode = ref('add')
const formData = ref({
  corpId: '',
  name: '',
  department: '',
  position: '',
  email: '',
  annualQuota: 30,
  usedQuota: 0,
  status: 'active'
})

const registrationUrl = ref('https://tkoh.com/register?token=abc123')

const getEmployeeRowIndex = (index) => {
  return (employeeCurrentPage.value - 1) * employeePageSize.value + index + 1
}

const getPendingRowIndex = (index) => {
  return (pendingCurrentPage.value - 1) * pendingPageSize.value + index + 1
}

const handleExport = () => {
  const exportData = employeeList.value.map(item => ({
    'Corp ID': item.corpId,
    'Name': item.name,
    'Department': item.department,
    'Position': item.position,
    'Email': item.email,
    'Annual Quota': item.annualQuota,
    'Used Quota': item.usedQuota,
    'Status': item.status === 'active' ? 'Active' : 'Inactive'
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Employees')
  XLSX.writeFile(wb, `Employee_Management_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('Excel file exported successfully')
}

const handleAdd = () => {
  formMode.value = 'add'
  formData.value = { corpId: '', name: '', department: '', position: '', email: '', annualQuota: 30, usedQuota: 0, status: 'active' }
  showForm.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  showForm.value = true
}

const handleSave = () => {
  if (formMode.value === 'add') {
    employeeList.value.push({ ...formData.value, id: Date.now() })
    ElMessage.success('Employee added successfully')
  } else {
    const index = employeeList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      employeeList.value[index] = { ...formData.value }
      ElMessage.success('Employee updated successfully')
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  ElMessageBox.confirm('Are you sure to delete this employee?', 'Warning', {
    type: 'warning'
  }).then(() => {
    const index = employeeList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      employeeList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  })
}

const handleResetQuota = (row) => {
  ElMessageBox.confirm('Reset annual quota for this employee?', 'Confirm', {
    type: 'warning'
  }).then(() => {
    row.usedQuota = 0
    ElMessage.success('Quota reset successfully')
  })
}

const handleApprove = (row) => {
  ElMessageBox.confirm('Approve this registration and create account?', 'Confirm', {
    type: 'success'
  }).then(() => {
    employeeList.value.push({ ...row, id: Date.now(), annualQuota: 30, usedQuota: 0, status: 'active' })
    const index = pendingList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      pendingList.value.splice(index, 1)
    }
    ElMessage.success('Account created successfully')
  })
}

const handleReject = (row) => {
  ElMessageBox.confirm('Reject this registration?', 'Confirm', {
    type: 'warning'
  }).then(() => {
    const index = pendingList.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      pendingList.value.splice(index, 1)
      ElMessage.success('Registration rejected')
    }
  })
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

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.toolbar {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.3rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.toolbar-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.toolbar-search {
  width: min(460px, 48vw);
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

.page-content :deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

.table-view {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
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

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-pill.status-inactive {
  background: #fee2e2;
  color: #991b1b;
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

.action-btn :deep(span) {
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

.action-edit {
  background-color: #f97316 !important;
}

.action-edit:hover {
  background-color: #ea580c !important;
}

.action-reset {
  background-color: #3b82f6 !important;
}

.action-reset:hover {
  background-color: #2563eb !important;
}

.action-delete {
  background-color: #ef4444 !important;
}

.action-delete:hover {
  background-color: #dc2626 !important;
}

.badge-item {
  margin-left: 8px;
}

.badge-item :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: 2px solid #ffffff;
  font-weight: 600;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding: 0.7rem 0.5rem 0rem;
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
}
</style>
