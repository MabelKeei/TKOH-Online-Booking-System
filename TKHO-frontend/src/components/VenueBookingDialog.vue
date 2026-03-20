<template>
  <el-dialog
    :model-value="visible"
    :show-close="false"
    width="58%"
    align-center
    @update:model-value="handleClose"
    @close="handleClose"
    class="booking-dialog"
  >
    <template #header>
      <div class="custom-header">
        <span class="custom-title">Conference & Discussion Rooms - Add Booking</span>
        <button class="custom-close" @click="handleClose">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      label-width="150px"
      label-position="right"
      @submit.prevent="handleConfirm"
      class="booking-form"
    >
      <!-- Room, Date, Time Section -->
      <div class="form-section">
        <el-form-item label="Room" prop="room" :rules="[{ required: true, message: 'Please select a room' }]">
          <el-select v-model="form.room" placeholder="Select a room" style="width: 100%">
            <el-option
              v-for="room in availableRooms"
              :key="room"
              :label="room"
              :value="room"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Date" prop="date" :rules="[{ required: true, message: 'Please select a date' }]">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="Select date"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            :disabledDate="disabledDate"
            style="width: 100%"
          />
        </el-form-item>

        <div class="form-row">
          <el-form-item label="Start Time" prop="startTime" :rules="[{ required: true, message: 'Please select start time' }]" class="form-item-half">
            <el-time-select
              v-model="form.startTime"
              placeholder="Select start time"
              start="08:00"
              end="18:00"
              step="00:15"
              format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="End Time" prop="endTime" :rules="[{ required: true, message: 'Please select end time' }]" class="form-item-half">
            <el-time-select
              v-model="form.endTime"
              placeholder="Select end time"
              start="08:00"
              end="18:00"
              step="00:15"
              format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <el-form-item label=" " class="check-availability-item">
          <el-button type="primary" @click="checkAvailability" class="check-btn">
            CHECK AVAILABILITY
          </el-button>
        </el-form-item>
      </div>

      <el-divider class="section-divider" />

      <!-- Event + Additional Services paired layout -->
      <div class="form-section paired-layout">
        <div class="paired-left">
          <el-form-item label="Topic / Event Name" prop="topic" :rules="[{ required: true, message: 'Please enter topic' }]" class="topic-item no-wrap-label">
            <el-input
              v-model="form.topic"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 2 }"
              resize="none"
              class="two-line-input"
              placeholder="e.g. Quarterly Performance"
            />
          </el-form-item>

          <el-form-item label="Remark" prop="remark" class="no-wrap-label">
            <el-input
              v-model="form.remark"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 2 }"
              resize="none"
              class="two-line-input"
              placeholder="Enter any remarks"
            />
          </el-form-item>

          <el-form-item label="Tea Service Required?" prop="teaServiceRequired" class="no-wrap-label">
            <el-radio-group v-model="form.teaServiceRequired">
              <el-radio :label="true">Yes</el-radio>
              <el-radio :label="false">No</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="paired-right">
          <el-form-item prop="venueSetup" class="service-item service-label-left no-wrap-label">
            <template #label>
              <span class="service-label-with-icon">
                Venue Setup
                <el-tooltip content="Contact FMD for venue setup." placement="top">
                  <span class="service-info-trigger" @click.stop="showVenueSetupDialog = true">
                    <el-icon class="service-info-icon"><InfoFilled /></el-icon>
                  </span>
                </el-tooltip>
              </span>
            </template>
          </el-form-item>

          <el-form-item prop="equipment" class="service-item service-label-left no-wrap-label">
            <template #label>
              <span class="service-label-with-icon">
                Equipment
                <el-tooltip content="View equipment details." placement="top">
                  <span class="service-info-trigger" @click.stop="showEquipmentDialog = true">
                    <el-icon class="service-info-icon"><InfoFilled /></el-icon>
                  </span>
                </el-tooltip>
              </span>
            </template>
            <el-button text class="info-btn" @click="showVenueSetupDialog = true">
              Contact FMD
            </el-button>
          </el-form-item>

          <el-form-item prop="toolsMaterials" class="service-item service-label-left no-wrap-label">
            <template #label>
              <span class="service-label-with-icon">
                Tools and Materials
                <el-tooltip content="View tools and materials details." placement="top">
                  <span class="service-info-trigger" @click.stop="showToolsDialog = true">
                    <el-icon class="service-info-icon"><InfoFilled /></el-icon>
                  </span>
                </el-tooltip>
              </span>
            </template>
          </el-form-item>

          <el-form-item prop="specialRequests" class="service-item service-label-left no-wrap-label">
            <template #label>
              <span class="service-label-with-icon">
                Others / Special Requests
                <el-tooltip content="View other and special request details." placement="top">
                  <span class="service-info-trigger" @click.stop="showSpecialRequestsDialog = true">
                    <el-icon class="service-info-icon"><InfoFilled /></el-icon>
                  </span>
                </el-tooltip>
              </span>
            </template>
          </el-form-item>
        </div>
      </div>

      <!-- Tea Service Options (only show if Yes and not same day) -->
      <template v-if="form.teaServiceRequired && !isSameDay">
        <div class="tea-service-options">
          <div class="form-row">
            <el-form-item label="Tea or Water" prop="teaOrWater" class="form-item-half">
              <el-radio-group v-model="form.teaOrWater">
                <el-radio label="tea">Tea</el-radio>
                <el-radio label="water">Water</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="Service Type" prop="serviceType" class="form-item-half no-label-desktop">
              <el-radio-group v-model="form.serviceType">
                <el-radio label="pot">One Pot</el-radio>
                <el-radio label="bottle">One Bottle Per Person</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
      </template>

      <el-divider class="section-divider" />

      <!-- User Information Section -->
      <div class="form-section user-info-section">
        <div class="form-row">
          <el-form-item label="Full Name" prop="fullName" class="form-item-half">
            <el-input v-model="form.fullName" disabled />
          </el-form-item>

          <el-form-item label="Department / Unit" prop="department" class="form-item-half no-label">
            <el-input v-model="form.department" disabled />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="Contact Telephone No" prop="contactPhone" class="form-item-half">
            <el-input v-model="form.contactPhone" disabled />
          </el-form-item>

          <el-form-item label="Contact Email" prop="contactEmail" class="form-item-half no-label">
            <el-input v-model="form.contactEmail" disabled />
          </el-form-item>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" class="cancel-btn">Cancel</el-button>
        <el-button type="success" @click="handleConfirm" class="submit-btn">
          SUBMIT BOOKING
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled, Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  },
  roomType: {
    type: String,
    default: 'conference'
  },
  selectedTime: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['confirm', 'close'])

