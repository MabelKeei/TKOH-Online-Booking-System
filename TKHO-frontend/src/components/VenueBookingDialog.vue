<template>
  <!-- 自定义遮罩 + 弹窗 -->
  <div class="modal-overlay" @click.self="handleClose" v-if="visible">
    <div
      class="booking-dialog-wrapper"
      :style="{ transform: `translate(${dialogX}px, ${dialogY}px)` }"
    >
      <!-- 头部 -->
      <div class="modal-header" @mousedown="handleMouseDown">
        <span class="modal-title">Add Booking</span>
        <button class="modal-close" @click="handleClose">
          <svg viewBox="0 0 24 24" class="close-icon">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="modal-body">
        <el-form
          ref="formRef"
          :model="form"
          label-width="150px"
          label-position="right"
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

          <!-- Event + Additional Services -->
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

          <!-- Tea Service -->
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

          <!-- User Info -->
          <div class="form-section user-info-section">
            <div class="form-row">
              <el-form-item label="Full Name" prop="fullName" class="form-item-half">
                <el-input v-model="form.fullName" />
              </el-form-item>

              <el-form-item label="Department / Unit" prop="department" class="form-item-half no-label">
                <el-input v-model="form.department" />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="Contact Telephone No" prop="contactPhone" class="form-item-half">
                <el-input v-model="form.contactPhone" />
              </el-form-item>

              <el-form-item label="Contact Email" prop="contactEmail" class="form-item-half no-label">
                <el-input v-model="form.contactEmail" />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <el-button @click="handleClose" class="cancel-btn">Cancel</el-button>
        <el-button type="success" @click="handleConfirm" class="submit-btn">
          SUBMIT BOOKING
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

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

// 拖拽相关
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dialogX = ref(0)
const dialogY = ref(0)

function handleMouseDown(e) {
  if (e.target.closest('.modal-close')) return
  isDragging.value = true
  dragStartX.value = e.clientX - dialogX.value
  dragStartY.value = e.clientY - dialogY.value
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e) {
  if (!isDragging.value) return
  dialogX.value = e.clientX - dragStartX.value
  dialogY.value = e.clientY - dragStartY.value
}

function handleMouseUp() {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

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

const isSameDay = computed(() => {
  if (!form.value.date) return false
  const selectedDate = new Date(form.value.date)
  const today = new Date()
  return selectedDate.toDateString() === today.toDateString()
})

function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function checkAvailability() {
  if (!form.value.room || !form.value.date || !form.value.startTime || !form.value.endTime) {
    ElMessage.warning('Please fill in Room, Date, Start Time and End Time first')
    return
  }
  ElMessage.success('Room is available for the selected time slot!')
}

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
    if (props.selectedTime) {
      form.value.date = props.selectedTime.date
      form.value.startTime = props.selectedTime.time
    }
  }
}

function handleConfirm() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      emit('confirm', { ...form.value, id: props.booking?.id || Date.now() })
    }
  })
}

function handleClose() {
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    initializeForm()
    // 重置对话框位置
    dialogX.value = 0
    dialogY.value = 0
  }
})
</script>

<style>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* 弹窗容器 */
.booking-dialog-wrapper {
  width: 75%;
  max-width: 900px;
  max-height: 94vh;
  background: #fff;
  border-radius: 12px; /* 你要的圆角 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.modal-header {
  background: #00723a;
  color: #fff;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
}
.modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.5;
}

/* 关闭按钮（加粗 ×） */
.modal-close {
  background: none;
  border: none;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.close-icon {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 3; /* 真正加粗，必生效 */
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
.modal-close:hover .close-icon {
  stroke: #d1fae5;
}

/* 内容区 */
.modal-body {
  padding: 1.125rem 1.75rem;
  flex: 1;
  overflow-y: auto;
}
.modal-body::-webkit-scrollbar {
  width: 6px;
}
.modal-body::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* 底部 */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style scoped>
/* 你原来的所有表单样式，完全不变 */
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
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.5rem;
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

/* 响应式 */
@media (max-width: 1024px) {
  .form-row-three {
    grid-template-columns: 1fr 1fr;
  }
  .paired-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .booking-dialog-wrapper {
    width: 95% !important;
  }
  .modal-body {
    padding: 1rem;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
  .paired-layout {
    grid-template-columns: 1fr;
  }
}
</style>