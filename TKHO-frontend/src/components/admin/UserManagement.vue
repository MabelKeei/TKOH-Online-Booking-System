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
                  <el-table-column prop="corpId" min-width="120">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('user', 'corpId')">
                        Corp ID
                        <span class="sort-indicator">{{ getSortIndicator('user', 'corpId') }}</span>
                      </button>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="Name" min-width="280" />
                  <el-table-column prop="department" min-width="100">
                    <template #header>
                      <SortableFilterHeader
                        label="Department"
                        :sort-indicator="getSortIndicator('user', 'department')"
                        :filter-active="columnFilterState.user.department.length > 0"
                        :options="getFilterOptions('user', 'department')"
                        :model-value="columnFilterState.user.department"
                        @sort-asc="setSortByMenu('user', 'department', 'asc')"
                        @sort-desc="setSortByMenu('user', 'department', 'desc')"
                        @clear-sort="clearSortByMenu('user', 'department')"
                        @update:model-value="(v) => updateFilter('user', 'department', v)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="role" min-width="140">
                    <template #header>
                      <SortableFilterHeader
                        label="Role"
                        :sort-indicator="getSortIndicator('user', 'role')"
                        :filter-active="columnFilterState.user.role.length > 0"
                        :options="getFilterOptions('user', 'role')"
                        :model-value="columnFilterState.user.role"
                        @sort-asc="setSortByMenu('user', 'role', 'asc')"
                        @sort-desc="setSortByMenu('user', 'role', 'desc')"
                        @clear-sort="clearSortByMenu('user', 'role')"
                        @update:model-value="(v) => updateFilter('user', 'role', v)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="email" label="Email" min-width="220" />
                  <el-table-column min-width="165">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('user', 'evQuota')">
                        EV Quota
                        <span class="sort-indicator">{{ getSortIndicator('user', 'evQuota') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      {{ row.usedQuotaEV }} / {{ row.annualQuotaEV }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="110">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('user', 'venueQuota')">
                        Venue Quota
                        <span class="sort-indicator">{{ getSortIndicator('user', 'venueQuota') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      {{ row.usedQuotaVenue }} / {{ row.annualQuotaVenue }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="status" min-width="120">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('user', 'status')">
                        Status
                        <span class="sort-indicator">{{ getSortIndicator('user', 'status') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      <span :class="['status-pill', `status-${row.status}`]">
                        {{ row.status === 'active' ? 'Active' : row.status === 'inactive' ? 'Inactive' : 'Expired' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastLoginTime" min-width="180">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('user', 'lastLoginTime')">
                        Last login time
                        <span class="sort-indicator">{{ getSortIndicator('user', 'lastLoginTime') }}</span>
                      </button>
                    </template>
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
                Showing {{ employeeStartIndex + 1 }}-{{ employeeEndIndex }} of {{ sortedUserList.length }} records
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
                  <el-table-column prop="corpId" min-width="120">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('expired', 'corpId')">
                        Corp ID
                        <span class="sort-indicator">{{ getSortIndicator('expired', 'corpId') }}</span>
                      </button>
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="Name" min-width="280" />
                  <el-table-column prop="department" min-width="100">
                    <template #header>
                      <SortableFilterHeader
                        label="Department"
                        :sort-indicator="getSortIndicator('expired', 'department')"
                        :filter-active="columnFilterState.expired.department.length > 0"
                        :options="getFilterOptions('expired', 'department')"
                        :model-value="columnFilterState.expired.department"
                        @sort-asc="setSortByMenu('expired', 'department', 'asc')"
                        @sort-desc="setSortByMenu('expired', 'department', 'desc')"
                        @clear-sort="clearSortByMenu('expired', 'department')"
                        @update:model-value="(v) => updateFilter('expired', 'department', v)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="role" min-width="140">
                    <template #header>
                      <SortableFilterHeader
                        label="Role"
                        :sort-indicator="getSortIndicator('expired', 'role')"
                        :filter-active="columnFilterState.expired.role.length > 0"
                        :options="getFilterOptions('expired', 'role')"
                        :model-value="columnFilterState.expired.role"
                        @sort-asc="setSortByMenu('expired', 'role', 'asc')"
                        @sort-desc="setSortByMenu('expired', 'role', 'desc')"
                        @clear-sort="clearSortByMenu('expired', 'role')"
                        @update:model-value="(v) => updateFilter('expired', 'role', v)"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="email" label="Email" min-width="220" />
                  <el-table-column prop="status" min-width="120">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('expired', 'status')">
                        Status
                        <span class="sort-indicator">{{ getSortIndicator('expired', 'status') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      <span :class="['status-pill', `status-${row.status}`]">
                        {{ row.status === 'expired' ? 'Expired' : 'Inactive' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="lastLoginTime" min-width="180">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('expired', 'lastLoginTime')">
                        Last login time
                        <span class="sort-indicator">{{ getSortIndicator('expired', 'lastLoginTime') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      {{ row.lastLoginTime || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="165">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('expired', 'evQuota')">
                        EV Quota
                        <span class="sort-indicator">{{ getSortIndicator('expired', 'evQuota') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      {{ row.usedQuotaEV }} / {{ row.annualQuotaEV }}
                    </template>
                  </el-table-column>
                  <el-table-column min-width="110">
                    <template #header>
                      <button type="button" class="th-sort-btn" @click="toggleSort('expired', 'venueQuota')">
                        Venue Quota
                        <span class="sort-indicator">{{ getSortIndicator('expired', 'venueQuota') }}</span>
                      </button>
                    </template>
                    <template #default="{ row }">
                      {{ row.usedQuotaVenue }} / {{ row.annualQuotaVenue }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Actions" width="130" fixed="right" class-name="actions-col">
                    <template #default="{ row }">
                      <div class="actions-cell">
                        <el-button size="small" class="action-btn action-activate" @click="handleActivate(row)">Activate</el-button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="pagination-bar">
              <div class="pagination-info">
                Showing {{ expiredStartIndex + 1 }}-{{ expiredEndIndex }} of {{ sortedExpiredList.length }} records
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
              <el-badge :value="sortedPendingPendingList.length" :max="99" class="badge-item" />
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
                      <el-table-column prop="corpId" min-width="120">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingPending', 'corpId')">
                            Corp ID
                            <span class="sort-indicator">{{ getSortIndicator('pendingPending', 'corpId') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                      <el-table-column prop="name" label="Name" min-width="360" />
                      <el-table-column prop="department" min-width="100">
                        <template #header>
                          <SortableFilterHeader
                            label="Department"
                            :sort-indicator="getSortIndicator('pendingPending', 'department')"
                            :filter-active="columnFilterState.pendingPending.department.length > 0"
                            :options="getFilterOptions('pendingPending', 'department')"
                            :model-value="columnFilterState.pendingPending.department"
                            @sort-asc="setSortByMenu('pendingPending', 'department', 'asc')"
                            @sort-desc="setSortByMenu('pendingPending', 'department', 'desc')"
                            @clear-sort="clearSortByMenu('pendingPending', 'department')"
                            @update:model-value="(v) => updateFilter('pendingPending', 'department', v)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="role" min-width="140">
                        <template #header>
                          <SortableFilterHeader
                            label="Role"
                            :sort-indicator="getSortIndicator('pendingPending', 'role')"
                            :filter-active="columnFilterState.pendingPending.role.length > 0"
                            :options="getFilterOptions('pendingPending', 'role')"
                            :model-value="columnFilterState.pendingPending.role"
                            @sort-asc="setSortByMenu('pendingPending', 'role', 'asc')"
                            @sort-desc="setSortByMenu('pendingPending', 'role', 'desc')"
                            @clear-sort="clearSortByMenu('pendingPending', 'role')"
                            @update:model-value="(v) => updateFilter('pendingPending', 'role', v)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="email" label="Email" min-width="220" />
                      <el-table-column prop="lastLoginTime" min-width="180">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingPending', 'lastLoginTime')">
                            Last login time
                            <span class="sort-indicator">{{ getSortIndicator('pendingPending', 'lastLoginTime') }}</span>
                          </button>
                        </template>
                        <template #default="{ row }">
                          {{ row.lastLoginTime || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="reason" label="Application Reason" min-width="240" />
                      <el-table-column prop="submittedAt" min-width="180">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingPending', 'submittedAt')">
                            Submitted At
                            <span class="sort-indicator">{{ getSortIndicator('pendingPending', 'submittedAt') }}</span>
                          </button>
                        </template>
                      </el-table-column>
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
                    Showing {{ pendingPendingStartIndex + 1 }}-{{ pendingPendingEndIndex }} of {{ sortedPendingPendingList.length }} records
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
                      <el-table-column prop="corpId" min-width="120">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingApproved', 'corpId')">
                            Corp ID
                            <span class="sort-indicator">{{ getSortIndicator('pendingApproved', 'corpId') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                      <el-table-column prop="name" label="Name" min-width="360" />
                      <el-table-column prop="department" min-width="100">
                        <template #header>
                          <SortableFilterHeader
                            label="Department"
                            :sort-indicator="getSortIndicator('pendingApproved', 'department')"
                            :filter-active="columnFilterState.pendingApproved.department.length > 0"
                            :options="getFilterOptions('pendingApproved', 'department')"
                            :model-value="columnFilterState.pendingApproved.department"
                            @sort-asc="setSortByMenu('pendingApproved', 'department', 'asc')"
                            @sort-desc="setSortByMenu('pendingApproved', 'department', 'desc')"
                            @clear-sort="clearSortByMenu('pendingApproved', 'department')"
                            @update:model-value="(v) => updateFilter('pendingApproved', 'department', v)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="role" min-width="140">
                        <template #header>
                          <SortableFilterHeader
                            label="Role"
                            :sort-indicator="getSortIndicator('pendingApproved', 'role')"
                            :filter-active="columnFilterState.pendingApproved.role.length > 0"
                            :options="getFilterOptions('pendingApproved', 'role')"
                            :model-value="columnFilterState.pendingApproved.role"
                            @sort-asc="setSortByMenu('pendingApproved', 'role', 'asc')"
                            @sort-desc="setSortByMenu('pendingApproved', 'role', 'desc')"
                            @clear-sort="clearSortByMenu('pendingApproved', 'role')"
                            @update:model-value="(v) => updateFilter('pendingApproved', 'role', v)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="email" label="Email" min-width="220" />
                      <el-table-column prop="lastLoginTime" min-width="180">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingApproved', 'lastLoginTime')">
                            Last login time
                            <span class="sort-indicator">{{ getSortIndicator('pendingApproved', 'lastLoginTime') }}</span>
                          </button>
                        </template>
                        <template #default="{ row }">
                          {{ row.lastLoginTime || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="approvedAt" min-width="180">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingApproved', 'approvedAt')">
                            Approved At
                            <span class="sort-indicator">{{ getSortIndicator('pendingApproved', 'approvedAt') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                      <el-table-column prop="approvedBy" min-width="140">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingApproved', 'approvedBy')">
                            Approved By
                            <span class="sort-indicator">{{ getSortIndicator('pendingApproved', 'approvedBy') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
                <div class="pagination-bar">
                  <div class="pagination-info">
                    Showing {{ pendingApprovedStartIndex + 1 }}-{{ pendingApprovedEndIndex }} of {{ sortedPendingApprovedList.length }} records
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
                      <el-table-column prop="corpId" min-width="120">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingRejected', 'corpId')">
                            Corp ID
                            <span class="sort-indicator">{{ getSortIndicator('pendingRejected', 'corpId') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                      <el-table-column prop="name" label="Name" min-width="360" />
                      <el-table-column prop="department" min-width="100">
                        <template #header>
                          <SortableFilterHeader
                            label="Department"
                            :sort-indicator="getSortIndicator('pendingRejected', 'department')"
                            :filter-active="columnFilterState.pendingRejected.department.length > 0"
                            :options="getFilterOptions('pendingRejected', 'department')"
                            :model-value="columnFilterState.pendingRejected.department"
                            @sort-asc="setSortByMenu('pendingRejected', 'department', 'asc')"
                            @sort-desc="setSortByMenu('pendingRejected', 'department', 'desc')"
                            @clear-sort="clearSortByMenu('pendingRejected', 'department')"
                            @update:model-value="(v) => updateFilter('pendingRejected', 'department', v)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="role" min-width="140">
                        <template #header>
                          <SortableFilterHeader
                            label="Role"
                            :sort-indicator="getSortIndicator('pendingRejected', 'role')"
                            :filter-active="columnFilterState.pendingRejected.role.length > 0"
                            :options="getFilterOptions('pendingRejected', 'role')"
                            :model-value="columnFilterState.pendingRejected.role"
                            @sort-asc="setSortByMenu('pendingRejected', 'role', 'asc')"
                            @sort-desc="setSortByMenu('pendingRejected', 'role', 'desc')"
                            @clear-sort="clearSortByMenu('pendingRejected', 'role')"
                            @update:model-value="(v) => updateFilter('pendingRejected', 'role', v)"
                          />
                        </template>
                      </el-table-column>
                      <el-table-column prop="email" label="Email" min-width="220" />
                      <el-table-column prop="lastLoginTime" min-width="180">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingRejected', 'lastLoginTime')">
                            Last login time
                            <span class="sort-indicator">{{ getSortIndicator('pendingRejected', 'lastLoginTime') }}</span>
                          </button>
                        </template>
                        <template #default="{ row }">
                          {{ row.lastLoginTime || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="rejectedAt" min-width="180">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingRejected', 'rejectedAt')">
                            Rejected At
                            <span class="sort-indicator">{{ getSortIndicator('pendingRejected', 'rejectedAt') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                      <el-table-column prop="rejectedBy" min-width="140">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingRejected', 'rejectedBy')">
                            Rejected By
                            <span class="sort-indicator">{{ getSortIndicator('pendingRejected', 'rejectedBy') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                      <el-table-column prop="rejectReason" min-width="240">
                        <template #header>
                          <button type="button" class="th-sort-btn" @click="toggleSort('pendingRejected', 'rejectReason')">
                            Reject Reason
                            <span class="sort-indicator">{{ getSortIndicator('pendingRejected', 'rejectReason') }}</span>
                          </button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </div>
                <div class="pagination-bar">
                  <div class="pagination-info">
                    Showing {{ pendingRejectedStartIndex + 1 }}-{{ pendingRejectedEndIndex }} of {{ sortedPendingRejectedList.length }} records
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
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            :filter-method="handleDepartmentFilter"
            @blur="handleDepartmentBlur"
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
        <el-form-item label="Contact No.">
          <el-input v-model="formData.contact" />
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
import SortableFilterHeader from '@/components/admin/SortableFilterHeader.vue'
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

const departmentInputKeyword = ref('')

const handleDepartmentFilter = (query) => {
  departmentInputKeyword.value = String(query || '')
}

const handleDepartmentBlur = () => {
  const typed = departmentInputKeyword.value.trim()
  if (typed) {
    formData.value.department = typed
  }
  departmentInputKeyword.value = ''
}

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

const sortStates = ref({
  user: [],
  expired: [],
  pendingPending: [],
  pendingApproved: [],
  pendingRejected: []
})

const columnFilterState = ref({
  user: { department: [], role: [] },
  expired: { department: [], role: [] },
  pendingPending: { department: [], role: [] },
  pendingApproved: { department: [], role: [] },
  pendingRejected: { department: [], role: [] }
})

const parseDateTimeForSort = (value) => {
  if (!value) return 0
  const parsed = new Date(String(value).replace(',', ''))
  const ts = parsed.getTime()
  return Number.isNaN(ts) ? 0 : ts
}

const getSortValue = (row, key) => {
  switch (key) {
    case 'corpId':
    case 'department':
    case 'role':
    case 'status':
    case 'approvedBy':
    case 'rejectedBy':
    case 'rejectReason':
      return row[key] || ''
    case 'evQuota':
      return Number(row.usedQuotaEV || 0) * 10000 + Number(row.annualQuotaEV || 0)
    case 'venueQuota':
      return Number(row.usedQuotaVenue || 0) * 10000 + Number(row.annualQuotaVenue || 0)
    case 'lastLoginTime':
    case 'submittedAt':
    case 'approvedAt':
    case 'rejectedAt':
      return parseDateTimeForSort(row[key])
    default:
      return ''
  }
}

const sortList = (rows, tableKey) => {
  const state = sortStates.value[tableKey] || []
  if (!state.length) return rows.slice()
  return rows.slice().sort((a, b) => {
    for (const criterion of state) {
      const aValue = getSortValue(a, criterion.key)
      const bValue = getSortValue(b, criterion.key)
      const direction = criterion.order === 'asc' ? 1 : -1
      let cmp = 0
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        cmp = aValue - bValue
      } else {
        cmp = String(aValue).localeCompare(String(bValue), undefined, { sensitivity: 'base' })
      }
      if (cmp !== 0) return cmp * direction
    }
    return 0
  })
}

const getUniqueOptions = (rows, key) => {
  return [...new Set((rows || []).map(row => row?.[key]).filter(v => v !== null && v !== undefined && `${v}` !== ''))]
}

const getFilterOptions = (tableKey, key) => {
  if (tableKey === 'user') return getUniqueOptions(filteredUserList.value, key)
  if (tableKey === 'expired') return getUniqueOptions(filteredExpiredList.value, key)
  if (tableKey === 'pendingPending') return getUniqueOptions(pendingPendingList.value, key)
  if (tableKey === 'pendingApproved') return getUniqueOptions(pendingApprovedList.value, key)
  if (tableKey === 'pendingRejected') return getUniqueOptions(pendingRejectedList.value, key)
  return []
}

const updateFilter = (tableKey, key, value) => {
  columnFilterState.value[tableKey][key] = value ?? []
  if (tableKey === 'user') employeeCurrentPage.value = 1
  if (tableKey === 'expired') expiredCurrentPage.value = 1
  if (tableKey === 'pendingPending') pendingPendingCurrentPage.value = 1
  if (tableKey === 'pendingApproved') pendingApprovedCurrentPage.value = 1
  if (tableKey === 'pendingRejected') pendingRejectedCurrentPage.value = 1
}

const selectAllFilterOptions = (tableKey, key, options) => {
  updateFilter(tableKey, key, [...options])
}

const clearFilterOptions = (tableKey, key) => {
  updateFilter(tableKey, key, [])
}

const applyTableFilters = (rows, tableKey) => {
  const state = columnFilterState.value[tableKey]
  return rows.filter((row) => {
    const depSelected = state.department || []
    const roleSelected = state.role || []
    const depMatch = !depSelected.length || depSelected.map(v => String(v)).includes(String(row.department || ''))
    const roleMatch = !roleSelected.length || roleSelected.map(v => String(v)).includes(String(row.role || ''))
    return depMatch && roleMatch
  })
}

const toggleSort = (tableKey, key) => {
  const state = sortStates.value[tableKey]
  const idx = state.findIndex(item => item.key === key)
  if (idx === -1) {
    state.push({ key, order: 'asc' })
  } else if (state[idx].order === 'asc') {
    state[idx].order = 'desc'
  } else {
    state.splice(idx, 1)
  }
  if (tableKey === 'user') employeeCurrentPage.value = 1
  if (tableKey === 'expired') expiredCurrentPage.value = 1
  if (tableKey === 'pendingPending') pendingPendingCurrentPage.value = 1
  if (tableKey === 'pendingApproved') pendingApprovedCurrentPage.value = 1
  if (tableKey === 'pendingRejected') pendingRejectedCurrentPage.value = 1
}

const setSortByMenu = (tableKey, key, order) => {
  const state = sortStates.value[tableKey]
  const idx = state.findIndex(item => item.key === key)
  if (idx === -1) {
    state.push({ key, order })
  } else {
    state[idx].order = order
  }
  if (tableKey === 'user') employeeCurrentPage.value = 1
  if (tableKey === 'expired') expiredCurrentPage.value = 1
  if (tableKey === 'pendingPending') pendingPendingCurrentPage.value = 1
  if (tableKey === 'pendingApproved') pendingApprovedCurrentPage.value = 1
  if (tableKey === 'pendingRejected') pendingRejectedCurrentPage.value = 1
}

const clearSortByMenu = (tableKey, key) => {
  const state = sortStates.value[tableKey]
  const idx = state.findIndex(item => item.key === key)
  if (idx !== -1) state.splice(idx, 1)
  if (tableKey === 'user') employeeCurrentPage.value = 1
  if (tableKey === 'expired') expiredCurrentPage.value = 1
  if (tableKey === 'pendingPending') pendingPendingCurrentPage.value = 1
  if (tableKey === 'pendingApproved') pendingApprovedCurrentPage.value = 1
  if (tableKey === 'pendingRejected') pendingRejectedCurrentPage.value = 1
}

const getSortIndicator = (tableKey, key) => {
  const state = sortStates.value[tableKey] || []
  const idx = state.findIndex(item => item.key === key)
  if (idx === -1) return '↕'
  const arrow = state[idx].order === 'asc' ? '▲' : '▼'
  return `${arrow}${idx + 1}`
}

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
const sortedPendingPendingList = computed(() => sortList(applyTableFilters(pendingPendingList.value, 'pendingPending'), 'pendingPending'))
const sortedPendingApprovedList = computed(() => sortList(applyTableFilters(pendingApprovedList.value, 'pendingApproved'), 'pendingApproved'))
const sortedPendingRejectedList = computed(() => sortList(applyTableFilters(pendingRejectedList.value, 'pendingRejected'), 'pendingRejected'))
const sortedUserList = computed(() => sortList(applyTableFilters(filteredUserList.value, 'user'), 'user'))
const sortedExpiredList = computed(() => sortList(applyTableFilters(filteredExpiredList.value, 'expired'), 'expired'))

const paginatedPendingPendingData = computed(() => {
  const start = (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value
  const end = start + pendingPendingPageSize.value
  return sortedPendingPendingList.value.slice(start, end)
})

const pendingPendingTotalPages = computed(() => Math.max(1, Math.ceil(sortedPendingPendingList.value.length / pendingPendingPageSize.value)))
const pendingPendingStartIndex = computed(() => (pendingPendingCurrentPage.value - 1) * pendingPendingPageSize.value)
const pendingPendingEndIndex = computed(() => Math.min(pendingPendingStartIndex.value + pendingPendingPageSize.value, sortedPendingPendingList.value.length))
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
  return sortedPendingApprovedList.value.slice(start, end)
})

const pendingApprovedTotalPages = computed(() => Math.max(1, Math.ceil(sortedPendingApprovedList.value.length / pendingApprovedPageSize.value)))
const pendingApprovedStartIndex = computed(() => (pendingApprovedCurrentPage.value - 1) * pendingApprovedPageSize.value)
const pendingApprovedEndIndex = computed(() => Math.min(pendingApprovedStartIndex.value + pendingApprovedPageSize.value, sortedPendingApprovedList.value.length))
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
  return sortedPendingRejectedList.value.slice(start, end)
})

const pendingRejectedTotalPages = computed(() => Math.max(1, Math.ceil(sortedPendingRejectedList.value.length / pendingRejectedPageSize.value)))
const pendingRejectedStartIndex = computed(() => (pendingRejectedCurrentPage.value - 1) * pendingRejectedPageSize.value)
const pendingRejectedEndIndex = computed(() => Math.min(pendingRejectedStartIndex.value + pendingRejectedPageSize.value, sortedPendingRejectedList.value.length))
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
  return sortedUserList.value.slice(start, end)
})

const employeeTotalPages = computed(() => Math.max(1, Math.ceil(sortedUserList.value.length / employeePageSize.value)))
const employeeStartIndex = computed(() => (employeeCurrentPage.value - 1) * employeePageSize.value)
const employeeEndIndex = computed(() => Math.min(employeeStartIndex.value + employeePageSize.value, sortedUserList.value.length))
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
  return sortedExpiredList.value.slice(start, end)
})

const expiredTotalPages = computed(() => Math.max(1, Math.ceil(sortedExpiredList.value.length / expiredPageSize.value)))
const expiredStartIndex = computed(() => (expiredCurrentPage.value - 1) * expiredPageSize.value)
const expiredEndIndex = computed(() => Math.min(expiredStartIndex.value + expiredPageSize.value, sortedExpiredList.value.length))
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
  contact: '',
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
    'Status': item.status === 'active' ? 'Active' : item.status === 'inactive' ? 'Inactive' : 'Expired',
    'Last login time': item.lastLoginTime || '-'
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
    contact: '',
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
  padding: 0.25rem 0.6rem 0.6rem;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin: 0.45rem 0.6rem 0.25rem;
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
  min-width: 0;
}

.toolbar-search {
  width: min(460px, 48vw);
}

@media (max-width: 1180px) {
  .page-header {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .toolbar-left {
    flex: 1 1 100%;
  }

  .toolbar-right {
    flex: 1 1 100%;
    margin-left: 0;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .toolbar-search {
    width: 100%;
    min-width: 260px;
  }
}

@media (max-width: 768px) {
  .toolbar-right {
    gap: 0.375rem;
  }

  .toolbar-right :deep(.el-button) {
    flex: 1 1 auto;
    min-width: 140px;
  }

  .toolbar-search {
    min-width: 100%;
  }
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

.th-sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
}

.sort-indicator {
  font-size: 0.68rem;
  color: #6b7280;
  line-height: 1;
}

.th-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
}

.filter-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #00723a;
  display: inline-block;
}

.th-menu {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.th-menu-sort {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.th-menu-item {
  border: 1px solid #b7dec7;
  background: #f5fbf7;
  color: #14532d;
  border-radius: 0.375rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.th-menu-item:hover {
  background: #e8f6ee;
  border-color: #8fcca9;
}

.th-menu-item.danger {
  color: #b91c1c;
  border-color: #f3c4c4;
  background: #fff6f6;
}

.th-menu-divider {
  height: 1px;
  background: #d3ebdd;
}

.th-menu-filter-title {
  font-size: 0.75rem;
  color: #166534;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.menu-icon {
  width: 0.9rem;
  text-align: center;
  color: #15803d;
}

.th-filter-popover {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.th-filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.th-filter-link {
  border: none;
  background: transparent;
  color: #15803d;
  font-size: 0.75rem;
  padding: 0;
  cursor: pointer;
  font-weight: 600;
}

.th-filter-link:hover {
  text-decoration: underline;
}

.th-checkbox-list {
  width: 100%;
  max-height: 180px;
  overflow: auto;
  border: 1px solid #c7e5d4;
  border-radius: 0.375rem;
  padding: 0.4rem 0.55rem;
  background: #f8fdf9;
}

.th-checkbox-list :deep(.el-checkbox) {
  display: flex;
  margin-right: 0;
  margin-bottom: 0.35rem;
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