const formRef = ref(null)
const showVenueSetupDialog = ref(false)
const showEquipmentDialog = ref(false)
const showToolsDialog = ref(false)
const showSpecialRequestsDialog = ref(false)

const form = ref({
  room: '',
  date: null,
  startTime: '',
  endTime: '',
  topic: '',
  remark: '',
  teaServiceRequired: false,
  teaOrWater: 'tea',
  serviceType: 'pot',
  venueSetup: '',
  equipment: '',
  toolsMaterials: '',
  specialRequests: '',
  fullName: 'Karen SHEN',
  department: 'TKHO ASM (GA)',
  contactPhone: '1234 5678',
  contactEmail: 'karenshen@ha.org.hk'
})

// Available rooms
const availableRooms = [
  'Conference Room 1',
  'Conference Room 2',
  'Conference Room 3',
  'Discussion Room',
  'Discussion Room 2',
  'Lecture Theatre',
  'Function Room',
  'Auditorium'
]

// Check if booking date is same day
const isSameDay = computed(() => {
  if (!form.value.date) return false
  const selectedDate = new Date(form.value.date)
  const today = new Date()
  return selectedDate.toDateString() === today.toDateString()
})

// Disable past dates
function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// Check availability
function checkAvailability() {
  if (!form.value.room || !form.value.date || !form.value.startTime || !form.value.endTime) {
    ElMessage.warning('Please fill in Room, Date, Start Time and End Time first')
    return
  }

  // Mock availability check
  ElMessage.success('Room is available for the selected time slot!')
}

// Initialize form
function initializeForm() {
  if (props.booking) {
    form.value = { ...props.booking }
  } else {
    form.value = {
      room: '',
      date: null,
      startTime: '',
      endTime: '',
      topic: '',
      remark: '',
      teaServiceRequired: false,
      teaOrWater: 'tea',
      serviceType: 'pot',
      venueSetup: '',
      equipment: '',
      toolsMaterials: '',
      specialRequests: '',
      fullName: 'Karen SHEN',
      department: 'TKHO ASM (GA)',
      contactPhone: '1234 5678',
      contactEmail: 'karenshen@ha.org.hk'
    }

    // If there's a selected time, initialize the form
    if (props.selectedTime) {
      form.value.date = props.selectedTime.date
      form.value.startTime = props.selectedTime.time
    }
  }
}

