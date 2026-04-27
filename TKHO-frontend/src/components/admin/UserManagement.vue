<template>
  <div class="page-container">
    <div class="page-header">
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
        <el-button type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
        <el-button type="default" class="submit-btn" @click="handleAdd">
          <font-awesome-icon :icon="['fas', 'plus']" /> Add User
        </el-button>
        <el-button type="default" class="cancel-btn" @click="showQRCode = true">
          <font-awesome-icon :icon="['fas', 'qrcode']" /> Registration QR Code
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="User List" name="list">
          <div class="table-card">
            <div class="table-view">
              <div class="table-wrapper">
                <el-table :data="paginatedUserData" height="100%" border stripe table-layout="auto" style="width: 100%">
                  <el-table-column
                    type="index"
                    label="#"
                    width="70"
                    align="center"
                    header-align="center"
                    fixed="left"
                    :index="getUserRowIndex"
                  />
                  <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                  <el-table-column prop="name" label="Name" min-width="140" />
                  <el-table-column prop="department" label="Department" min-width="150" />
                  <el-table-column prop="role" label="Role" min-width="140" />
                  <el-table-column prop="email" label="Email" min-width="220" />
                  <el-table-column label="EV Quota" min-width="165">
                    <template #default="{ row }">
                      {{ row.usedQuotaEV }} / {{ row.annualQuotaEV }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Venue Quota" min-width="110">
                    <template #default="{ row }">
                      {{ row.usedQuotaVenue }} / {{ row.annualQuotaVenue }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" label="Status" min-width="120">
                    <template #default="{ row }">
                      <span :class="['status-pill', `status-${row.status}`]">
                        {{ row.status === 'active' ? 'Active' : row.status === 'inactive' ? 'Inactive' : 'Expired' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastLoginTime" label="Last login time" min-width="180">
                    <template #default="{ row }">
                      {{ row.lastLoginTime || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Actions" width="230" fixed="right" class-name="actions-col">
                    <template #default="{ row }">
                      <div class="actions-cell">
                        <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
                        <el-button size="small" class="action-btn action-inactivate" @click="handleInactivate(row)">Inactive</el-button>
                        <el-tooltip content="Reset annual quota" placement="top">
                          <el-button size="small" class="action-btn action-reset" @click="handleResetQuota(row)">Reset</el-button>
                        </el-tooltip>
                        <el-button size="small" class="action-btn action-delete" @click="handleDelete(row)">Delete</el-button>
                        <el-tooltip content="Reset Password" placement="top">
                          <el-button size="small" class="action-btn action-reset-password" @click="handleResetPassword(row)">
                            <font-awesome-icon :icon="['fas', 'key']" />
                          </el-button>
                        </el-tooltip>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ employeeStartIndex + 1 }}-{{ employeeEndIndex }} of {{ filteredUserList.length }} records
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

        <el-tab-pane name="expired">
          <template #label>
            <span>
              Expired & Inactive
            </span>
          </template>
          <div class="table-card">
            <div class="table-view">
              <div class="table-wrapper">
                <el-table :data="paginatedExpiredData" height="100%" border stripe table-layout="auto" style="width: 100%">
                  <el-table-column
                    type="index"
                    label="#"
                    width="70"
                    align="center"
                    header-align="center"
                    fixed="left"
                    :index="getExpiredRowIndex"
                  />
                  <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                  <el-table-column prop="name" label="Name" min-width="140" />
                  <el-table-column prop="department" label="Department" min-width="150" />
                  <el-table-column prop="role" label="Role" min-width="140" />
                  <el-table-column prop="email" label="Email" min-width="220" />
                  <el-table-column prop="status" label="Status" min-width="120">
                    <template #default="{ row }">
                      <span :class="['status-pill', `status-${row.status}`]">
                        {{ row.status === 'expired' ? 'Expired' : 'Inactive' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastLoginTime" label="Last login time" min-width="180">
                    <template #default="{ row }">
                      {{ row.lastLoginTime || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column label="EV Quota" min-width="165">
                    <template #default="{ row }">
                      {{ row.usedQuotaEV }} / {{ row.annualQuotaEV }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Venue Quota" min-width="110">
                    <template #default="{ row }">
                      {{ row.usedQuotaVenue }} / {{ row.annualQuotaVenue }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Actions" width="230" fixed="right" class-name="actions-col">
                    <template #default="{ row }">
                      <div class="actions-cell">
                        <el-button size="small" class="action-btn action-activate" @click="handleActivate(row)">Activate</el-button>
                        <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
                        <el-button size="small" class="action-btn action-delete" @click="handleDelete(row)">Delete</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ expiredStartIndex + 1 }}-{{ expiredEndIndex }} of {{ filteredExpiredList.length }} records
              </div>
              <div class="pagination-controls">
                <button
                  class="pagination-btn"
                  :disabled="expiredCurrentPage === 1"
                  @click="expiredCurrentPage--"
                >
                  Previous
                </button>
                <button
                  v-for="page in expiredVisiblePages"
                  :key="page"
                  :class="['pagination-btn', 'page-number', { active: page === expiredCurrentPage }]"
                  @click="expiredCurrentPage = page"
                >
                  {{ page }}
                </button>
                <button
                  class="pagination-btn"
                  :disabled="expiredCurrentPage === expiredTotalPages"
                  @click="expiredCurrentPage++"
                >
                  Next
                </button>
              </div>
              <div class="pagination-size">
                <select v-model.number="expiredPageSize" class="page-size-select" @change="expiredCurrentPage = 1">
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
              <el-badge :value="pendingPendingList.length" :max="99" class="badge-item" />
            </span>
          </template>

          <el-tabs v-model="pendingSubTab" class="sub-tabs">
            <el-tab-pane label="Pending" name="pending">
              <div class="table-card">
                <div class="table-view">
                  <div class="table-wrapper">
                    <el-table :data="paginatedPendingPendingData" height="100%" border stripe table-layout="auto" style="width: 100%">
                      <el-table-column
                        type="index"
                        label="#"
                        width="70"
                        align="center"
                        header-align="center"
                        fixed="left"
                        :index="getPendingPendingRowIndex"
                      />
                      <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                      <el-table-column prop="name" label="Name" min-width="140" />
                      <el-table-column prop="department" label="Department" min-width="150" />
                      <el-table-column prop="role" label="Role" min-width="140" />
                      <el-table-column prop="email" label="Email" min-width="220" />
                      <el-table-column prop="lastLoginTime" label="Last login time" min-width="180">
                        <template #default="{ row }">
                          {{ row.lastLoginTime || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="reason" label="Application Reason" min-width="240" />
                      <el-table-column prop="submittedAt" label="Submitted At" min-width="180" />
                      <el-table-column label="Actions" width="120" fixed="right" class-name="actions-col">
                        <template #default="{ row }">
                          <div class="actions-cell">
                            <el-button size="small" class="action-btn action-edit" @click="handlePending(row)">Handle</el-button>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
                <div class="pagination-bar">
                  <div class="pagination-info">
                    Showing {{ pendingPendingStartIndex + 1 }}-{{ pendingPendingEndIndex }} of {{ pendingPendingList.length }} records
                  </div>
                  <div class="pagination-controls">
                    <button class="pagination-btn" :disabled="pendingPendingCurrentPage === 1" @click="pendingPendingCurrentPage--">Previous</button>
                    <button
                      v-for="page in pendingPendingVisiblePages"
                      :key="page"
                      :class="['pagination-btn', 'page-number', { active: page === pendingPendingCurrentPage }]"
                      @click="pendingPendingCurrentPage = page"
                    >
                      {{ page }}
                    </button>
                    <button class="pagination-btn" :disabled="pendingPendingCurrentPage === pendingPendingTotalPages" @click="pendingPendingCurrentPage++">Next</button>
                  </div>
                  <div class="pagination-size">
                    <select v-model.number="pendingPendingPageSize" class="page-size-select" @change="pendingPendingCurrentPage = 1">
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
                <div class="table-view">
                  <div class="table-wrapper">
                    <el-table :data="paginatedPendingApprovedData" height="100%" border stripe table-layout="auto" style="width: 100%">
                      <el-table-column
                        type="index"
                        label="#"
                        width="70"
                        align="center"
                        header-align="center"
                        fixed="left"
                        :index="getPendingApprovedRowIndex"
                      />
                      <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                      <el-table-column prop="name" label="Name" min-width="140" />
                      <el-table-column prop="department" label="Department" min-width="150" />
                      <el-table-column prop="role" label="Role" min-width="140" />
                      <el-table-column prop="email" label="Email" min-width="220" />
                      <el-table-column prop="lastLoginTime" label="Last login time" min-width="180">
                        <template #default="{ row }">
                          {{ row.lastLoginTime || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="approvedAt" label="Approved At" min-width="180" />
                      <el-table-column prop="approvedBy" label="Approved By" min-width="140" />
                    </el-table>
                  </div>
                </div>
                <div class="pagination-bar">
                  <div class="pagination-info">
                    Showing {{ pendingApprovedStartIndex + 1 }}-{{ pendingApprovedEndIndex }} of {{ pendingApprovedList.length }} records
                  </div>
                  <div class="pagination-controls">
                    <button class="pagination-btn" :disabled="pendingApprovedCurrentPage === 1" @click="pendingApprovedCurrentPage--">Previous</button>
                    <button
                      v-for="page in pendingApprovedVisiblePages"
                      :key="page"
                      :class="['pagination-btn', 'page-number', { active: page === pendingApprovedCurrentPage }]"
                      @click="pendingApprovedCurrentPage = page"
                    >
                      {{ page }}
                    </button>
                    <button class="pagination-btn" :disabled="pendingApprovedCurrentPage === pendingApprovedTotalPages" @click="pendingApprovedCurrentPage++">Next</button>
                  </div>
                  <div class="pagination-size">
                    <select v-model.number="pendingApprovedPageSize" class="page-size-select" @change="pendingApprovedCurrentPage = 1">
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
                <div class="table-view">
                  <div class="table-wrapper">
                    <el-table :data="paginatedPendingRejectedData" height="100%" border stripe table-layout="auto" style="width: 100%">
                      <el-table-column
                        type="index"
                        label="#"
                        width="70"
                        align="center"
                        header-align="center"
                        fixed="left"
                        :index="getPendingRejectedRowIndex"
                      />
                      <el-table-column prop="corpId" label="Corp ID" min-width="120" />
                      <el-table-column prop="name" label="Name" min-width="140" />
                      <el-table-column prop="department" label="Department" min-width="150" />
                      <el-table-column prop="role" label="Role" min-width="140" />
                      <el-table-column prop="email" label="Email" min-width="220" />
                      <el-table-column prop="lastLoginTime" label="Last login time" min-width="180">
                        <template #default="{ row }">
                          {{ row.lastLoginTime || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="rejectedAt" label="Rejected At" min-width="180" />
                      <el-table-column prop="rejectedBy" label="Rejected By" min-width="140" />
                      <el-table-column prop="rejectReason" label="Reject Reason" min-width="240" />
                    </el-table>
                  </div>
                </div>
                <div class="pagination-bar">
                  <div class="pagination-info">
                    Showing {{ pendingRejectedStartIndex + 1 }}-{{ pendingRejectedEndIndex }} of {{ pendingRejectedList.length }} records
                  </div>
                  <div class="pagination-controls">
                    <button class="pagination-btn" :disabled="pendingRejectedCurrentPage === 1" @click="pendingRejectedCurrentPage--">Previous</button>
                    <button
                      v-for="page in pendingRejectedVisiblePages"
                      :key="page"
                      :class="['pagination-btn', 'page-number', { active: page === pendingRejectedCurrentPage }]"
                      @click="pendingRejectedCurrentPage = page"
                    >
                      {{ page }}
                    </button>
                    <button class="pagination-btn" :disabled="pendingRejectedCurrentPage === pendingRejectedTotalPages" @click="pendingRejectedCurrentPage++">Next</button>
                  </div>
                  <div class="pagination-size">
                    <select v-model.number="pendingRejectedPageSize" class="page-size-select" @change="pendingRejectedCurrentPage = 1">
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
        </el-tab-pane>
      </el-tabs>
    </div>

    <BookingStyleModal
      v-model="showForm"
      :title="formMode === 'add' ? 'Add User' : 'Edit User'"
      max-width="600px"
      :max-height="userModalMaxHeight"
    >
      <el-form :model="formData" label-width="140px">
        <el-form-item label="Corp ID">
          <el-input v-model="formData.corpId" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="Department">
          <el-select
            v-model="formData.department"
            placeholder="Select department"
            style="width: 100%"
            :teleported="false"
          >
            <el-option v-for="dept in departmentOptions" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="Role">
          <el-select
            v-model="formData.role"
            placeholder="Select role"
            style="width: 100%"
            :teleported="false"
          >
            <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="formData.email" type="email" />
        </el-form-item>
        <el-form-item label="Initial Password">
          <el-input v-model="formData.password" type="text" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="EV Quota">
          <el-input-number v-model="formData.annualQuotaEV" :min="0" />
        </el-form-item>
        <el-form-item label="Venue Quota">
          <el-input-number v-model="formData.annualQuotaVenue" :min="0" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select
            v-model="formData.status"
            style="width: 100%"
            :teleported="false"
          >
            <el-option label="Active" value="active" />
            <el-option label="Inactive" value="inactive" />
            <el-option label="Expired" value="expired" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showForm = false">Cancel</el-button>
        <el-button type="default" class="submit-btn" @click="handleSave">Save</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showQRCode" title="User Registration QR Code" max-width="450px">
      <div style="text-align: center;">
        <canvas ref="qrCanvas" style="display: none;"></canvas>
        <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" style="width: 280px; height: 280px; margin: 0 auto;" alt="QR Code" />
        <div v-else style="font-size: 120px; color: #00723a;">
          <font-awesome-icon :icon="['fas', 'qrcode']" />
        </div>
        <p style="margin-top: 1rem; color: #666; font-size: 14px;">Scan to register as new user</p>
        <p style="font-size: 12px; color: #999; word-break: break-all; padding: 0 1rem;">{{ registrationUrl }}</p>
      </div>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showQRCode = false">Close</el-button>
        <el-button type="default" class="submit-btn" @click="downloadQRCode">
          <font-awesome-icon :icon="['fas', 'download']" /> Download QR Code
        </el-button>
      </template>
    </BookingStyleModal>

    <!-- Delete Confirmation Dialog -->
    <BookingStyleModal v-model="showDeleteDialog" title="Confirm Delete" max-width="450px">
      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Are you sure you want to delete this user?
      </p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showDeleteDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmDelete">Delete</el-button>
      </template>
    </BookingStyleModal>

    <!-- Reset Quota Confirmation Dialog -->
    <BookingStyleModal v-model="showResetDialog" title="Confirm Reset Quota" max-width="450px">
      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Reset annual quota for this user?
      </p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showResetDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-reset" @click="confirmReset">Reset</el-button>
      </template>
    </BookingStyleModal>

    <!-- Reset Password Confirmation Dialog -->
    <BookingStyleModal v-model="showResetPasswordDialog" title="Confirm Reset Password" max-width="450px">
      <p style="font-size: 15px; color: #374151; line-height: 1.6;">
        Reset password for this user?
      </p>
      <el-form :model="resetPasswordForm" label-width="140px" style="margin-top: 12px;">
        <el-form-item label="Password">
          <el-input v-model="resetPasswordForm.password" type="text" autocomplete="new-password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showResetPasswordDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-reset-password" @click="confirmResetPassword">Reset Password</el-button>
      </template>
    </BookingStyleModal>

    <!-- Pending Approval Handle Dialog -->
    <BookingStyleModal
      v-model="showPendingHandleDialog"
      title="Pending Approval Details"
      max-width="650px"
      :max-height="userModalMaxHeight"
    >
      <el-form :model="pendingHandleForm" label-width="140px">
        <el-form-item label="Corp ID">
          <el-input v-model="pendingHandleForm.corpId" />
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="pendingHandleForm.name" />
        </el-form-item>
        <el-form-item label="Department">
          <el-select
            v-model="pendingHandleForm.department"
            placeholder="Select department"
            style="width: 100%"
            :teleported="false"
          >
            <el-option v-for="dept in departmentOptions" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="Role">
          <el-input v-model="pendingHandleForm.role" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="pendingHandleForm.email" disabled />
        </el-form-item>
        <el-form-item label="Initial Password">
          <el-input v-model="pendingHandleForm.password" type="text" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="Submitted At">
          <el-input v-model="pendingHandleForm.submittedAt" />
        </el-form-item>
        <el-form-item label="Application Reason">
          <el-input
            v-model="pendingHandleForm.reason"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="Reject Template">
          <el-select
            v-model="pendingHandleForm.rejectTemplateKey"
            placeholder="Select reject template"
            style="width: 100%"
            :teleported="false"
            @change="handlePendingRejectTemplateChange"
          >
            <el-option
              v-for="tpl in rejectTemplateOptions"
              :key="tpl.id"
              :label="tpl.name"
              :value="tpl.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Reject Reason">
          <el-input
            v-model="pendingHandleForm.rejectReason"
            type="textarea"
            :rows="4"
            placeholder="Required only when rejecting"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          type="default"
          class="cancel-btn"
          @click="showPendingHandleDialog = false"
        >Cancel</el-button>
        <el-button
          type="default"
          class="action-btn action-approve"
          @click="confirmPendingApprove"
        >Approve</el-button>
        <el-button
          type="default"
          class="action-btn action-delete"
          @click="confirmPendingReject"
        >Reject</el-button>
      </template>
    </BookingStyleModal>

    <!-- Reject Reason Dialog -->
    <BookingStyleModal v-model="showRejectDialog" title="Reject Registration" max-width="500px">
      <el-form :model="rejectForm" label-width="120px">
        <el-form-item label="Template">
          <el-select
            v-model="rejectForm.templateKey"
            placeholder="Select reject template"
            style="width: 100%"
            :teleported="false"
            @change="handleUserRejectTemplateChange"
          >
            <el-option
              v-for="tpl in rejectTemplateOptions"
              :key="tpl.key"
              :label="tpl.name"
              :value="tpl.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Reject Reason">
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="Please provide a reason for rejection" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showRejectDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmReject">Confirm Reject</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { useAdminStore } from '@/stores/admin'
import {
  getMockEmployeeListNormalized,
  getMockPendingListNormalized,
  getMockAccessRoleList,
  getMockDepartmentList,
  getMockPromptList
} from '@/mocks/mockData'

const adminStore = useAdminStore()

const activeTab = ref('list')
const pendingSubTab = ref('pending')

const employeeList = ref([])

const pendingList = ref([])
const pendingApprovedList = ref([])
const pendingRejectedList = ref([])

const DEFAULT_PASSWORD = '123456'

const resetPasswordForm = ref({
  password: DEFAULT_PASSWORD
})

/** 14" 常见视口宽度约 1100–1599：Add/Edit/Handle 表单弹窗略增高 */
const USER_FORM_MODAL_MQ = '(min-width: 1100px) and (max-width: 1599px)'
const userModalMaxHeight = ref('94vh')

function updateUserModalMaxHeight () {
  if (typeof window === 'undefined') return
  userModalMaxHeight.value = window.matchMedia(USER_FORM_MODAL_MQ).matches ? '110vh' : '94vh'
}

let userFormModalMq = null

onMounted(() => {
  employeeList.value = getMockEmployeeListNormalized()
  pendingList.value = getMockPendingListNormalized()
  updateUserModalMaxHeight()
  userFormModalMq = window.matchMedia(USER_FORM_MODAL_MQ)
  userFormModalMq.addEventListener('change', updateUserModalMaxHeight)
})

onUnmounted(() => {
  if (userFormModalMq) {
    userFormModalMq.removeEventListener('change', updateUserModalMaxHeight)
  }
})

const employeeCurrentPage = ref(1)
const employeePageSize = ref(20)
const pendingPendingCurrentPage = ref(1)
const pendingPendingPageSize = ref(20)
const pendingApprovedCurrentPage = ref(1)
const pendingApprovedPageSize = ref(20)
const pendingRejectedCurrentPage = ref(1)
const pendingRejectedPageSize = ref(20)
const expiredCurrentPage = ref(1)
const expiredPageSize = ref(20)
const employeeSearch = ref('')
const expiredSearch = ref('')
const pendingSearch = ref('')

const expiredList = computed(() =>
  employeeList.value.filter((item) => item.status === 'expired' || item.status === 'inactive')
)

const roleOptions = computed(() => {
  const mockRoles = getMockAccessRoleList()
  return mockRoles.map(r => r.roleName)
})

const departmentOptions = computed(() => {
  const mockDepartments = getMockDepartmentList()
  return mockDepartments.map(d => d.departmentName)
})

const filteredUserList = computed(() => {
  const keyword = employeeSearch.value.trim().toLowerCase()
  const base = employeeList.value.filter((item) => item.status === 'active')
  if (!keyword) return base
  return base.filter(item =>
    String(item.corpId).toLowerCase().includes(keyword) ||
    String(item.name).toLowerCase().includes(keyword) ||
    String(item.department).toLowerCase().includes(keyword) ||
    String(item.email).toLowerCase().includes(keyword) ||
    String(item.role).toLowerCase().includes(keyword)
  )
})

const filteredExpiredList = computed(() => {
  const keyword = expiredSearch.value.trim().toLowerCase()
  const base = employeeList.value.filter((item) => item.status === 'expired' || item.status === 'inactive')
  if (!keyword) return base
  return base.filter(item =>
    String(item.corpId).toLowerCase().includes(keyword) ||
    String(item.name).toLowerCase().includes(keyword) ||
    String(item.department).toLowerCase().includes(keyword) ||
    String(item.email).toLowerCase().includes(keyword) ||
    String(item.role).toLowerCase().includes(keyword)
  )
})

const pendingPendingList = computed(() => pendingList.value)

const paginatedPendingPendingData = computed(() => {
  const start = (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value
  const end = start + pendingPendingPageSize.value
  return pendingPendingList.value.slice(start, end)
})

const pendingPendingTotalPages = computed(() => Math.max(1, Math.ceil(pendingPendingList.value.length / pendingPendingPageSize.value)))
const pendingPendingStartIndex = computed(() => (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value)
const pendingPendingEndIndex = computed(() => Math.min(pendingPendingStartIndex.value + pendingPendingPageSize.value, pendingPendingList.value.length))
const pendingPendingVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pendingPendingCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(pendingPendingTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedPendingApprovedData = computed(() => {
  const start = (pendingApprovedCurrentPage.value - 1) * pendingApprovedPageSize.value
  const end = start + pendingApprovedPageSize.value
  return pendingApprovedList.value.slice(start, end)
})

const pendingApprovedTotalPages = computed(() => Math.max(1, Math.ceil(pendingApprovedList.value.length / pendingApprovedPageSize.value)))
const pendingApprovedStartIndex = computed(() => (pendingApprovedCurrentPage.value - 1) * pendingApprovedPageSize.value)
const pendingApprovedEndIndex = computed(() => Math.min(pendingApprovedStartIndex.value + pendingApprovedPageSize.value, pendingApprovedList.value.length))
const pendingApprovedVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pendingApprovedCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(pendingApprovedTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedPendingRejectedData = computed(() => {
  const start = (pendingRejectedCurrentPage.value - 1) * pendingRejectedPageSize.value
  const end = start + pendingRejectedPageSize.value
  return pendingRejectedList.value.slice(start, end)
})

const pendingRejectedTotalPages = computed(() => Math.max(1, Math.ceil(pendingRejectedList.value.length / pendingRejectedPageSize.value)))
const pendingRejectedStartIndex = computed(() => (pendingRejectedCurrentPage.value - 1) * pendingRejectedPageSize.value)
const pendingRejectedEndIndex = computed(() => Math.min(pendingRejectedStartIndex.value + pendingRejectedPageSize.value, pendingRejectedList.value.length))
const pendingRejectedVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pendingRejectedCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(pendingRejectedTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
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
  get: () => {
    if (activeTab.value === 'list') return employeeSearch.value
    if (activeTab.value === 'expired') return expiredSearch.value
    return pendingSearch.value
  },
  set: (value) => {
    if (activeTab.value === 'list') {
      employeeSearch.value = value
      employeeCurrentPage.value = 1
    } else if (activeTab.value === 'expired') {
      expiredSearch.value = value
      expiredCurrentPage.value = 1
    } else {
      pendingSearch.value = value
      pendingPendingCurrentPage.value = 1
    }
  }
})

const paginatedUserData = computed(() => {
  const start = (employeeCurrentPage.value - 1) * employeePageSize.value
  const end = start + employeePageSize.value
  return filteredUserList.value.slice(start, end)
})

const employeeTotalPages = computed(() => Math.max(1, Math.ceil(filteredUserList.value.length / employeePageSize.value)))
const employeeStartIndex = computed(() => (employeeCurrentPage.value - 1) * employeePageSize.value)
const employeeEndIndex = computed(() => Math.min(employeeStartIndex.value + employeePageSize.value, filteredUserList.value.length))
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
  const start = (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value
  const end = start + pendingPendingPageSize.value
  return filteredPendingList.value.slice(start, end)
})

const pendingTotalPages = computed(() => Math.max(1, Math.ceil(filteredPendingList.value.length / pendingPendingPageSize.value)))
const pendingStartIndex = computed(() => (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value)
const pendingEndIndex = computed(() => Math.min(pendingStartIndex.value + pendingPendingPageSize.value, filteredPendingList.value.length))
const pendingVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, pendingPendingCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(pendingTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const paginatedExpiredData = computed(() => {
  const start = (expiredCurrentPage.value - 1) * expiredPageSize.value
  const end = start + expiredPageSize.value
  return filteredExpiredList.value.slice(start, end)
})

const expiredTotalPages = computed(() => Math.max(1, Math.ceil(filteredExpiredList.value.length / expiredPageSize.value)))
const expiredStartIndex = computed(() => (expiredCurrentPage.value - 1) * expiredPageSize.value)
const expiredEndIndex = computed(() => Math.min(expiredStartIndex.value + expiredPageSize.value, filteredExpiredList.value.length))
const expiredVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, expiredCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(expiredTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch([employeeTotalPages, pendingTotalPages, expiredTotalPages], () => {
  if (employeeCurrentPage.value > employeeTotalPages.value) {
    employeeCurrentPage.value = employeeTotalPages.value
  }
  if (pendingPendingCurrentPage.value > pendingTotalPages.value) {
    pendingPendingCurrentPage.value = pendingTotalPages.value
  }
  if (expiredCurrentPage.value > expiredTotalPages.value) {
    expiredCurrentPage.value = expiredTotalPages.value
  }
})

const showForm = ref(false)
const showQRCode = ref(false)
const showDeleteDialog = ref(false)
const showResetDialog = ref(false)
const showResetPasswordDialog = ref(false)
const showPendingHandleDialog = ref(false)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const currentRow = ref(null)
const formMode = ref('add')
const formData = ref({
  corpId: '',
  name: '',
  department: '',
  role: '',
  email: '',
  password: DEFAULT_PASSWORD,
  annualQuotaEV: 30,
  annualQuotaVenue: 30,
  usedQuotaEV: 0,
  usedQuotaVenue: 0,
  status: 'active'
})

const pendingHandleForm = ref({
  id: null,
  corpId: '',
  name: '',
  department: '',
  role: '',
  email: '',
  password: DEFAULT_PASSWORD,
  submittedAt: '',
  reason: '',
  rejectTemplateKey: 'account_application_reject_template',
  rejectReason: ''
})

const rejectForm = ref({
  templateKey: 'account_application_reject_template',
  reason: ''
})
const rejectTemplateOptions = computed(() =>
  getMockPromptList().filter(
    item => item.category === 'reject_template' && item.templateType === 'account_application'
  )
)

const registrationUrl = ref('https://tkoh.com/register?token=abc123')
const qrCanvas = ref(null)
const qrCodeDataUrl = ref('')

// Watch showQRCode to generate QR code when dialog opens
watch(showQRCode, async (newVal) => {
  if (newVal && registrationUrl.value) {
    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(registrationUrl.value, {
        width: 280,
        margin: 2,
        color: {
          dark: '#00723a',
          light: '#ffffff'
        }
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      ElMessage.error('Failed to generate QR code')
    }
  }
})

const downloadQRCode = () => {
  if (!qrCodeDataUrl.value) {
    ElMessage.warning('QR code not generated yet')
    return
  }

  const link = document.createElement('a')
  link.download = `User_Registration_QRCode_${new Date().toISOString().split('T')[0]}.png`
  link.href = qrCodeDataUrl.value
  link.click()
  ElMessage.success('QR code downloaded successfully')
}

const getUserRowIndex = (index) => {
  return (employeeCurrentPage.value - 1) * employeePageSize.value + index + 1
}

const getPendingPendingRowIndex = (index) => {
  return (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value + index + 1
}

const getPendingApprovedRowIndex = (index) => {
  return (pendingApprovedCurrentPage.value - 1) * pendingApprovedPageSize.value + index + 1
}

const getPendingRejectedRowIndex = (index) => {
  return (pendingRejectedCurrentPage.value - 1) * pendingRejectedPageSize.value + index + 1
}

const getExpiredRowIndex = (index) => {
  return (expiredCurrentPage.value - 1) * expiredPageSize.value + index + 1
}

const handleExport = () => {
  const exportData = employeeList.value.map(item => ({
    'Corp ID': item.corpId,
    'Name': item.name,
    'Department': item.department,
    'Role': item.role,
    'Email': item.email,
    'EV Quota': item.annualQuotaEV,
    'Used Quota (EV)': item.usedQuotaEV,
    'Venue Quota': item.annualQuotaVenue,
    'Used Quota (Venue)': item.usedQuotaVenue,
    'Status': item.status === 'active' ? 'Active' : item.status === 'inactive' ? 'Inactive' : 'Expired'
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Users')
  XLSX.writeFile(wb, `User_Management_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('Excel file exported successfully')
}

const handleAdd = () => {
  formMode.value = 'add'
  formData.value = {
    corpId: '',
    name: '',
    department: '',
    role: '',
    email: '',
    password: DEFAULT_PASSWORD,
    annualQuotaEV: 30,
    annualQuotaVenue: 30,
    usedQuotaEV: 0,
    usedQuotaVenue: 0,
    status: 'active'
  }
  showForm.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  formData.value = { ...row, password: row.password || DEFAULT_PASSWORD }
  showForm.value = true
}

const handleSave = () => {
  if (formMode.value === 'add') {
    employeeList.value.push({ ...formData.value, id: Date.now() })
    ElMessage.success('User added successfully')
  } else {
    const index = employeeList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      employeeList.value[index] = { ...formData.value }
      ElMessage.success('User updated successfully')
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  currentRow.value = row
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  const index = employeeList.value.findIndex(item => item.id === currentRow.value.id)
  if (index !== -1) {
    employeeList.value.splice(index, 1)
    ElMessage.success('Deleted successfully')
  }
  showDeleteDialog.value = false
  currentRow.value = null
}

const handleResetQuota = (row) => {
  currentRow.value = row
  showResetDialog.value = true
}

const confirmReset = () => {
  currentRow.value.usedQuotaEV = 0
  currentRow.value.usedQuotaVenue = 0
  ElMessage.success('Quota reset successfully')
  showResetDialog.value = false
  currentRow.value = null
}

const handleResetPassword = (row) => {
  currentRow.value = row
  // 每次打开对话框都先填充默认密码，管理员可在弹窗里再改
  resetPasswordForm.value.password = DEFAULT_PASSWORD
  showResetPasswordDialog.value = true
}

const confirmResetPassword = () => {
  currentRow.value.password = resetPasswordForm.value.password
  ElMessage.success('Password reset successfully')
  showResetPasswordDialog.value = false
  currentRow.value = null
}

const handleInactivate = (row) => {
  row.status = 'inactive'
  ElMessage.success('Account set to inactive')
}

const handlePending = (row) => {
  currentRow.value = row
  pendingHandleForm.value = {
    ...row,
    password: DEFAULT_PASSWORD,
    rejectTemplateKey: 'account_application_reject_template',
    rejectReason: ''
  }
  handlePendingRejectTemplateChange(pendingHandleForm.value.rejectTemplateKey)
  showPendingHandleDialog.value = true
}

const confirmPendingApprove = () => {
  const data = { ...pendingHandleForm.value }
  employeeList.value.push({
    ...data,
    id: Date.now(),
    password: data.password || DEFAULT_PASSWORD,
    annualQuotaEV: 30,
    usedQuotaEV: 0,
    annualQuotaVenue: 30,
    usedQuotaVenue: 0,
    status: 'active'
  })

  pendingApprovedList.value.push({
    ...data,
    approvedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    approvedBy: 'Admin'
  })

  const index = pendingList.value.findIndex((item) => item.id === data.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
  }

  ElMessage.success('Account created successfully')
  adminStore.fetchPendingCounts()
  showPendingHandleDialog.value = false
  currentRow.value = null
}

const confirmPendingReject = () => {
  if (!pendingHandleForm.value.rejectReason.trim()) {
    ElMessage.warning('Please provide a reason for rejection')
    return
  }

  const data = pendingHandleForm.value
  pendingRejectedList.value.push({
    ...data,
    rejectedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    rejectedBy: 'Admin',
    rejectReason: pendingHandleForm.value.rejectReason.trim()
  })

  const index = pendingList.value.findIndex(item => item.id === data.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
    ElMessage.success('Registration rejected')
    adminStore.fetchPendingCounts()
  }
  showPendingHandleDialog.value = false
  currentRow.value = null
}

const handleActivate = (row) => {
  row.status = 'active'
  ElMessage.success('Account activated successfully')
  currentRow.value = null
}

const handleApprove = (row) => {
  currentRow.value = row
  showApproveDialog.value = true
}

const confirmApprove = () => {
  employeeList.value.push({
    ...currentRow.value,
    id: Date.now(),
    password: DEFAULT_PASSWORD,
    annualQuotaEV: 30,
    usedQuotaEV: 0,
    annualQuotaVenue: 30,
    usedQuotaVenue: 0,
    status: 'active'
  })

  pendingApprovedList.value.push({
    ...currentRow.value,
    approvedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    approvedBy: 'Admin'
  })

  const index = pendingList.value.findIndex(item => item.id === currentRow.value.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
  }
  ElMessage.success('Account created successfully')
  adminStore.fetchPendingCounts()
  showApproveDialog.value = false
  currentRow.value = null
}

const handleReject = (row) => {
  currentRow.value = row
  rejectForm.value.templateKey = 'account_application_reject_template'
  rejectForm.value.reason = ''
  handleUserRejectTemplateChange(rejectForm.value.templateKey)
  showRejectDialog.value = true
}

const handleUserRejectTemplateChange = (templateKey) => {
  const selectedTemplate = rejectTemplateOptions.value.find(item => item.key === templateKey)
  if (!selectedTemplate) return
  rejectForm.value.reason = selectedTemplate.content || ''
}

const handlePendingRejectTemplateChange = (templateKey) => {
  const selectedTemplate = rejectTemplateOptions.value.find(item => item.key === templateKey)
  if (!selectedTemplate) return
  pendingHandleForm.value.rejectReason = selectedTemplate.content || ''
}

const confirmReject = () => {
  if (!rejectForm.value.reason.trim()) {
    ElMessage.warning('Please provide a reason for rejection')
    return
  }

  const data = pendingHandleForm.value.id ? pendingHandleForm.value : currentRow.value

  pendingRejectedList.value.push({
    ...data,
    rejectedAt: new Date().toLocaleString('en-CA', { hour12: false }).replace(',', ''),
    rejectedBy: 'Admin',
    rejectReason: rejectForm.value.reason
  })

  const index = pendingList.value.findIndex(item => item.id === data.id)
  if (index !== -1) {
    pendingList.value.splice(index, 1)
    ElMessage.success('Registration rejected')
    adminStore.fetchPendingCounts()
  }
  showRejectDialog.value = false
  showPendingHandleDialog.value = false
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

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.3rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin: 0.5rem 0.75rem 0.3rem;
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

.toolbar-right :deep(.el-button.cancel-btn) {
  background: #ffffff !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
  font-weight: 600;
  box-shadow: none;
}

.toolbar-right :deep(.el-button.cancel-btn:hover) {
  background: #f3f4f6 !important;
  border-color: #9ca3af !important;
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

.sub-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.sub-tabs :deep(.el-tabs__header) {
  margin-bottom: 0.35rem;
}

.sub-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.sub-tabs :deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sub-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.sub-tabs :deep(.el-tabs__item.is-active) {
  color: #00723a;
  font-weight: 600;
}

.sub-tabs :deep(.el-tabs__active-bar) {
  background-color: #00723a;
  height: 2px;
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

.status-pill.status-expired {
  background: #fef3c7;
  color: #92400e;
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

.action-reset-password {
  background-color: #8b5cf6 !important;
}

.action-reset-password:hover {
  background-color: #7c3aed !important;
}

.action-activate {
  background-color: #22c55e !important;
}

.action-activate:hover {
  background-color: #16a34a !important;
}

.action-inactivate {
  background-color: #f59e0b !important;
}

.action-inactivate:hover {
  background-color: #d97706 !important;
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
