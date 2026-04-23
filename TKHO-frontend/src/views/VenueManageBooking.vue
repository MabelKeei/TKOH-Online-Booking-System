<template>
  <div class="page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden pt-[64px]">
    <AppHeader @logout="onLogout" />

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
                  <span class="card-label">Booking Date</span>
                  <span class="card-value">{{ booking.date }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label">Time</span>
                  <span class="card-value">{{ booking.time }}</span>
                </div>
                <div class="card-row">
                  <span class="card-label application-date-label">Application Date</span>
                  <span class="card-value">{{ formatApplicationDateForCard(booking.bookedOn) }}</span>
                </div>
                <div class="card-row tea-service-row">
                  <span class="card-label tea-service-label">Tea Service</span>
                  <span class="card-value tea-service-value">{{ formatTeaServiceStatus(booking) }}</span>
                </div>
              </div>
              <div class="card-footer">
                <div v-if="booking.reason" class="reason-row">
                  <span class="reason-label">Reason:</span>
                  <span class="reason-text">{{ booking.reason }}</span>
                </div>
                <button
                  v-if="isAdminAllBookingsView && booking.status === 'upcoming'"
                  type="button"
                  class="btn-action btn-edit"
                  @click="openHandleBooking(booking)"
                >
                  Handle
                </button>
                <button
                  v-else-if="!isAdminAllBookingsView && booking.status === 'upcoming'"
                  class="btn-cancel"
                  @click="cancelBooking(booking.id)"
                >
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
                  <th v-if="availableColumns[0].visible" class="col-datetime">
                    <button type="button" class="th-sort-btn" @click="toggleSort('dateTime')">
                      Booking Date & Time
                      <span class="sort-indicator">{{ getSortIndicator('dateTime') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[1].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('room')">
                      Venue
                      <span class="sort-indicator">{{ getSortIndicator('room') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[2].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('topic')">
                      Meeting / Event
                      <span class="sort-indicator">{{ getSortIndicator('topic') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[3].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('reservedBy')">
                      Reserved By
                      <span class="sort-indicator">{{ getSortIndicator('reservedBy') }}</span>
                    </button>
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
                  <th v-if="availableColumns[6].visible">Status</th>
                  <th v-if="availableColumns[7].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('approvalStatus')">
                      Approval
                      <span class="sort-indicator">{{ getSortIndicator('approvalStatus') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[8].visible">
                    <button type="button" class="th-sort-btn" @click="toggleSort('bookedOn')">
                      Application Date
                      <span class="sort-indicator">{{ getSortIndicator('bookedOn') }}</span>
                    </button>
                  </th>
                  <th v-if="availableColumns[9].visible">My Note</th>
                  <th v-if="availableColumns[10].visible">Cancelled Reason</th>
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
                  <td v-if="availableColumns[1].visible">{{ booking.room }}</td>
                  <td v-if="availableColumns[2].visible">{{ booking.topic }}</td>
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
                  <td v-if="availableColumns[9].visible">{{ booking.myNote || '-' }}</td>
                  <td v-if="availableColumns[10].visible">{{ booking.reason || '-' }}</td>
                  <td class="actions-td">
                    <div class="actions-cell">
                      <template v-if="isAdminAllBookingsView">
                        <button
                          v-if="booking.status === 'upcoming'"
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
                        <button type="button" class="btn-action btn-cancel-small" @click="cancelBooking(booking.id)">
                          Cancel
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
    <BookingStyleModal v-model="showCancelDialog" title="Cancel Booking" max-width="540px">
      <p class="cancel-confirm-message">
        Are you sure you want to cancel this venue booking? This action cannot be undone.
      </p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showCancelDialog = false">No</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmCancel">Confirm</el-button>
      </template>
    </BookingStyleModal>

    <!-- Edit Booking Info Dialog -->
    <BookingStyleModal
      v-model="showEditDialog"
      title="Edit Booking"
      max-width="560px"
      :max-height="editBookingModalMaxHeight"
      custom-class="edit-booking-modal"
    >
      <el-form :model="editForm" label-width="130px">
        <el-form-item label="Venue">
          <el-select
            v-model="editForm.room"
            placeholder="Select venue"
            style="width: 100%"
            :teleported="false"
            :popper-options="editPickerPopperOptions"
          >
            <el-option v-for="room in editableVenueOptions" :key="`edit-room-${room}`" :label="room" :value="room" />
          </el-select>
        </el-form-item>
        <el-form-item label="Meeting / Event">
          <el-input
            v-model="editForm.topic"
            type="textarea"
            :rows="2"
            placeholder="Enter meeting or event name"
            :disabled="isEditTopicLocked"
          />
        </el-form-item>
        <el-form-item label="Booking Date">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            value-format="YYYY-MM-DD"
            format="DD/MM/YYYY"
            placeholder="Select booking date"
            :teleported="false"
            :popper-options="editPickerPopperOptions"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="Start Time">
          <el-select
            v-model="editForm.startTime"
            placeholder="Select start time"
            style="width: 100%"
            :teleported="false"
            :popper-options="editPickerPopperOptions"
          >
            <el-option v-for="t in timeSlotOptions" :key="`edit-start-${t}`" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="End Time">
          <el-select
            v-model="editForm.endTime"
            placeholder="Select end time"
            style="width: 100%"
            :teleported="false"
            :popper-options="editPickerPopperOptions"
          >
            <el-option v-for="t in timeSlotOptions" :key="`edit-end-${t}`" :label="t" :value="t" />
          </el-select>
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
          </div>
        </template>
        <el-form-item label="No. of participants" class="edit-tea-line no-wrap-label">
          <el-input-number v-model="editForm.teaServiceParticipants" :min="1" :max="200" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="My Note">
          <el-input v-model="editForm.myNote" type="textarea" :rows="2" placeholder="Enter your note" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showEditDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-confirm" @click="confirmEditBooking">Save</el-button>
      </template>
    </BookingStyleModal>

    <!-- Handle Booking???? All Bookings + upcoming????MeetingApproval??-->
    <BookingStyleModal
      v-model="showHandleDialog"
      title="Handle Booking"
      max-width="620px"
      :max-height="handleBookingModalMaxHeight"
    >
      <el-form :model="handleForm" label-width="130px">
        <el-form-item label="Room">
          <el-input v-model="handleForm.room" disabled />
        </el-form-item>
        <el-form-item label="Topic / Event Name">
          <el-input v-model="handleForm.topic" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Booking Date">
          <el-input v-model="handleForm.date" disabled />
        </el-form-item>
        <el-form-item label="Time">
          <el-input v-model="handleForm.time" disabled />
        </el-form-item>
        <div class="handle-contact-section">
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
            @change="handleVenueRejectTemplateChange"
          >
            <el-option
              v-for="tpl in meetingRejectTemplateOptions"
              :key="tpl.id"
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import AppHeader from '../components/AppHeader.vue'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { getMockEmployeeListNormalized, getMockPromptList, getMockVenueManageBookingList } from '@/mocks/mockData'

const router = useRouter()
const userStore = useUserStore()
const { isAdmin, userInfo } = storeToRefs(userStore)

const currentView = ref('card')
const bookingView = ref('my') // 'my' or 'all' - for admin to switch between personal and all bookings

/** ???? All Bookings?? upcoming ?? Handle???? Edit/Cancel */
const isAdminAllBookingsView = computed(
  () => isAdmin.value && bookingView.value === 'all'
)
const searchQuery = ref('')
const showColumnsFilter = ref(false)
const showStatusFilter = ref(false)
const showDateFilter = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const sortState = ref([
  { key: 'dateTime', order: 'asc' }
])
const showCancelDialog = ref(false)
const showEditDialog = ref(false)
const cancelBookingId = ref(null)
const currentEditBookingId = ref(null)
const currentEditBookingApprovalStatus = ref('')
const editTeaSelectionSnapshot = ref({ teaOrWater: 'tea', serviceType: 'pot' })
const dateRange = ref(null)

const employeeList = ref([])
const showHandleDialog = ref(false)
const currentHandleBookingId = ref(null)
const handleForm = ref({
  room: '',
  topic: '',
  date: '',
  time: '',
  userName: '',
  departmentUnit: '',
  contactPhone: '',
  contactEmail: '',
  rejectTemplateKey: 'meeting_approval_reject_template',
  reason: ''
})
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
  teaServiceParticipants: 1
})

/** 与 VenueBookingDialog / mock `teaServiceSummary` 一致：Tea|Water + One Pot|One Bottle Per Person */
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
const meetingRejectTemplateOptions = computed(() =>
  getMockPromptList().filter(
    item => item.category === 'reject_template' && item.templateType === 'meeting_approval'
  )
)

const editableVenueOptions = [
  'Conference Room 1',
  'Conference Room 2',
  'Conference Room 3',
  'Discussion Room',
  'Discussion Room 2',
  'Function Room',
  'Lecture Theatre',
  'Auditorium'
]

/** 14" ????100??599??Handle Booking ?????? MeetingApproval ???*/
const HANDLE_BOOKING_MODAL_MQ = '(min-width: 1100px) and (max-width: 1599px)'
const handleBookingModalMaxHeight = ref('94vh')
const editBookingModalMaxHeight = ref('98vh')
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

function updateHandleBookingModalMaxHeight () {
  if (typeof window === 'undefined') return
  const isLaptop14 = window.matchMedia(HANDLE_BOOKING_MODAL_MQ).matches
  handleBookingModalMaxHeight.value = isLaptop14 ? '120vh' : '94vh'
  // 14寸（zoom:0.8）时避免内容溢出，交给 modal body 自身滚动
  editBookingModalMaxHeight.value = isLaptop14 ? '96vh' : '98vh'
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
  { key: 'myNote', label: 'My Note', visible: true, required: false },
  { key: 'reason', label: 'Cancelled Reason', visible: true, required: false }
])

const bookings = ref(getMockVenueManageBookingList())

const filteredBookings = computed(() => {
  let result = bookings.value

  // Filter by booking view (admin only)
  if (isAdmin.value && bookingView.value === 'my') {
    // Show only bookings made by current admin user
    const currentUserEmail = userInfo.value?.email || 'karen.shen@ha.org.hk'
    result = result.filter(b => b.email === currentUserEmail)
  }
  // If bookingView is 'all' or user is not admin, show all bookings

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
  const arrow = sortState.value[idx].order === 'asc' ? '▲' : '▼'
  return `${arrow}${idx + 1}`
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

const formatTeaServiceStatus = (booking) => {
  const count = booking.teaServiceParticipants ?? booking.attendeeCount ?? booking.participants
  const countSuffix = Number.isFinite(Number(count)) ? ` (${count})` : ''
  if (booking.teaServiceSummary) return `${booking.teaServiceSummary}${countSuffix}`
  if (booking.teaServiceRequired === true) return `Required${countSuffix}`
  return 'No'
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
  cancelBookingId.value = id
  showCancelDialog.value = true
}

const confirmCancel = () => {
  const booking = bookings.value.find(b => b.id === cancelBookingId.value)
  if (booking) {
    booking.status = 'canceled'
  }

  showCancelDialog.value = false
  ElMessage.success('Venue booking cancelled successfully!')
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
    teaServiceParticipants: booking.teaServiceParticipants || 1
  }
  showEditDialog.value = true
}

const confirmEditBooking = () => {
  const id = currentEditBookingId.value
  if (id == null) return
  if (!editForm.value.topic.trim()) {
    ElMessage.warning('Please enter Meeting / Event')
    return
  }
  if (!editForm.value.date) {
    ElMessage.warning('Please select Booking Date')
    return
  }
  if (!editForm.value.startTime || !editForm.value.endTime) {
    ElMessage.warning('Please select Start Time and End Time')
    return
  }
  if (editForm.value.startTime >= editForm.value.endTime) {
    ElMessage.warning('End Time must be later than Start Time')
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
    ElMessage.warning('Near-date bookings cannot change Tea/Water options. You can only cancel Tea Service.')
    return
  }
  const booking = bookings.value.find(b => b.id === id)
  if (!booking) return

  const isApproved = String(booking.approvalStatus || '').toLowerCase() === 'approved'
  if (!isApproved) {
    booking.topic = editForm.value.topic.trim()
  }
  booking.room = editForm.value.room
  booking.myNote = editForm.value.myNote?.trim() || ''
  booking.date = formatIsoDateToDisplay(editForm.value.date)
  booking.time = `${editForm.value.startTime} - ${editForm.value.endTime}`
  booking.teaServiceRequired = Boolean(editForm.value.teaServiceRequired)
  booking.teaServiceParticipants = editForm.value.teaServiceParticipants || 1
  if (booking.teaServiceRequired) {
    booking.teaServiceSummary = buildTeaServiceSummary(editForm.value.teaOrWater, editForm.value.serviceType)
  } else {
    delete booking.teaServiceSummary
  }

  showEditDialog.value = false
  currentEditBookingId.value = null
  currentEditBookingApprovalStatus.value = ''
  editTeaSelectionSnapshot.value = { teaOrWater: 'tea', serviceType: 'pot' }
  ElMessage.success('Booking updated successfully')
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
    userName: booking.reservedBy || '',
    departmentUnit: matched?.department || '-',
    contactPhone: booking.contact || '-',
    contactEmail: booking.email || '-',
    rejectTemplateKey: 'meeting_approval_reject_template',
    reason: ''
  }
  handleVenueRejectTemplateChange(handleForm.value.rejectTemplateKey)
  showHandleDialog.value = true
}

function handleVenueRejectTemplateChange (templateKey) {
  const selectedTemplate = meetingRejectTemplateOptions.value.find(item => item.key === templateKey)
  if (!selectedTemplate) return
  handleForm.value.reason = selectedTemplate.content || ''
}

function confirmHandleApprove () {
  const id = currentHandleBookingId.value
  if (id == null) return
  const booking = bookings.value.find((b) => b.id === id)
  if (booking) {
    booking.topic = handleForm.value.topic.trim() || booking.topic
    booking.approvalStatus = 'approved'
    booking.approvedBy = userInfo.value?.name || userInfo.value?.corpId || 'Admin'
    booking.approvedAt = new Date().toISOString()
    booking.rejectReason = ''
  }
  showHandleDialog.value = false
  currentHandleBookingId.value = null
  ElMessage.success('Booking approved successfully')
}

function confirmHandleReject () {
  if (!handleForm.value.reason.trim()) {
    ElMessage.warning('Please provide a reason for rejection')
    return
  }
  const id = currentHandleBookingId.value
  if (id == null) return
  const booking = bookings.value.find((b) => b.id === id)
  if (booking) {
    booking.topic = handleForm.value.topic.trim() || booking.topic
    booking.status = 'canceled'
    booking.reason = handleForm.value.reason.trim()
    booking.approvalStatus = 'rejected'
    booking.rejectReason = handleForm.value.reason.trim()
    booking.approvedBy = userInfo.value?.name || userInfo.value?.corpId || 'Admin'
    booking.approvedAt = new Date().toISOString()
  }
  showHandleDialog.value = false
  currentHandleBookingId.value = null
  ElMessage.success('Booking rejected')
}

onMounted(() => {
  employeeList.value = getMockEmployeeListNormalized()
  updateHandleBookingModalMaxHeight()
  handleBookingModalMq = window.matchMedia(HANDLE_BOOKING_MODAL_MQ)
  handleBookingModalMq.addEventListener('change', updateHandleBookingModalMaxHeight)
})

onUnmounted(() => {
  if (handleBookingModalMq) {
    handleBookingModalMq.removeEventListener('change', updateHandleBookingModalMaxHeight)
  }
  document.removeEventListener('mousedown', handleDateFilterClickOutside, true)
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
  white-space: normal;
  word-break: break-word;
  margin-left: 0.5rem;
}

/* Edit dialog — tea options aligned with VenueBookingDialog.vue */
.edit-tea-service-note {
  margin: 0 0 0.5rem 0;
  font-size: 0.8125rem;
  color: #b45309;
  line-height: 1.4;
}

.edit-tea-service-options {
  margin-bottom: 0.25rem;
}

.edit-tea-line :deep(.el-form-item__label) {
  white-space: nowrap;
}

.edit-tea-line :deep(.el-form-item__content) {
  flex-wrap: wrap;
}

.edit-tea-followup :deep(.el-form-item__label) {
  width: 130px !important;
}

.edit-tea-service-radios {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.edit-tea-service-radios :deep(.el-radio) {
  margin-right: 0;
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

.handle-contact-section {
  background-color: #f3f4f6;
  padding: 0.75rem 0.75rem 0.25rem 1.25rem;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.handle-contact-section :deep(.el-form-item__label) {
  white-space: nowrap;
}

.handle-contact-section :deep(.el-form-item__content) {
  min-width: 0;
}

.handle-contact-section :deep(.el-input) {
  width: 96%;
  max-width: 100%;
}

.card-footer .btn-action.btn-edit {
  align-self: flex-end;
}
</style>