// Confirm booking
function handleConfirm() {
  if (!formRef.value) return

  formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', {
        ...form.value,
        id: props.booking?.id || Date.now()
      })
    }
  })
}

// Close dialog
function handleClose() {
  emit('close')
}

// Watch for visibility changes
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initializeForm()
  }
})

// Initialize
initializeForm()
</script>

<style>
/* Global styles for custom header */
.booking-dialog .el-dialog {
  border-radius: 8px !important;
  border: none !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden !important;
  --el-dialog-padding-primary: 0px;
}

.booking-dialog .el-dialog__header {
  padding: 0 !important;
  margin: 0 !important;
  background-color: #00723a !important;
  border-radius: 8px 8px 0 0 !important;
}

.booking-dialog .custom-header {
  background-color: #00723a;
  color: white;
  padding: 1rem 1.5rem;
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.booking-dialog .custom-title {
  color: white;
  font-weight: 600;
  font-size: 1.0625rem;
  line-height: 1.5;
}

.booking-dialog .custom-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: color 0.2s;
}

.booking-dialog .custom-close:hover {
  color: #d1fae5;
}

.booking-dialog .el-dialog__body {
  padding: 1.125rem 1.75rem !important;
}
</style>

<style scoped>
.booking-dialog :deep(.el-dialog) {
  margin: 0 auto !important;
  max-height: 94vh;
  display: flex;
  flex-direction: column;
  max-width: 580px;
  border: none !important;
  border-radius: 0 !important;
  overflow: hidden;
}

.booking-dialog :deep(.el-dialog__body) {
  padding: 1.125rem 0.75rem 1.75rem 1.75rem;
  max-height: calc(94vh - 140px);
  overflow-y: auto;
  flex: 1;
  background-color: white;
}

.booking-dialog :deep(.el-dialog__footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
}

.booking-form {
  width: 100%;
}

.booking-form :deep(.el-form-item) {
  margin-bottom: 0.875rem;
}

.booking-form :deep(.el-form-item__label) {
  justify-content: flex-end;
  text-align: right;
}

.form-section {
  margin-bottom: 0.375rem;
}

.paired-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.875rem;
  align-items: start;
}

.paired-left,
.paired-right {
  display: flex;
  flex-direction: column;
}

.paired-left {
  padding-left: 0.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.875rem;
  width: 100%;
}

.form-row-three {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
}

.form-item-half {
  margin-bottom: 0;
}

.form-item-third {
  margin-bottom: 0;
}

.form-item-half,
.form-item-third,
.booking-form :deep(.el-form-item__content),
.booking-form :deep(.el-input),
.booking-form :deep(.el-select),
.booking-form :deep(.el-date-editor),
.booking-form :deep(.el-textarea) {
  min-width: 0;
}

.form-item-half.no-label-desktop :deep(.el-form-item__label),
.form-item-third.no-label-desktop :deep(.el-form-item__label) {
  display: none;
}

.form-item-half.no-label-desktop :deep(.el-form-item__content),
.form-item-third.no-label-desktop :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.check-availability-item {
  margin-bottom: 0.375rem;
}

.check-btn {
  width: 100%;
  background-color: #3b82f6;
  border-color: #3b82f6;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.5rem 1rem;
}

.check-btn:hover {
  background-color: #2563eb;
  border-color: #2563eb;
}

.section-divider {
  margin: 0.875rem 0;
}

.tea-service-options {
  background-color: #f9fafb;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-top: 0.375rem;
}

.tea-service-options .form-row {
  margin-bottom: 0;
}

.tea-service-options .form-item-half {
  margin-bottom: 0;
}

.service-item {
  margin-bottom: 0;
}

.service-label-left :deep(.el-form-item__label) {
  justify-content: flex-start;
  text-align: left;
  padding-left: 1.25rem;
  overflow: visible;
}

.service-label-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.service-info-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  flex-shrink: 0;
}

.service-info-icon {
  color: #3b82f6;
}

.service-info-icon:hover {
  color: #2563eb;
}

