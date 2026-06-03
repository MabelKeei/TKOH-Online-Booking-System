<template>
  <div class="page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden" style="padding-top: var(--app-header-height, 64px);">
    <AppHeader />

    <main class="flex-1 flex flex-col px-2 md:px-3 lg:px-4 py-1 md:py-2 pb-1 overflow-hidden">
      <!-- Toolbar -->
      <div class="toolbar bg-white rounded-lg shadow-sm p-3 mb-1 flex items-center justify-between gap-3">
        <div class="toolbar-left flex items-center gap-3">
          <!-- Admin View Switcher (only for admin) -->
          <div v-if="isAdmin" class="view-switcher-wrapper">
            <div class="view-switcher">
              <button
                :class="['view-switch-btn', { active: bookingView === 'my' }]"
                @click="bookingView = 'my'"
              >
                My Bookings
              </button>
              <button
                :class="['view-switch-btn', { active: bookingView === 'all' }]"
                @click="bookingView = 'all'"
              >
                All Bookings
              </button>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="status-filter-wrapper" data-filter="booking-status">
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

          <!-- Approval Filter (Admin All Bookings only) -->
          <div v-if="isAdminAllBookingsView" class="status-filter-wrapper" data-filter="approval-status">
            <button class="status-filter-btn" @click="toggleApprovalFilter">
              {{ approvalFilterLabel }}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="arrow-icon">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div v-if="showApprovalFilter" class="status-filter-dropdown" @click.stop>
              <div class="status-filter-header">
                <span class="filter-title">Show approval:</span>
              </div>
              <div class="status-filter-body">
                <label class="status-checkbox">
                  <input type="checkbox" v-model="approvalFilters.pending" />
                  <span>Pending</span>
                </label>
                <label class="status-checkbox">
                  <input type="checkbox" v-model="approvalFilters.approved" />
                  <span>Approved</span>
                </label>
                <label class="status-checkbox">
                  <input type="checkbox" v-model="approvalFilters.rejected" />
                  <span>Rejected</span>
                </label>
                <label class="status-checkbox select-all-option">
                  <input type="checkbox" v-model="allApprovalsSelected" />
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
                <label v-for="col in columnsForTablePicker" :key="col.key" class="column-checkbox">
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
                <h3 class="card-title">{{ getCardTitle(booking) }}</h3>
                <div class="card-header-right">
                  <el-popover
                    placement="top"
                    :width="340"
                    trigger="hover"
                    :teleported="cardPopoverTeleported"
                    popper-class="booking-card-popover"
                  >
                    <template #reference>
                      <button type="button" class="card-info-btn" title="More info">i</button>
                    </template>
                    <div class="booking-popover-content">
                      <div class="booking-popover-row"><span class="popover-label">Meeting / Event</span><span class="popover-value">{{ booking.topic || '-' }}</span></div>
                      <div v-if="!isAdminAllBookingsView && canViewMyNote(booking)" class="booking-popover-row"><span class="popover-label">My Note</span><span class="popover-value">{{ booking.myNote || '-' }}</span></div>
                      <div class="booking-popover-row"><span class="popover-label">Reserved By</span><span class="popover-value">{{ booking.reservedBy || '-' }}</span></div>
                      <div class="booking-popover-row"><span class="popover-label">Contact</span><span class="popover-value">{{ booking.contact || '-' }}</span></div>
                      <div class="booking-popover-row"><span class="popover-label">Email</span><span class="popover-value">{{ booking.email || '-' }}</span></div>
                      <div class="booking-popover-row"><span class="popover-label">Tea Service</span><span class="popover-value">{{ formatTeaServiceStatus(booking) }}</span></div>
                      <div class="booking-popover-row"><span class="popover-label">Tea Special Requests</span><span class="popover-value">{{ formatTeaSpecialRequest(booking) }}</span></div>
                      <div class="booking-popover-row">
                        <span class="popover-label">Approval</span>
                        <span :class="['status-badge', 'badge-approval-' + (booking.approvalStatus || 'pending')]">
                          {{ formatStatus(booking.approvalStatus || 'pending') }}
                        </span>
                      </div>
                      <div v-if="String(booking.approvalStatus || '').toLowerCase() === 'rejected'" class="booking-popover-row">
                        <span class="popover-label">Reason</span>
                        <span class="popover-value">{{ booking.reason || booking.rejectReason || '-' }}</span>
                      </div>
                    </div>
                  </el-popover>
                  <span :class="['status-badge', 'badge-' + booking.status]">
                    {{ formatStatus(booking.status) }}
                  </span>
                </div>
              </div>
              <div class="card-body">
                <div class="card-row">
                  <span class="card-label">Room</span>
                  <span class="card-value">{{ booking.room }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Booking Date</span>
                  <span class="card-value">{{ booking.date }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Time</span>
                  <span class="card-value">{{ booking.time }}</span>
                </div>
                <div class="card-row tea-service-row">
                  <span class="card-label tea-service-label">Tea Service</span>
                  <span class="card-value tea-service-value">
                    <el-popover
                      v-if="isBookingTeaServiceYes(booking)"
                      placement="top"
                      :width="300"
                      trigger="hover"
                      :teleported="cardPopoverTeleported"
                      popper-class="booking-card-tea-popover"
                    >
                      <template #reference>
                        <span class="tea-service-card-short tea-service-card-short--yes">{{ formatTeaServiceCardLabel(booking) }}</span>
                      </template>
                      <div class="tea-service-popover-detail">
                        <div v-if="getTeaServiceSummaryText(booking)" class="tea-service-popover-line">
                          {{ getTeaServiceSummaryText(booking) }}
                        </div>
                        <div
                          v-if="formatTeaSpecialRequest(booking) !== '-'"
                          class="tea-service-popover-line tea-service-popover-special"
                        >
                          <span class="tea-service-popover-label">Special requests</span>
                          <span class="tea-service-popover-text">{{ formatTeaSpecialRequest(booking) }}</span>
                        </div>
                      </div>
                    </el-popover>
                    <span v-else class="tea-service-card-short">{{ formatTeaServiceCardLabel(booking) }}</span>
                  </span>
                </div>
                <div class="card-row">
                  <span class="card-label application-date-label">Application Date</span>
                  <span class="card-value">{{ formatApplicationDateForCard(booking.bookedOn) }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Approval</span>
                  <span :class="['status-badge', 'card-approval-badge', 'badge-approval-' + (booking.approvalStatus || 'pending')]">
                    {{ formatStatus(booking.approvalStatus || 'pending') }}
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <div
                  v-if="isAdminAllBookingsView && canShowHandleButton(booking)"
                  class="card-footer-actions"
                >
                  <button
                    type="button"
                    class="btn-action btn-edit"
                    @click="openHandleBooking(booking)"
                  >
                    Handle
                  </button>
                </div>
                <div v-else-if="!isAdminAllBookingsView" class="card-footer-actions">
                  <button type="button" class="btn-action btn-edit" @click="editBooking(booking.id)">
                    Edit
                  </button>
                  <button
                    v-if="canShowToggleBookingButton(booking)"
                    type="button"
                    :class="['btn-action', 'btn-cancel-small', { 'btn-restore-small': isBookingCanceledStatus(booking.status) }]"
                    @click="cancelBooking(booking.id)"
                  >
                    {{ isBookingCanceledStatus(booking.status) ? 'Restore' : 'Cancel' }}
                  </button>
                </div>
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
                  <th v-if="availableColumns[0].visible" class="col-datetime">
                    <button type="button" class="th-sort-btn" @click="toggleSort('dateTime')">
                      Booking Date & Time
                      <span class="sort-indicator">{{ getSortIndicator('dateTime') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[1].visible" class="col-venue">
                    <SortableFilterHeader
                      label="Venue"
                      :sort-indicator="getSortIndicator('room')"
                      :filter-active="columnFilterState.room.length > 0"
                      :options="getFilterOptions('room')"
                      :model-value="columnFilterState.room"
                      @sort-asc="setSortByMenu('room', 'asc')"
                      @sort-desc="setSortByMenu('room', 'desc')"
                      @clear-sort="clearSortByMenu('room')"
                      @update:model-value="(v) => updateFilter('room', v)"
                    />
                  </th>
                  <th v-if="availableColumns[2].visible" class="col-topic">
                    <button type="button" class="th-sort-btn" @click="toggleSort('topic')">
                      Meeting / Event
                      <span class="sort-indicator">{{ getSortIndicator('topic') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[3].visible">
                    <SortableFilterHeader
                      label="Reserved By"
                      :sort-indicator="getSortIndicator('reservedBy')"
                      :filter-active="columnFilterState.reservedBy.length > 0"
                      :options="getFilterOptions('reservedBy')"
                      :model-value="columnFilterState.reservedBy"
                      @sort-asc="setSortByMenu('reservedBy', 'asc')"
                      @sort-desc="setSortByMenu('reservedBy', 'desc')"
                      @clear-sort="clearSortByMenu('reservedBy')"
                      @update:model-value="(v) => updateFilter('reservedBy', v)"
                    />
                  </th>
                  <th v-if="availableColumns[4].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('contact')">
                      Contact No.
                      <span class="sort-indicator">{{ getSortIndicator('contact') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[5].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('email')">
                      Email
                      <span class="sort-indicator">{{ getSortIndicator('email') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[6].visible">
                    <SortableFilterHeader
                      label="Status"
                      :sort-indicator="getSortIndicator('status')"
                      :filter-active="columnFilterState.status.length > 0"
                      :options="getFilterOptions('status')"
                      :model-value="columnFilterState.status"
                      @sort-asc="setSortByMenu('status', 'asc')"
                      @sort-desc="setSortByMenu('status', 'desc')"
                      @clear-sort="clearSortByMenu('status')"
                      @update:model-value="(v) => updateFilter('status', v)"
                    />
                  </th>
                  <th v-if="availableColumns[7].visible">
                    <SortableFilterHeader
                      label="Approval"
                      :sort-indicator="getSortIndicator('approvalStatus')"
                      :filter-active="columnFilterState.approvalStatus.length > 0"
                      :options="getFilterOptions('approvalStatus')"
                      :model-value="columnFilterState.approvalStatus"
                      @sort-asc="setSortByMenu('approvalStatus', 'asc')"
                      @sort-desc="setSortByMenu('approvalStatus', 'desc')"
                      @clear-sort="clearSortByMenu('approvalStatus')"
                      @update:model-value="(v) => updateFilter('approvalStatus', v)"
                    />
                  </th>
                  <th v-if="availableColumns[8].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('bookedOn')">
                      Application Date
                      <span class="sort-indicator">{{ getSortIndicator('bookedOn') }}</span>
                    </button>
                  </th>
                  <th v-if="isMyNoteTableColumnVisible" class="col-mynote">My Note</th>
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
                  <td v-if="availableColumns[1].visible" class="col-venue">{{ booking.room }}</td>
                  <td v-if="availableColumns[2].visible" class="col-topic">{{ booking.topic }}</td>
                  <td v-if="availableColumns[3].visible">{{ booking.reservedBy }}</td>
                  <td v-if="availableColumns[4].visible">{{ booking.contact }}</td>
                  <td v-if="availableColumns[5].visible">{{ booking.email }}</td>
                  <td v-if="availableColumns[6].visible">
                    <span :class="['status-badge', 'badge-' + booking.status]">
                      {{ formatStatus(booking.status) }}
                    </span>
                  </td>
                  <td v-if="availableColumns[7].visible">
                    <span :class="['status-badge', 'badge-approval-' + (booking.approvalStatus || 'pending')]">
                      {{ formatStatus(booking.approvalStatus || 'pending') }}
                    </span>
                  </td>
                  <td v-if="availableColumns[8].visible">{{ booking.bookedOn }}</td>
                  <td v-if="isMyNoteTableColumnVisible" class="col-mynote">
                    <span class="col-mynote-text">{{ booking.myNote || '-' }}</span>
                  </td>
                  <td class="actions-td">
                    <div class="actions-cell">
                      <template v-if="isAdminAllBookingsView">
                        <button
                          v-if="canShowHandleButton(booking)"
                          type="button"
                          class="btn-action btn-edit"
                          @click="openHandleBooking(booking)"
                        >
                          Handle
                        </button>
                      </template>
                      <template v-else>
                        <button type="button" class="btn-action btn-edit" @click="editBooking(booking.id)">
                          Edit
                        </button>
                        <button
                          v-if="canShowToggleBookingButton(booking)"
                          type="button"
                          :class="['btn-action', 'btn-cancel-small', { 'btn-restore-small': isBookingCanceledStatus(booking.status) }]"
                          @click="cancelBooking(booking.id)"
                        >
                          {{ isBookingCanceledStatus(booking.status) ? 'Restore' : 'Cancel' }}
                        </button>
                      </template>
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
    <BookingStyleModal v-model="showCancelDialog" :title="cancelDialogTitle" max-width="540px">
      <p class="cancel-confirm-message">
        {{ cancelDialogMessage }}
      </p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showCancelDialog = false">No</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmCancel">{{ cancelDialogConfirmLabel }}</el-button>
      </template>
    </BookingStyleModal>

    <!-- Edit Booking Info Dialog -->
    <BookingStyleModal
      v-model="showEditDialog"
      title="Edit Booking"
      max-width="800px"
      :max-height="editBookingModalMaxHeight"
      :custom-class="editBookingModalClass"
    >
      <el-form :model="editForm" :rules="editFormRules" label-width="150px" class="edit-booking-form">
        <el-form-item label="Room / Venue" prop="room">
          <el-select
            v-model="editForm.room"
            filterable
            clearable
            default-first-option
            placeholder="Select venue"
            style="width: 100%"
            :teleported="false"
            :reserve-keyword="false"
            :filter-method="handleEditRoomFilter"
            :popper-options="editPickerPopperOptions"
            popper-class="edit-booking-room-select"
          >
            <el-option v-for="room in displayedEditableVenueOptions" :key="`edit-room-${room.name}`" :label="room.name" :value="room.name">
              <div class="edit-venue-option">
                <span class="edit-room-color-dot" :style="{ backgroundColor: room.color || '#3b82f6' }"></span>
                <span class="edit-venue-option-name">{{ room.name }}</span>
                <span class="edit-venue-option-cap">{{ formatRoomCapacity(room.roomCapacity) }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Meeting / Event" prop="topic">
          <el-input
            v-model="editForm.topic"
            type="textarea"
            :rows="2"
            placeholder="Enter meeting or event name"
            :disabled="isEditTopicLocked"
          />
        </el-form-item>
        <el-form-item label="Date" prop="date">
          <div class="field-with-availability">
            <el-date-picker
              v-model="editForm.date"
              class="field-with-availability__control"
              type="date"
              value-format="YYYY-MM-DD"
              format="DD/MM/YYYY"
              placeholder="Select booking date"
              :teleported="false"
              placement="bottom"
              popper-class="edit-booking-date-popper"
              :popper-options="editDatePopperOptions"
              style="width: 100%;"
            />
            <span v-if="editAvailabilityFieldOk.date" class="availability-ok" aria-hidden="true">✓</span>
            <span v-else-if="editAvailabilityFieldFail.date" class="availability-fail" aria-hidden="true">✕</span>
          </div>
        </el-form-item>
        <div class="form-row">
          <el-form-item label="Start Time" prop="startTime" class="form-item-half">
            <div class="field-with-availability">
              <el-select
                v-model="editForm.startTime"
                class="field-with-availability__control"
                filterable
                clearable
                placeholder="Select start time"
                style="width: 100%"
                :teleported="false"
                popper-class="edit-time-select-popper"
              >
                <el-option v-for="t in timeSlotOptions" :key="`edit-start-${t}`" :label="t" :value="t" />
              </el-select>
              <span v-if="editAvailabilityFieldOk.startTime" class="availability-ok" aria-hidden="true">✓</span>
              <span v-else-if="editAvailabilityFieldFail.startTime" class="availability-fail" aria-hidden="true">✕</span>
            </div>
          </el-form-item>
          <el-form-item label="End Time" prop="endTime" class="form-item-half">
            <div class="field-with-availability">
              <el-select
                ref="editEndTimeSelectRef"
                v-model="editForm.endTime"
                class="field-with-availability__control"
                filterable
                clearable
                placeholder="Select end time"
                style="width: 100%"
                :teleported="false"
                popper-class="edit-end-time-select-popper edit-time-select-popper"
                @visible-change="handleEditEndTimeVisibleChange"
              >
                <el-option v-for="t in editEndTimeOptions" :key="`edit-end-${t}`" :label="t" :value="t" />
              </el-select>
              <span v-if="editAvailabilityFieldOk.endTime" class="availability-ok" aria-hidden="true">✓</span>
              <span v-else-if="editAvailabilityFieldFail.endTime" class="availability-fail" aria-hidden="true">✕</span>
            </div>
          </el-form-item>
        </div>
        <el-form-item label=" " class="edit-check-availability-item">
          <el-button type="default" @click="checkEditAvailability" class="check-btn">
            CHECK AVAILABILITY
          </el-button>
        </el-form-item>
        <el-form-item label="My Note">
          <el-input v-model="editForm.myNote" type="textarea" :rows="2" placeholder="Enter your note" />
        </el-form-item>
        <el-form-item label="No. of participants" class="edit-tea-line no-wrap-label">
          <p v-if="selectedEditVenueCapacity != null" class="edit-participants-hint">
            min: 1, max: {{ selectedEditVenueCapacity }} (venue capacity)
          </p>
          <p v-else-if="editForm.room" class="edit-participants-hint">min: 1</p>
          <p v-else class="edit-participants-hint">Select a room to see capacity limit</p>
          <el-input-number v-model="editForm.teaServiceParticipants" :min="1" :max="200" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Tea Service Required?" class="edit-tea-line no-wrap-label">
          <el-radio-group v-model="editForm.teaServiceRequired">
            <el-radio :label="true">Yes</el-radio>
            <el-radio :label="false">No</el-radio>
          </el-radio-group>
        </el-form-item>
        <p v-if="editForm.teaServiceRequired && isEditTeaServiceUnavailable" class="edit-tea-service-note">
          Tea service is locked for near-date bookings. You can turn off Tea Service, but cannot change Tea/Water options.
        </p>
        <template v-if="editForm.teaServiceRequired">
          <div class="edit-tea-service-box">
            <div class="edit-tea-service-options">
              <el-form-item label="Tea or Water" class="edit-tea-line no-wrap-label">
                <el-radio-group
                  v-model="editForm.teaOrWater"
                  class="edit-tea-service-radios"
                  :disabled="isEditTeaServiceUnavailable"
                >
                  <el-radio label="tea">Tea</el-radio>
                  <el-radio label="water">Water</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label=" " class="edit-tea-line edit-tea-followup no-wrap-label">
                <el-radio-group
                  v-model="editForm.serviceType"
                  class="edit-tea-service-radios"
                  :disabled="isEditTeaServiceUnavailable"
                >
                  <el-radio label="pot">One Pot</el-radio>
                  <el-radio label="bottle">One Bottle Per Person</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item
                label="Special requests"
                class="edit-tea-line edit-tea-special-req no-wrap-label"
              >
                <el-input
                  v-model="editForm.teaServiceSpecialRequest"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  resize="none"
                  placeholder="Optional — e.g. dietary needs, serving time, extra cups"
                />
              </el-form-item>
            </div>
          </div>
        </template>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showEditDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-confirm" @click="confirmEditBooking">Save</el-button>
      </template>
    </BookingStyleModal>

    <!-- Handle Booking：All Bookings + upcoming，对齐 MeetingApproval -->
    <BookingStyleModal
      v-model="showHandleDialog"
      title="Handle Booking"
      max-width="760px"
      :max-height="handleBookingModalMaxHeight"
      custom-class="handle-booking-modal"
    >
      <el-form :model="handleForm" label-width="170px" class="handle-booking-form">
        <el-form-item label="Room / Venue">
          <el-input v-model="handleForm.room" disabled />
        </el-form-item>
        <el-form-item label="Meeting / Event Title" class="no-wrap-label">
          <el-input v-model="handleForm.topic" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Date">
          <el-input v-model="handleForm.date" disabled />
        </el-form-item>
        <el-form-item label="Time">
          <el-input v-model="handleForm.time" disabled />
        </el-form-item>
        <el-form-item label="No. of Participants" class="no-wrap-label">
          <el-input v-model="handleForm.participantCount" disabled />
        </el-form-item>
        <el-form-item label="Tea Service">
          <el-input v-model="handleForm.teaService" disabled />
        </el-form-item>
        <div class="contact-info-section">
          <el-form-item label="Name" label-width="154px">
            <el-input v-model="handleForm.userName" disabled />
          </el-form-item>
          <el-form-item label="Department" label-width="154px">
            <el-input v-model="handleForm.departmentUnit" disabled />
          </el-form-item>
          <el-form-item label="Contact No." label-width="154px">
            <el-input v-model="handleForm.contactPhone" disabled />
          </el-form-item>
          <el-form-item label="Email" label-width="154px">
            <el-input v-model="handleForm.contactEmail" disabled />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showHandleDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="openRejectBookingDialog">Reject</el-button>
        <el-button type="default" class="action-btn action-approve" @click="confirmHandleApprove">Approve</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal
      v-model="showRejectBookingDialog"
      title="Reject Booking"
      max-width="720px"
      custom-class="reject-booking-modal"
    >
      <el-form :model="rejectBookingForm" class="reject-booking-form" label-width="132px">
        <el-form-item label="Reject Template">
          <el-select
            v-model="rejectBookingForm.selectedTemplateId"
            filterable
            clearable
            default-first-option
            style="width: 100%"
            placeholder="Type template name"
            :teleported="rejectBookingSelectTeleported"
            :reserve-keyword="false"
            :filter-method="handleRejectTemplateFilter"
            popper-class="reject-booking-template-select-popper"
            :popper-style="rejectBookingSelectTeleported ? { zIndex: 10100 } : {}"
            @change="handleRejectTemplateSelectChange"
          >
            <el-option
              v-for="tpl in displayedRejectTemplateOptions"
              :key="tpl.id"
              :label="tpl.name"
              :value="tpl.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Reject Reason">
          <el-input
            v-model="rejectBookingForm.reason"
            type="textarea"
            :rows="6"
            placeholder="Reason for rejection"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="closeRejectBookingDialog">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmRejectBooking">Confirm Reject</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showNoticeDialog" :title="noticeTitle" max-width="420px">
      <p class="notice-message">{{ noticeMessage }}</p>
      <template #footer>
        <el-button type="default" class="submit-btn" @click="showNoticeDialog = false">OK</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import AppHeader from '../components/AppHeader.vue'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import SortableFilterHeader from '@/components/admin/SortableFilterHeader.vue'
import {
  getVenueManagementVenues,
  approveVenueManageBooking,
  listVenueManageBookings,
  rejectVenueManageBooking,
  toggleVenueManageBookingCancel,
  updateVenueManageBooking
} from '@/api/venueManagement'
import { checkRoomAvailability } from '@/api/calendar'
import { getPrompts } from '@/api/promptManagement'
import { useAdminStore } from '@/stores/admin'
import { notifyAdminPendingUpdated } from '@/utils/adminPendingSync'
import { HTML_ZOOM_BREAKPOINT_MQ } from '@/utils/venueCalendarApi'

const userStore = useUserStore()
const adminStore = useAdminStore()
const { isAdmin, userInfo } = storeToRefs(userStore)

const currentView = ref('card')
const bookingView = ref('my') // 'my' or 'all' - for admin to switch between personal and all bookings

/** ???? All Bookings?? upcoming ?? Handle???? Edit/Cancel */
const isAdminAllBookingsView = computed(
  () => isAdmin.value && bookingView.value === 'all'
)

/** All Bookings 表格不显示 My Note；My Bookings 仍受列筛选控制 */
const columnsForTablePicker = computed(() =>
  isAdminAllBookingsView.value
    ? availableColumns.value.filter((col) => col.key !== 'myNote')
    : availableColumns.value
)

const isMyNoteTableColumnVisible = computed(() => {
  if (isAdminAllBookingsView.value) return false
  const col = availableColumns.value.find((c) => c.key === 'myNote')
  return Boolean(col?.visible)
})
const searchQuery = ref('')
const showColumnsFilter = ref(false)
const showStatusFilter = ref(false)
const showApprovalFilter = ref(false)
const showDateFilter = ref(false)
const approvalFilters = ref({
  pending: true,
  approved: true,
  rejected: true
})
const currentPage = ref(1)
const pageSize = ref(20)
const sortState = ref([
  { key: 'dateTime', order: 'asc' }
])
const columnFilterState = ref({
  room: [],
  reservedBy: [],
  approvalStatus: [],
  status: []
})
const showCancelDialog = ref(false)
const showEditDialog = ref(false)
const cancelBookingId = ref(null)
const currentEditBookingId = ref(null)
const currentEditBookingApprovalStatus = ref('')
const editTeaSelectionSnapshot = ref({ teaOrWater: 'tea', serviceType: 'pot' })
const dateRange = ref(null)
const editEndTimeSelectRef = ref(null)

const isBookingCanceledStatus = (status) => ['canceled', 'cancelled'].includes(String(status || '').toLowerCase())

const getBookingStartDateTime = (booking) => {
  const date = parseDate(booking?.date || '')
  if (Number.isNaN(date.getTime())) return null
  const start = String(booking?.time || '').split(' - ')[0] || ''
  const [h = '0', m = '0'] = start.split(':')
  date.setHours(Number.parseInt(h, 10) || 0, Number.parseInt(m, 10) || 0, 0, 0)
  return date
}

const getBookingEndDateTime = (booking) => {
  const date = parseDate(booking?.date || '')
  if (Number.isNaN(date.getTime())) return null
  const end = String(booking?.time || '').split(' - ')[1] || ''
  const [h = '0', m = '0'] = end.split(':')
  date.setHours(Number.parseInt(h, 10) || 0, Number.parseInt(m, 10) || 0, 0, 0)
  return date
}

const canToggleBookingStatus = (booking) => {
  const startAt = getBookingStartDateTime(booking)
  if (!startAt) return false
  return startAt.getTime() > Date.now()
}

const canShowToggleBookingButton = (booking) => {
  const s = String(booking?.status || '').toLowerCase()
  return s === 'upcoming' || s === 'canceled' || s === 'cancelled'
}

const canShowHandleButton = (booking) => {
  const status = String(booking?.status || '').toLowerCase()
  const approvalStatus = String(booking?.approvalStatus || 'pending').toLowerCase()
  return status === 'upcoming' && approvalStatus === 'pending'
}

const isSameBooker = (a, b) => {
  if (a?.employeeId != null && b?.employeeId != null) return String(a.employeeId) === String(b.employeeId)
  if (a?.corpId && b?.corpId) return String(a.corpId) === String(b.corpId)
  if (a?.email && b?.email) return String(a.email).toLowerCase() === String(b.email).toLowerCase()
  return String(a?.reservedBy || '').trim().toLowerCase() === String(b?.reservedBy || '').trim().toLowerCase()
}

const isOwnBooking = (booking) => {
  const currentUserId = userInfo.value?.id
  const currentUserCorpId = userInfo.value?.corpId
  const currentUserEmail = String(userInfo.value?.email || '').trim().toLowerCase()
  if (currentUserId != null && booking?.employeeId != null) {
    return String(booking.employeeId) === String(currentUserId)
  }
  if (currentUserCorpId && booking?.corpId) {
    return String(booking.corpId) === String(currentUserCorpId)
  }
  if (currentUserEmail && booking?.email) {
    return String(booking.email).trim().toLowerCase() === currentUserEmail
  }
  return false
}

const canViewMyNote = (booking) => {
  if (!isOwnBooking(booking)) return false
  return String(booking?.myNote || '').trim().length > 0
}

const hasRestoreConflictWithOthers = (targetBooking) => {
  const targetStart = getBookingStartDateTime(targetBooking)
  const targetEnd = getBookingEndDateTime(targetBooking)
  if (!targetStart || !targetEnd) return false

  return bookings.value.some((b) => {
    if (!b || b.id === targetBooking.id) return false
    if (isBookingCanceledStatus(b.status)) return false
    if ((b.room || '') !== (targetBooking.room || '')) return false
    if ((b.date || '') !== (targetBooking.date || '')) return false
    if (isSameBooker(b, targetBooking)) return false
    const otherStart = getBookingStartDateTime(b)
    const otherEnd = getBookingEndDateTime(b)
    if (!otherStart || !otherEnd) return false
    return targetStart < otherEnd && targetEnd > otherStart
  })
}

const cancelDialogBooking = computed(() => bookings.value.find(b => b.id === cancelBookingId.value) || null)
const cancelDialogIsRestore = computed(() => isBookingCanceledStatus(cancelDialogBooking.value?.status))
const cancelDialogTitle = computed(() => (cancelDialogIsRestore.value ? 'Restore Booking' : 'Cancel Booking'))
const cancelDialogConfirmLabel = computed(() => (cancelDialogIsRestore.value ? 'Restore' : 'Confirm'))
const cancelDialogMessage = computed(() => {
  if (cancelDialogIsRestore.value) {
    return 'You may restore this booking before the meeting start time. System will check time conflict with other bookings.'
  }
  return 'You may cancel this booking now and restore it later before the meeting start time.'
})

const employeeList = ref([])
const showHandleDialog = ref(false)
const showRejectBookingDialog = ref(false)
const currentHandleBookingId = ref(null)
const showNoticeDialog = ref(false)
const noticeTitle = ref('Notice')
const noticeMessage = ref('')
const showNotice = (message, title = 'Notice') => {
  noticeTitle.value = title
  noticeMessage.value = message
  showNoticeDialog.value = true
}
const getErrorMessage = (error, fallback = 'Operation failed') => {
  const message = error?.response?.data?.message
  if (Array.isArray(message)) return message[0] || fallback
  if (typeof message === 'string' && message.trim()) return message
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return fallback
}
const handleForm = ref({
  room: '',
  topic: '',
  date: '',
  time: '',
  participantCount: '-',
  teaService: 'No',
  userName: '',
  departmentUnit: '',
  contactPhone: '',
  contactEmail: ''
})

/** 嵌套弹窗内 Reject Template 下拉：大屏挂 body，14" 视口与 MeetingApproval 一致 */
const REJECT_BOOKING_SELECT_MQ = HTML_ZOOM_BREAKPOINT_MQ
const rejectBookingSelectTeleported = ref(true)
let rejectBookingSelectMq = null

function updateRejectBookingSelectTeleported () {
  if (typeof window === 'undefined') return
  rejectBookingSelectTeleported.value = !window.matchMedia(REJECT_BOOKING_SELECT_MQ).matches
}

const rejectBookingForm = ref({
  selectedTemplateId: null,
  reason: ''
})

const rejectTemplateKeyword = ref('')

const editForm = ref({
  room: '',
  topic: '',
  myNote: '',
  date: '',
  startTime: '',
  endTime: '',
  teaServiceRequired: false,
  teaOrWater: 'tea',
  serviceType: 'pot',
  teaServiceParticipants: 1,
  teaServiceSpecialRequest: ''
})
const editFormRules = {
  room: [{ required: true, message: 'Please select room', trigger: 'change' }],
  topic: [{ required: true, message: 'Please enter topic', trigger: 'blur' }],
  date: [{ required: true, message: 'Please select date', trigger: 'change' }],
  startTime: [{ required: true, message: 'Please select start time', trigger: 'change' }],
  endTime: [{ required: true, message: 'Please select end time', trigger: 'change' }]
}

/** ??VenueBookingDialog / mock `teaServiceSummary` ???Tea|Water + One Pot|One Bottle Per Person */
function buildTeaServiceSummary (teaOrWater, serviceType) {
  const tw = teaOrWater === 'water' ? 'Water' : 'Tea'
  const svc = serviceType === 'bottle' ? 'One Bottle Per Person' : 'One Pot'
  return `${tw} / ${svc}`
}

function parseTeaServiceSummary (summary) {
  const def = { teaOrWater: 'tea', serviceType: 'pot' }
  if (!summary || typeof summary !== 'string') return def
  const idx = summary.indexOf('/')
  if (idx === -1) return def
  const left = summary.slice(0, idx).trim().toLowerCase()
  const right = summary.slice(idx + 1).trim().toLowerCase()
  const teaOrWater = left.includes('water') ? 'water' : 'tea'
  const serviceType = right.includes('bottle') ? 'bottle' : 'pot'
  return { teaOrWater, serviceType }
}

const isEditTeaServiceUnavailable = computed(() => {
  const iso = editForm.value.date
  if (!iso || typeof iso !== 'string') return false
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return false
  const selectedDate = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  selectedDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate <= today
})

const isEditTopicLocked = computed(() =>
  String(currentEditBookingApprovalStatus.value || '').toLowerCase() === 'approved'
)
const promptList = ref([])
const meetingRejectTemplateOptions = computed(() =>
  promptList.value.filter(item => item.category === 'reject_template' && item.templateType === 'meeting_approval')
)

const displayedRejectTemplateOptions = computed(() => {
  const keyword = rejectTemplateKeyword.value.trim().toLowerCase()
  const source = meetingRejectTemplateOptions.value
  if (!keyword) return source.slice(0, 12)
  return source
    .filter((tpl) =>
      String(tpl.name || '').toLowerCase().includes(keyword) ||
      String(tpl.key || '').toLowerCase().includes(keyword) ||
      String(tpl.id ?? '').includes(keyword)
    )
    .slice(0, 30)
})

function handleRejectTemplateFilter (query) {
  rejectTemplateKeyword.value = String(query || '')
}

function handleRejectTemplateSelectChange (templateId) {
  if (templateId == null || templateId === '') {
    rejectBookingForm.value.reason = ''
    return
  }
  const selectedTemplate = meetingRejectTemplateOptions.value.find(
    (item) => String(item.id) === String(templateId)
  )
  if (!selectedTemplate) {
    rejectBookingForm.value.reason = ''
    return
  }
  rejectBookingForm.value.reason = selectedTemplate.content || ''
}

watch(showRejectBookingDialog, (open) => {
  if (open) {
    rejectTemplateKeyword.value = ''
  }
})
const editableVenueMeta = ref([])
const editRoomKeyword = ref('')
const fallbackEditableVenueOptions = [
  { name: 'Conference Room 1', color: '#3b82f6', roomCapacity: null },
  { name: 'Conference Room 2', color: '#14b8a6', roomCapacity: null },
  { name: 'Conference Room 3', color: '#0ea5e9', roomCapacity: null },
  { name: 'Discussion Room', color: '#22c55e', roomCapacity: null },
  { name: 'Discussion Room 2', color: '#10b981', roomCapacity: null },
  { name: 'Function Room', color: '#ec4899', roomCapacity: null },
  { name: 'Lecture Theatre', color: '#6366f1', roomCapacity: null },
  { name: 'Auditorium', color: '#8b5cf6', roomCapacity: null }
]
const editableVenueOptions = computed(() =>
  editableVenueMeta.value.length ? editableVenueMeta.value : fallbackEditableVenueOptions
)
const displayedEditableVenueOptions = computed(() => {
  const keyword = editRoomKeyword.value.trim().toLowerCase()
  const source = editableVenueOptions.value
  if (!keyword) return source.slice(0, 20)
  return source
    .filter((room) => String(room?.name || '').toLowerCase().includes(keyword))
    .slice(0, 40)
})
const selectedEditVenueMeta = computed(() =>
  editableVenueOptions.value.find((venue) => venue.name === editForm.value.room) || null
)
const selectedEditVenueCapacity = computed(() => {
  const cap = selectedEditVenueMeta.value?.roomCapacity
  return Number.isFinite(Number(cap)) ? Number(cap) : null
})

const handleEditRoomFilter = (query) => {
  editRoomKeyword.value = String(query || '')
}

const formatRoomCapacity = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return ''
  return `cap ${n}`
}
const editAvailabilityFieldOk = ref({
  date: false,
  startTime: false,
  endTime: false
})
const editAvailabilityFieldFail = ref({
  date: false,
  startTime: false,
  endTime: false
})

const clearEditAvailabilityIndicators = () => {
  editAvailabilityFieldOk.value = {
    date: false,
    startTime: false,
    endTime: false
  }
  editAvailabilityFieldFail.value = {
    date: false,
    startTime: false,
    endTime: false
  }
}

const setEditAvailabilityPass = () => {
  editAvailabilityFieldOk.value = {
    date: true,
    startTime: true,
    endTime: true
  }
  editAvailabilityFieldFail.value = {
    date: false,
    startTime: false,
    endTime: false
  }
}

const setEditAvailabilityFail = () => {
  editAvailabilityFieldOk.value = {
    date: false,
    startTime: false,
    endTime: false
  }
  editAvailabilityFieldFail.value = {
    date: true,
    startTime: true,
    endTime: true
  }
}

const checkEditAvailability = async () => {
  clearEditAvailabilityIndicators()
  if (!editForm.value.room || !editForm.value.date || !editForm.value.startTime || !editForm.value.endTime) {
    showNotice('Please fill in Room, Date, Start Time and End Time first', 'Warning')
    return
  }
  if (editForm.value.startTime >= editForm.value.endTime) {
    showNotice('End Time must be later than Start Time', 'Warning')
    return
  }

  const venue = selectedEditVenueMeta.value
  if (!venue?.id) {
    showNotice('Room not found', 'Warning')
    return
  }

  try {
    const result = await checkRoomAvailability(
      String(venue.id),
      editForm.value.date,
      editForm.value.startTime,
      editForm.value.endTime,
      currentEditBookingId.value != null ? String(currentEditBookingId.value) : undefined
    )
    if (result?.available) {
      setEditAvailabilityPass()
    } else {
      const message = result?.message || 'Room is not available for the selected time slot'
      setEditAvailabilityFail()
      showNotice(message, 'Warning')
    }
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Availability check failed. Please try again.'
    setEditAvailabilityFail()
    showNotice(message, 'Warning')
  }
}

/** 14" html zoom 断点：卡片 Popover 挂 body 会偏移，与 style.css / MonthDayMorePopover 一致 */
const cardPopoverTeleported = ref(true)
let cardPopoverTeleportedMq = null

function updateCardPopoverTeleported () {
  if (typeof window === 'undefined') return
  cardPopoverTeleported.value = !window.matchMedia(HTML_ZOOM_BREAKPOINT_MQ).matches
}

/** 14" ????100??599??Handle Booking ?????? MeetingApproval ???*/
const HANDLE_BOOKING_MODAL_MQ = HTML_ZOOM_BREAKPOINT_MQ
const handleBookingModalMaxHeight = ref('94vh')
const editBookingModalMaxHeight = ref('98vh')
/** Tea Service 为 Yes 时整段表单在 modal-body 内统一滚动 */
const editBookingModalClass = computed(() =>
  editForm.value.teaServiceRequired
    ? 'edit-booking-modal edit-booking-modal--unified-scroll'
    : 'edit-booking-modal'
)
const editPickerOffsetY = ref(0)
const editPickerPopperOptions = computed(() => ({
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, editPickerOffsetY.value]
      }
    }
  ]
}))
const editDatePopperOptions = computed(() => ({
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, editPickerOffsetY.value]
      }
    },
    {
      name: 'flip',
      options: {
        fallbackPlacements: []
      }
    }
  ]
}))

function updateHandleBookingModalMaxHeight () {
  if (typeof window === 'undefined') return
  const isLaptop14 = window.matchMedia(HANDLE_BOOKING_MODAL_MQ).matches
  handleBookingModalMaxHeight.value = isLaptop14 ? '120vh' : '94vh'
  // 14??zoom:0.8????????????modal body ????
  editBookingModalMaxHeight.value = isLaptop14 ? '112vh' : '98vh'
  editPickerOffsetY.value = 0
}

let handleBookingModalMq = null

// Status filters (multi-select)
const statusFilters = ref({
  upcoming: true,
  past: false,
  canceled: false
})

// Available columns for table view
const availableColumns = ref([
  { key: 'datetime', label: 'Date & Time', visible: true, required: true },
  { key: 'room', label: 'Venue', visible: true, required: false },
  { key: 'topic', label: 'Meeting / Event', visible: true, required: false },
  { key: 'reservedBy', label: 'Reserved By', visible: true, required: false },
  { key: 'contact', label: 'Contact No.', visible: true, required: false },
  { key: 'email', label: 'Email', visible: true, required: false },
  { key: 'status', label: 'Status', visible: true, required: false },
  { key: 'approvalStatus', label: 'Approval', visible: true, required: false },
  { key: 'bookedOn', label: 'Application Date', visible: true, required: false },
  { key: 'myNote', label: 'My Note', visible: true, required: false }
])

const bookings = ref([])
const bookingsLoading = ref(false)

const filteredBookings = computed(() => {
  let result = bookings.value

  // Filter by booking view (admin only)
  if (isAdmin.value && bookingView.value === 'my') {
    // ??????id ?????? mock ??? corpId / email
    const currentUserId = userInfo.value?.id
    const currentUserCorpId = userInfo.value?.corpId
    const currentUserEmail = userInfo.value?.email || 'karen.shen@ha.org.hk'
    result = result.filter((b) => {
      if (currentUserId != null && b.employeeId != null) return String(b.employeeId) === String(currentUserId)
      if (currentUserCorpId && b.corpId) return String(b.corpId) === String(currentUserCorpId)
      return (b.email || '') === currentUserEmail
    })
  }
  // If bookingView is 'all' or user is not admin, show all bookings

  // Filter by status (multi-select)
  const activeStatuses = Object.keys(statusFilters.value).filter(key => statusFilters.value[key])
  if (activeStatuses.length > 0 && activeStatuses.length < 3) {
    result = result.filter(b => activeStatuses.includes(b.status))
  }

  // Admin all bookings: filter by approval status (multi-select)
  if (isAdminAllBookingsView.value) {
    const activeApprovals = Object.keys(approvalFilters.value).filter((key) => approvalFilters.value[key])
    if (activeApprovals.length > 0 && activeApprovals.length < 3) {
      result = result.filter((b) =>
        activeApprovals.includes(String(b.approvalStatus || 'pending').toLowerCase())
      )
    }
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

  // Column filter (table headers)
  if (columnFilterState.value.room.length) {
    const selected = new Set(columnFilterState.value.room)
    result = result.filter((b) => selected.has(b.room || ''))
  }
  if (columnFilterState.value.reservedBy.length) {
    const selected = new Set(columnFilterState.value.reservedBy)
    result = result.filter((b) => selected.has(b.reservedBy || ''))
  }
  if (columnFilterState.value.approvalStatus.length) {
    const selected = new Set(columnFilterState.value.approvalStatus)
    result = result.filter((b) => selected.has(b.approvalStatus || 'pending'))
  }
  if (columnFilterState.value.status.length) {
    const selected = new Set(columnFilterState.value.status)
    result = result.filter((b) => selected.has(b.status || ''))
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

const parseBookedOnDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return new Date(0)
  const parts = dateTimeStr.split(' ')
  if (parts.length < 4) return parseDate(dateTimeStr)
  const datePart = `${parts[0]} ${parts[1]} ${parts[2]}`
  const [h = '0', m = '0'] = (parts[3] || '').split(':')
  const date = parseDate(datePart)
  date.setHours(Number.parseInt(h, 10) || 0, Number.parseInt(m, 10) || 0, 0, 0)
  return date
}

const parseStartMinutes = (timeRange) => {
  const start = (timeRange || '').split(' - ')[0] || ''
  const [h = '0', m = '0'] = start.split(':')
  return (Number.parseInt(h, 10) || 0) * 60 + (Number.parseInt(m, 10) || 0)
}

const parseDisplayDateToIso = (dateStr) => {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  return Number.isNaN(date.getTime()) ? '' : formatDateToString(date)
}

const formatIsoDateToDisplay = (isoDate) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.getDate()
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

const buildHalfHourTimeOptions = (start = '07:00', end = '21:00', stepMinutes = 30) => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startM = sh * 60 + sm
  const endM = eh * 60 + em
  const list = []
  for (let m = startM; m <= endM; m += stepMinutes) {
    const h = Math.floor(m / 60)
    const mi = m % 60
    list.push(`${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`)
  }
  return list
}

const timeSlotOptions = buildHalfHourTimeOptions()
const editEndTimeOptions = computed(() => {
  const start = editForm.value.startTime
  if (!start) return timeSlotOptions
  return timeSlotOptions.filter(t => t > start)
})

const handleEditEndTimeVisibleChange = async (visible) => {
  if (!visible || !editForm.value.startTime) return
  await nextTick(() => {
    requestAnimationFrame(() => {
      const select = editEndTimeSelectRef.value
      const popperEl = select?.popperRef?.contentRef
      const wrap =
        popperEl?.querySelector?.('.el-scrollbar__wrap') ??
        document.querySelector('.edit-end-time-select-popper .el-scrollbar__wrap')
      if (!wrap) return

      const items = wrap.querySelectorAll('.el-select-dropdown__item')
      const start = editForm.value.startTime
      for (const el of items) {
        const label = (el.querySelector('span')?.textContent || el.textContent || '').trim()
        if (label === start) {
          wrap.scrollTop = Math.max(0, el.offsetTop - 4)
          return
        }
      }
    })
  })
}

const getSortValue = (booking, key) => {
  switch (key) {
    case 'dateTime':
      return parseDate(booking.date).getTime() * 10000 + parseStartMinutes(booking.time)
    case 'room':
      return booking.room || ''
    case 'topic':
      return booking.topic || ''
    case 'reservedBy':
      return booking.reservedBy || ''
    case 'contact':
      return booking.contact || ''
    case 'email':
      return booking.email || ''
    case 'approvalStatus':
      return booking.approvalStatus || 'pending'
    case 'status':
      return booking.status || ''
    case 'bookedOn':
      return parseBookedOnDateTime(booking.bookedOn).getTime()
    default:
      return ''
  }
}

const sortedBookings = computed(() => {
  if (!sortState.value.length) return filteredBookings.value.slice()
  return filteredBookings.value.slice().sort((a, b) => {
    for (const criterion of sortState.value) {
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
})

const toggleSort = (key) => {
  const idx = sortState.value.findIndex(item => item.key === key)
  if (idx === -1) {
    sortState.value.push({ key, order: 'asc' })
  } else if (sortState.value[idx].order === 'asc') {
    sortState.value[idx].order = 'desc'
  } else {
    sortState.value.splice(idx, 1)
  }
  currentPage.value = 1
}

const getSortIndicator = (key) => {
  const idx = sortState.value.findIndex(item => item.key === key)
  if (idx === -1) return '↕'
  const arrow = sortState.value[idx].order === 'asc' ? '↑' : '↓'
  return `${arrow}${idx + 1}`
}

const setSortByMenu = (key, order) => {
  const idx = sortState.value.findIndex(item => item.key === key)
  if (idx === -1) {
    sortState.value.push({ key, order })
  } else {
    sortState.value[idx].order = order
  }
  currentPage.value = 1
}

const clearSortByMenu = (key) => {
  sortState.value = sortState.value.filter(item => item.key !== key)
  currentPage.value = 1
}

const getFilterOptions = (key) => {
  const map = new Map()
  for (const booking of bookings.value) {
    let value = ''
    if (key === 'room') value = booking.room || ''
    if (key === 'reservedBy') value = booking.reservedBy || ''
    if (key === 'approvalStatus') value = booking.approvalStatus || 'pending'
    if (key === 'status') value = booking.status || ''
    if (!value) continue
    if (!map.has(value)) map.set(value, String(value).toLowerCase())
  }
  return [...map.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], undefined, { sensitivity: 'base' }))
    .map(([value]) => value)
}

const updateFilter = (key, value) => {
  columnFilterState.value[key] = Array.isArray(value) ? [...value] : []
  currentPage.value = 1
}

// Status filter label
const statusFilterLabel = computed(() => {
  const activeStatuses = Object.keys(statusFilters.value).filter(key => statusFilters.value[key])
  if (activeStatuses.length === 3) {
    return 'All Status'
  } else if (activeStatuses.length === 0) {
    return 'No status selected'
  } else if (activeStatuses.length === 1) {
    return formatStatus(activeStatuses[0])
  } else {
    return `${activeStatuses.length} statuses`
  }
})

const approvalFilterLabel = computed(() => {
  const activeApprovals = Object.keys(approvalFilters.value).filter((key) => approvalFilters.value[key])
  if (activeApprovals.length === 3) {
    return 'All Approval'
  }
  if (activeApprovals.length === 0) {
    return 'No approval selected'
  }
  if (activeApprovals.length === 1) {
    return formatStatus(activeApprovals[0])
  }
  return `${activeApprovals.length} approvals`
})

const allApprovalsSelected = computed({
  get: () => Object.values(approvalFilters.value).every(Boolean),
  set: (checked) => {
    approvalFilters.value = {
      pending: checked,
      approved: checked,
      rejected: checked
    }
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
  get: () => columnsForTablePicker.value.every((col) => col.visible),
  set: (checked) => {
    columnsForTablePicker.value.forEach((col) => {
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
const totalPages = computed(() => Math.ceil(sortedBookings.value.length / pageSize.value))

const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, sortedBookings.value.length))

const paginatedBookings = computed(() => {
  return sortedBookings.value.slice(startIndex.value, endIndex.value)
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
watch([statusFilters, approvalFilters, searchQuery, dateRange, columnFilterState], () => {
  currentPage.value = 1
}, { deep: true })

watch(() => editForm.value.startTime, (start) => {
  clearEditAvailabilityIndicators()
  if (!start) {
    editForm.value.endTime = ''
    return
  }
  const currentEnd = editForm.value.endTime
  if (currentEnd && currentEnd > start) return
  const next = timeSlotOptions.find(t => t > start) || ''
  editForm.value.endTime = next
})

watch(
  () => [editForm.value.room, editForm.value.date, editForm.value.startTime, editForm.value.endTime],
  () => {
    clearEditAvailabilityIndicators()
  }
)

// Format status to capitalize first letter
const formatStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getCardTitle = (booking) => {
  const isMyBookingsView = !isAdminAllBookingsView.value
  const note = String(booking?.myNote || '').trim()
  if (isMyBookingsView && canViewMyNote(booking) && note) {
    return note
  }
  return booking?.title || booking?.topic || '-'
}

const isBookingTeaServiceYes = (booking) => {
  if (booking?.teaServiceRequired === true) return true
  return Boolean(String(booking?.teaServiceSummary || '').trim())
}

/** 卡片视图：仅显示 Yes (人数) / No */
const formatTeaServiceCardLabel = (booking) => {
  if (!isBookingTeaServiceYes(booking)) return 'No'
  const count = booking.teaServiceParticipants ?? booking.attendeeCount ?? booking.participants
  const n = Number(count)
  return Number.isFinite(n) ? `Yes (${n})` : 'Yes'
}

const getTeaServiceSummaryText = (booking) => {
  const summary = String(booking?.teaServiceSummary || '').trim()
  if (summary) return summary
  if (booking?.teaServiceRequired === true) return 'Tea service required'
  return ''
}

const formatTeaServiceStatus = (booking) => {
  if (booking?.teaService && typeof booking.teaService === 'object') {
    const beverages = booking.teaService.beverages
    if (beverages) return String(beverages)
    return 'Required'
  }
  const count = booking.teaServiceParticipants ?? booking.attendeeCount ?? booking.participants
  const countSuffix = Number.isFinite(Number(count)) ? ` (${count})` : ''
  if (booking.teaServiceSummary) return `${booking.teaServiceSummary}${countSuffix}`
  if (booking.teaServiceRequired === true) return `Required${countSuffix}`
  return 'No'
}

const formatTeaSpecialRequest = (booking) => {
  const direct = String(booking?.teaServiceSpecialRequest || '').trim()
  if (direct) return direct
  let teaServiceObj = booking?.teaService
  if (typeof teaServiceObj === 'string') {
    try {
      teaServiceObj = JSON.parse(teaServiceObj)
    } catch {
      teaServiceObj = null
    }
  }
  const fromTeaService = String(teaServiceObj?.notes || '').trim()
  if (fromTeaService) return fromTeaService
  return '-'
}

const formatApplicationDateForCard = (bookedOn) => {
  if (!bookedOn) return ''
  const text = String(bookedOn).trim()
  const parts = text.split(/\s+/)
  if (parts.length >= 3) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`
  }
  return text
}

// Toggle status filter
const toggleStatusFilter = (event) => {
  event.stopPropagation()
  showApprovalFilter.value = false
  document.removeEventListener('click', handleApprovalFilterClickOutside)
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
  const wrapper = document.querySelector('[data-filter="booking-status"]')
  if (!wrapper?.contains(event.target)) {
    showStatusFilter.value = false
    document.removeEventListener('click', handleStatusFilterClickOutside)
  }
}

const toggleApprovalFilter = (event) => {
  event.stopPropagation()
  showStatusFilter.value = false
  document.removeEventListener('click', handleStatusFilterClickOutside)
  showApprovalFilter.value = !showApprovalFilter.value
  if (showApprovalFilter.value) {
    setTimeout(() => {
      document.addEventListener('click', handleApprovalFilterClickOutside, { once: false })
    }, 0)
  } else {
    document.removeEventListener('click', handleApprovalFilterClickOutside)
  }
}

const handleApprovalFilterClickOutside = (event) => {
  const wrapper = document.querySelector('[data-filter="approval-status"]')
  if (!wrapper?.contains(event.target)) {
    showApprovalFilter.value = false
    document.removeEventListener('click', handleApprovalFilterClickOutside)
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
      document.addEventListener('mousedown', handleDateFilterClickOutside, true)
    }, 0)
  } else {
    document.removeEventListener('mousedown', handleDateFilterClickOutside, true)
  }
}

// Click outside to close date filter
const handleDateFilterClickOutside = (event) => {
  const target = event.target
  const dropdown = document.querySelector('.date-filter-dropdown')
  const filterWrapper = target.closest('.date-filter-wrapper')
  const inDatePicker = !!target.closest('.el-picker__popper')
  const path = typeof event.composedPath === 'function' ? event.composedPath() : []
  const inDropdownPath = dropdown ? path.includes(dropdown) : false

  if (!inDatePicker && !filterWrapper && !inDropdownPath) {
    showDateFilter.value = false
    document.removeEventListener('mousedown', handleDateFilterClickOutside, true)
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
  const booking = bookings.value.find(b => b.id === id)
  if (!booking) return
  if (!canToggleBookingStatus(booking)) {
    showNotice('Only bookings before meeting start time can be cancelled/restored.', 'Warning')
    return
  }
  cancelBookingId.value = id
  showCancelDialog.value = true
}

const confirmCancel = async () => {
  const booking = bookings.value.find(b => b.id === cancelBookingId.value)
  if (!booking) return
  if (!canToggleBookingStatus(booking)) {
    showCancelDialog.value = false
    showNotice('Only bookings before meeting start time can be cancelled/restored.', 'Warning')
    return
  }

  try {
    await toggleVenueManageBookingCancel(String(booking.id))
    await loadBookings()
    showCancelDialog.value = false
    showNotice(
      isBookingCanceledStatus(booking.status)
        ? 'Venue booking restored successfully!'
        : 'Venue booking cancelled successfully! You can restore it before meeting start time.',
      'Success'
    )
  } catch (error) {
    showNotice(getErrorMessage(error, 'Failed to update booking status'), 'Error')
  }
}

const editBooking = (id) => {
  const booking = bookings.value.find(b => b.id === id)
  if (!booking) return
  const [startTime = '', endTime = ''] = String(booking.time || '').split(' - ')
  currentEditBookingId.value = id
  currentEditBookingApprovalStatus.value = booking.approvalStatus || ''
  const teaParsed = parseTeaServiceSummary(booking.teaServiceSummary || '')
  editTeaSelectionSnapshot.value = {
    teaOrWater: teaParsed.teaOrWater,
    serviceType: teaParsed.serviceType
  }
  editForm.value = {
    room: booking.room || '',
    topic: booking.topic || '',
    myNote: booking.myNote || booking.note || booking.remark || '',
    date: parseDisplayDateToIso(booking.date),
    startTime: startTime.trim(),
    endTime: endTime.trim(),
    teaServiceRequired: Boolean(booking.teaServiceRequired || booking.teaServiceSummary),
    teaOrWater: teaParsed.teaOrWater,
    serviceType: teaParsed.serviceType,
    teaServiceParticipants: booking.teaServiceParticipants || 1,
    teaServiceSpecialRequest: formatTeaSpecialRequest(booking) === '-' ? '' : formatTeaSpecialRequest(booking)
  }
  showEditDialog.value = true
}

const confirmEditBooking = async () => {
  const id = currentEditBookingId.value
  if (id == null) return
  if (!editForm.value.topic.trim()) {
    showNotice('Please enter Meeting / Event', 'Warning')
    return
  }
  if (!editForm.value.date) {
    showNotice('Please select Booking Date', 'Warning')
    return
  }
  if (!editForm.value.startTime || !editForm.value.endTime) {
    showNotice('Please select Start Time and End Time', 'Warning')
    return
  }
  if (editForm.value.startTime >= editForm.value.endTime) {
    showNotice('End Time must be later than Start Time', 'Warning')
    return
  }
  if (
    editForm.value.teaServiceRequired &&
    isEditTeaServiceUnavailable.value &&
    (
      editForm.value.teaOrWater !== editTeaSelectionSnapshot.value.teaOrWater ||
      editForm.value.serviceType !== editTeaSelectionSnapshot.value.serviceType
    )
  ) {
    showNotice('Near-date bookings cannot change Tea/Water options. You can only cancel Tea Service.', 'Warning')
    return
  }
  try {
    await updateVenueManageBooking(String(id), {
      room: editForm.value.room,
      topic: editForm.value.topic.trim(),
      myNote: editForm.value.myNote?.trim() || '',
      date: editForm.value.date,
      startTime: editForm.value.startTime,
      endTime: editForm.value.endTime,
      teaServiceRequired: Boolean(editForm.value.teaServiceRequired),
      teaOrWater: editForm.value.teaOrWater,
      serviceType: editForm.value.serviceType,
      teaServiceParticipants: editForm.value.teaServiceParticipants || 1,
      teaServiceSpecialRequest: editForm.value.teaServiceSpecialRequest?.trim() || ''
    })
    await loadBookings()
    showEditDialog.value = false
    currentEditBookingId.value = null
    currentEditBookingApprovalStatus.value = ''
    editTeaSelectionSnapshot.value = { teaOrWater: 'tea', serviceType: 'pot' }
    showNotice('Booking updated successfully', 'Success')
  } catch (error) {
    showNotice(getErrorMessage(error, 'Failed to update booking'), 'Error')
  }
}

function openHandleBooking (booking) {
  if (booking.status !== 'upcoming') return
  currentHandleBookingId.value = booking.id
  const name = booking.reservedBy || ''
  const matched = employeeList.value.find(
    (e) => e.name === name || (e.name && name && e.name.toLowerCase() === name.toLowerCase())
  )
  handleForm.value = {
    room: booking.room || '',
    topic: booking.topic || '',
    date: booking.date || '',
    time: booking.time || '',
    participantCount: booking.teaServiceParticipants
      ?? booking.attendeeCount
      ?? booking.participants
      ?? booking.teaService?.attendees
      ?? '-',
    teaService: formatTeaServiceStatus(booking),
    userName: booking.reservedBy || '',
    departmentUnit: matched?.department || '-',
    contactPhone: booking.contact || '-',
    contactEmail: booking.email || '-'
  }
  showHandleDialog.value = true
}

function openRejectBookingDialog () {
  if (currentHandleBookingId.value == null) return
  rejectBookingForm.value.selectedTemplateId = null
  rejectBookingForm.value.reason = ''
  showRejectBookingDialog.value = true
}

function closeRejectBookingDialog () {
  showRejectBookingDialog.value = false
}

async function confirmHandleApprove () {
  const id = currentHandleBookingId.value
  if (id == null) return
  try {
    await approveVenueManageBooking(String(id), { topic: handleForm.value.topic.trim() })
    showHandleDialog.value = false
    currentHandleBookingId.value = null
    await loadBookings()
    await adminStore.fetchPendingCounts()
    notifyAdminPendingUpdated({ source: 'bookings' })
    showNotice('Booking approved successfully', 'Success')
  } catch (error) {
    showNotice(getErrorMessage(error, 'Failed to approve booking'), 'Error')
  }
}

async function confirmRejectBooking () {
  if (!rejectBookingForm.value.reason.trim()) {
    showNotice('Please provide a reason for rejection', 'Warning')
    return
  }
  const id = currentHandleBookingId.value
  if (id == null) return
  try {
    await rejectVenueManageBooking(String(id), {
      topic: handleForm.value.topic.trim(),
      reason: rejectBookingForm.value.reason.trim()
    })
    showRejectBookingDialog.value = false
    showHandleDialog.value = false
    currentHandleBookingId.value = null
    await loadBookings()
    await adminStore.fetchPendingCounts()
    notifyAdminPendingUpdated({ source: 'bookings' })
    showNotice('Booking rejected', 'Success')
  } catch (error) {
    showNotice(getErrorMessage(error, 'Failed to reject booking'), 'Error')
  }
}

const loadBookings = async () => {
  bookingsLoading.value = true
  try {
    const scope = isAdmin.value && bookingView.value === 'all' ? 'all' : 'my'
    const data = await listVenueManageBookings(scope)
    bookings.value = Array.isArray(data?.bookings) ? data.bookings : []
  } catch (error) {
    bookings.value = []
    showNotice(getErrorMessage(error, 'Failed to load venue bookings'), 'Error')
  } finally {
    bookingsLoading.value = false
  }
}

const loadRejectPrompts = async () => {
  try {
    const data = await getPrompts({ category: 'reject_template' })
    promptList.value = Array.isArray(data) ? data : []
  } catch {
    promptList.value = []
  }
}

const loadEditableVenues = async () => {
  try {
    const venues = await getVenueManagementVenues()
    editableVenueMeta.value = Array.isArray(venues)
      ? venues
        .filter((v) => String(v?.status || '').toLowerCase() !== 'inactive')
        .map((v) => ({
          id: v?.id,
          name: String(v?.name || '').trim(),
          color: String(v?.color || '#3b82f6').trim() || '#3b82f6',
          roomCapacity: v?.roomCapacity ?? null
        }))
        .filter((v) => v.name)
      : []
  } catch {
    editableVenueMeta.value = []
  }
}

watch(bookingView, () => {
  if (isAdmin.value) {
    void loadBookings()
  }
})

onMounted(() => {
  updateHandleBookingModalMaxHeight()
  updateRejectBookingSelectTeleported()
  updateCardPopoverTeleported()
  handleBookingModalMq = window.matchMedia(HANDLE_BOOKING_MODAL_MQ)
  handleBookingModalMq.addEventListener('change', updateHandleBookingModalMaxHeight)
  rejectBookingSelectMq = window.matchMedia(REJECT_BOOKING_SELECT_MQ)
  rejectBookingSelectMq.addEventListener('change', updateRejectBookingSelectTeleported)
  cardPopoverTeleportedMq = window.matchMedia(HTML_ZOOM_BREAKPOINT_MQ)
  cardPopoverTeleportedMq.addEventListener('change', updateCardPopoverTeleported)
  void loadBookings()
  void loadRejectPrompts()
  void loadEditableVenues()
})

onUnmounted(() => {
  if (handleBookingModalMq) {
    handleBookingModalMq.removeEventListener('change', updateHandleBookingModalMaxHeight)
  }
  if (rejectBookingSelectMq) {
    rejectBookingSelectMq.removeEventListener('change', updateRejectBookingSelectTeleported)
  }
  if (cardPopoverTeleportedMq) {
    cardPopoverTeleportedMq.removeEventListener('change', updateCardPopoverTeleported)
  }
  document.removeEventListener('mousedown', handleDateFilterClickOutside, true)
  document.removeEventListener('click', handleApprovalFilterClickOutside)
})
</script>

<style scoped>
.page {
  height: var(--zoom-vh);
  background: linear-gradient(135deg, #f8ecdd 0%, #f5e6d3 50%, #f8ecdd 100%);
  position: relative;
}

.toolbar {
  flex-shrink: 0;
}

/* Admin View Switcher */
.view-switcher-wrapper {
  position: relative;
}

.view-switcher {
  display: inline-flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.view-switch-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.view-switch-btn:hover {
  color: #374151;
}

.view-switch-btn.active {
  background: #ffffff;
  color: #00723a;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.date-range-picker {
  width: 100%;
}

.date-range-picker :deep(.el-date-editor) {
  width: 100%;
  border: 2px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.date-range-picker :deep(.el-date-editor:hover) {
  border-color: #00723a;
}

.date-range-picker :deep(.el-date-editor.is-active) {
  border-color: #00723a;
  box-shadow: 0 0 0 3px rgba(0, 114, 58, 0.1);
}

.date-range-picker :deep(.el-date-editor .el-range-input) {
  font-size: 0.8125rem;
  color: #111827;
}

.date-range-picker :deep(.el-date-editor .el-range-separator) {
  font-size: 0.75rem;
  color: #00723a;
  font-weight: 600;
}

.date-range-picker :deep(.el-date-editor .el-range__icon) {
  color: #00723a;
}

.date-range-picker :deep(.el-date-editor .el-range__close-icon) {
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

/* teleported=false：浮层留在 zoom 后的 DOM 内，提高层级避免被卡片网格遮挡 */
.booking-card-popover.el-popper,
.booking-card-tea-popover.el-popper {
  z-index: 100;
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

.card-header-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.card-info-btn {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.card-info-btn:hover {
  color: #00723a;
  border-color: #00723a;
}

.booking-popover-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.75rem;
}

.booking-popover-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  align-items: flex-start;
  gap: 0.5rem;
}

.booking-popover-row .popover-label {
  color: #6b7280;
  white-space: nowrap;
}

.booking-popover-row .popover-value {
  color: #000 !important;
  text-align: right;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-weight: 400;
  min-width: 0;
}

.booking-popover-row .status-badge {
  justify-self: end;
}

.card-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.status-badge {
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
  display: inline-block;
  width: 4.5rem;
  box-sizing: border-box;
  text-align: center;
}

.card-approval-badge {
  padding: 0.125rem 0.4375rem;
  font-size: 0.625rem;
  width: auto;
  min-width: 4rem;
}

.badge-upcoming {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-past {
  background-color: #e5e7eb;
  color: #4b5563;
}

.badge-canceled {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-approval-approved {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-approval-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.badge-approval-pending {
  background-color: #fef3c7;
  color: #92400e;
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

.tea-service-label {
  white-space: nowrap;
}

.application-date-label {
  white-space: nowrap;
}

.tea-service-value {
  margin-left: 0.5rem;
}

.tea-service-card-short {
  white-space: nowrap;
}

.tea-service-card-short--yes {
  cursor: help;
  border-bottom: 1px dotted #9ca3af;
}

.tea-service-popover-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.45;
  color: #111827;
}

.tea-service-popover-line {
  margin: 0;
}

.tea-service-popover-special {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tea-service-popover-label {
  color: #6b7280;
  font-weight: 600;
}

.tea-service-popover-text {
  word-break: break-word;
}

/* Edit dialog ??tea options aligned with VenueBookingDialog.vue */
.edit-tea-service-note {
  margin: 0 0 0.5rem 0;
  font-size: 0.8125rem;
  color: #b45309;
  line-height: 1.4;
}

.edit-booking-form {
  max-width: 720px;
  margin: 0 auto;
}

.edit-booking-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.edit-booking-form :deep(.el-form-item__label) {
  white-space: nowrap;
  padding-left: 20px;
  justify-content: flex-end;
}

.edit-venue-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.edit-venue-option-name {
  color: #111827;
}

.edit-venue-option-cap {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6b7280;
}

.edit-room-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 1px rgba(107, 114, 128, 0.35);
  flex-shrink: 0;
}

:deep(.edit-booking-room-select .el-select-dropdown__item) {
  height: 34px;
  line-height: 34px;
}

:deep(.edit-time-select-popper .el-select-dropdown__item) {
  font-variant-numeric: tabular-nums;
}

.edit-booking-form :deep(.form-row .el-form-item__content) {
  overflow: visible;
}

.edit-booking-form :deep(.el-date-editor .el-input__wrapper) {
  box-shadow: 0 0 0 1px #d1d5db inset !important;
}

.edit-booking-form :deep(.el-date-editor .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #9ca3af inset !important;
}

.field-with-availability {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.field-with-availability__control {
  flex: 1;
  min-width: 0;
}

.field-with-availability__control.el-date-editor {
  width: 100%;
}

.availability-ok,
.availability-fail {
  width: 20px;
  min-width: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
}

.availability-ok {
  color: #16a34a;
}

.availability-fail {
  color: #dc2626;
}

.edit-check-availability-item {
  margin-bottom: 10px;
}

.check-btn {
  width: 100%;
  background-color: #3b82f6;
  border-color: #3b82f6;
  font-weight: 700;
  font-size: 0.8125rem;
  color: #ffffff;
}

.check-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: #ffffff;
}

.edit-tea-service-box {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 0.75rem 0.25rem 0.75rem;
  margin-bottom: 0.5rem;
}

.edit-tea-service-options {
  margin-bottom: 0.25rem;
}

.edit-participants-hint {
  margin: 0 0 0.25rem 0;
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.2;
}

.edit-tea-line :deep(.el-form-item__label) {
  justify-content: flex-end;
  text-align: right;
  white-space: nowrap;
}

.edit-tea-line :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.edit-tea-followup :deep(.el-form-item__label) {
  width: 150px !important;
}

.edit-tea-service-radios {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1.25rem;
  row-gap: 0;
  justify-content: stretch;
  width: 100%;
  max-width: 36rem;
}

.edit-tea-service-radios :deep(.el-radio) {
  margin-right: 0;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-height: 24px;
  margin-top: auto;
}

.card-footer-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.card-footer > .btn-action,
.card-footer-actions .btn-action {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
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

.btn-restore {
  background: #9ca3af;
}

.btn-restore:hover {
  background: #6b7280;
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
  width: max-content;
  min-width: 100%;
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

.th-sort-btn {
  border: none;
  background: transparent;
  padding: 0;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  color: inherit;
  font-weight: inherit;
  font-size: inherit;
  cursor: pointer;
}

.sort-indicator {
  font-size: 11px;
  color: #6b7280;
  line-height: 1;
}

.bookings-table th.col-venue,
.bookings-table td.col-venue {
  min-width: 200px;
  white-space: nowrap;
}

.bookings-table th.col-topic,
.bookings-table td.col-topic {
  min-width: 240px;
}

.bookings-table td.col-topic {
  word-break: break-word;
}

.bookings-table th.col-mynote,
.bookings-table td.col-mynote {
  width: 260px;
  min-width: 220px;
  max-width: 280px;
  box-sizing: border-box;
}

.bookings-table td.col-mynote {
  vertical-align: top;
}

.col-mynote-text {
  display: block;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.35;
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

.btn-restore-small {
  background-color: #9ca3af;
}

.btn-restore-small:hover {
  background-color: #6b7280;
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

.edit-info-message {
  margin: 0;
  color: #374151;
  font-size: 0.9375rem;
  line-height: 1.5;
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

/* Handle Booking ???? MeetingApproval ????*/
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

.action-confirm {
  background-color: #00723a !important;
}

.action-confirm:hover {
  background-color: #005a2e !important;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-item-half {
  margin-bottom: 0;
}

.form-item-half.no-label-desktop :deep(.el-form-item__label) {
  display: none;
}

.form-item-half.no-label-desktop :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

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

.handle-booking-form :deep(.no-wrap-label .el-form-item__label) {
  white-space: nowrap;
}

.reject-booking-form :deep(.el-form-item__label) {
  white-space: nowrap;
  padding-right: 8px;
}

.notice-message {
  margin: 0;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}
</style>

<!-- Edit Booking 日期面板：箭头相对日历顶部居中 -->
<style>
.edit-booking-date-popper.el-picker__popper[data-popper-placement^='bottom'] .el-popper__arrow {
  left: 50% !important;
  right: auto !important;
  transform: translateX(-50%) !important;
}

/* EP2：popper-class 在 .el-select-dropdown 上，max-height 须作用在内部滚动层 */
.edit-time-select-popper.el-select-dropdown,
.edit-end-time-select-popper.el-select-dropdown {
  overflow: hidden;
}

.edit-time-select-popper.el-select-dropdown .el-select-dropdown__wrap,
.edit-end-time-select-popper.el-select-dropdown .el-select-dropdown__wrap {
  max-height: 260px !important;
}

.edit-time-select-popper.el-select-dropdown .el-scrollbar__wrap,
.edit-end-time-select-popper.el-select-dropdown .el-scrollbar__wrap {
  max-height: 260px !important;
}

.edit-time-select-popper.el-select-dropdown .el-select-dropdown__list,
.edit-end-time-select-popper.el-select-dropdown .el-select-dropdown__list {
  padding-bottom: 6px;
}

.reject-booking-template-select-popper.el-select-dropdown .el-select-dropdown__wrap {
  max-height: min(42vh, 300px) !important;
}

.reject-booking-template-select-popper.el-select-dropdown .el-scrollbar__wrap {
  max-height: min(42vh, 300px) !important;
}

.reject-booking-template-select-popper.el-select-dropdown .el-select-dropdown__list {
  padding-bottom: 8px;
}
</style>