.info-btn {
  color: #3b82f6;
  font-size: 0.8125rem;
  padding: 0;
}

.info-btn:hover {
  color: #2563eb;
}

.user-info-section {
  background-color: #f3f4f6;
  padding: 0.75rem 0.75rem 0.25rem 1.75rem;
  border-radius: 0.375rem;
}

.user-info-section :deep(.el-form-item__label) {
  flex-shrink: 0;
  white-space: nowrap;
  overflow: visible;
}

.user-info-section :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}

.user-info-section :deep(.el-input) {
  width: 100%;
}

.user-info-section .form-row {
  margin-bottom: 0.5rem;
}

.user-info-section .form-row:last-child {
  margin-bottom: 0;
}

.booking-form :deep(.el-form-item__label) {
  font-size: 0.8125rem;
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
  padding-bottom: 0.25rem;
}

.booking-form :deep(.el-input__inner),
.booking-form :deep(.el-textarea__inner) {
  font-size: 0.8125rem;
}

.two-line-input :deep(.el-textarea__inner) {
  line-height: 1.35;
  max-height: calc(1.35em * 2 + 0.9rem);
  overflow-y: auto;
  word-break: break-word;
}

.topic-item :deep(.el-form-item__label) {
  white-space: nowrap;
}

.no-wrap-label :deep(.el-form-item__label) {
  white-space: nowrap;
}

.booking-form :deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f9fafb;
  color: #6b7280;
}

.booking-form :deep(.el-radio__label) {
  font-size: 0.8125rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
}

.cancel-btn {
  padding: 0.4375rem 1.25rem;
  font-size: 0.8125rem;
}

.submit-btn {
  background-color: #00723a;
  border-color: #00723a;
  font-weight: 600;
  padding: 0.4375rem 1.25rem;
  font-size: 0.8125rem;
}

.submit-btn:hover {
  background-color: #005a2e;
  border-color: #005a2e;
}

.ml-1 {
  margin-left: 0.25rem;
}

/* Scrollbar styling */
.booking-dialog :deep(.el-dialog__body)::-webkit-scrollbar {
  width: 6px;
}

.booking-dialog :deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.booking-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.booking-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Tablet */
@media (max-width: 1024px) {
  .form-row-three {
    grid-template-columns: 1fr 1fr;
  }

  .paired-layout {
    grid-template-columns: 1fr;
  }

  .form-item-third.no-label-desktop:first-of-type :deep(.el-form-item__label) {
    display: block;
  }

  .form-item-third.no-label-desktop:first-of-type :deep(.el-form-item__content) {
    margin-left: 150px !important;
  }

}

/* Mobile */
@media (max-width: 768px) {
  .booking-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 3vh auto !important;
  }

  .booking-dialog :deep(.el-dialog__body) {
    padding: 1rem;
  }

  .booking-dialog :deep(.el-dialog__footer) {
    padding: 0.75rem 1rem;
  }

  .booking-form :deep(.el-form-item__label) {
    font-size: 0.75rem;
  }

  .form-row,
  .form-row-three {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .paired-layout {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .form-item-half.no-label-desktop :deep(.el-form-item__label),
  .form-item-third.no-label-desktop :deep(.el-form-item__label) {
    display: block;
  }

  .form-item-half.no-label-desktop :deep(.el-form-item__content),
  .form-item-third.no-label-desktop :deep(.el-form-item__content) {
    margin-left: 150px !important;
  }

  .tea-service-options .form-row {
    grid-template-columns: 1fr;
  }

  .tea-service-options .form-item-half.no-label-desktop :deep(.el-form-item__label) {
    display: block;
  }

  .tea-service-options .form-item-half.no-label-desktop :deep(.el-form-item__content) {
    margin-left: 150px !important;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .booking-dialog :deep(.el-dialog__header) {
    padding: 0.75rem 1rem;
  }

  .booking-dialog :deep(.el-dialog__title) {
    font-size: 0.9375rem;
  }

  .booking-form :deep(.el-form-item__label) {
    font-size: 0.6875rem;
  }

  .booking-form :deep(.el-input__inner),
  .booking-form :deep(.el-textarea__inner),
  .booking-form :deep(.el-radio__label) {
    font-size: 0.75rem;
  }

  .check-btn,
  .cancel-btn,
  .submit-btn {
    font-size: 0.75rem;
    padding: 0.375rem 1rem;
  }
}
</style>
