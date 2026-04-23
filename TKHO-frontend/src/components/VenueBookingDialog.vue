<template>
  <!-- 自定义遮罩 + 弹窗 -->
  <div class="modal-overlay" @click.self="handleClose" v-if="visible">
    <div
      class="booking-dialog-wrapper"
      :style="dialogWrapperStyle"
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
            <el-form-item label="Room / Venue" prop="room" :rules="[{ required: true, message: 'Please select a room' }]">
              <el-select v-model="form.room" placeholder="Select a room" style="width: 100%;" popper-class="room-select-popper">
                <el-option
                  v-for="room in availableRooms"
                  :key="room.name"
                  :label="room.name"
                  :value="room.name"
                >
                  <div class="room-option">
                    <span class="room-color-dot" :style="{ backgroundColor: room.color }"></span>
                    <span>{{ room.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 修复后的日期选择框 -->
            <el-form-item label="Date" prop="date" :rules="[{ required: true, message: 'Please select a date' }]">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Select date"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                style="width: 100%"
                :picker-options="{
                  firstDayOfWeek: 1 // 周一作为每周第一天
                }"
                clearable
                popper-class="date-picker-popper"
              ></el-date-picker>
            </el-form-item>

            <div class="form-row">
              <el-form-item label="Start Time" prop="startTime" :rules="[{ required: true, message: 'Please select start time' }]" class="form-item-half">
                <el-select
                  v-model="form.startTime"
                  placeholder="Select start time"
                  style="width: 100%"
                  filterable
                  clearable
                  :teleported="false"
                  popper-class="time-select-popper"
                >
                  <el-option v-for="t in timeSlotOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>

              <el-form-item label="End Time" prop="endTime" :rules="[{ required: true, message: 'Please select end time' }]" class="form-item-half">
                <el-select
                  v-model="form.endTime"
                  placeholder="Select end time"
                  style="width: 100%"
                  filterable
                  clearable
                  :teleported="false"
                  popper-class="time-select-popper"
                >
                  <el-option v-for="t in timeSlotOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label=" " class="check-availability-item">
              <el-button type="default" @click="checkAvailability" class="check-btn">
                CHECK AVAILABILITY
              </el-button>
            </el-form-item>
          </div>

          <el-divider class="section-divider" />

          <!-- Event + Additional Services -->
          <div class="form-section paired-layout">
            <div class="paired-left">
              <el-form-item label="Meeting / Event Title" prop="topic" :rules="[{ required: true, message: 'Please enter topic' }]" class="topic-item no-wrap-label">
                <el-input
                  v-model="form.topic"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  resize="none"
                  class="two-line-input"
                  placeholder="e.g. Quarterly Performance"
                ></el-input>
              </el-form-item>

              <el-form-item label="My Note" prop="remark" class="no-wrap-label">
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  resize="none"
                  class="two-line-input"
                  placeholder="Enter any notes"
                ></el-input>
              </el-form-item>

              <el-form-item label="No. of participants" prop="attendeeCount" class="no-wrap-label">
                <el-input-number
                  v-model="form.attendeeCount"
                  :min="1"
                  :max="200"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="Tea Service Required?" prop="teaServiceRequired" class="no-wrap-label">
                <el-radio-group v-model="form.teaServiceRequired">
                  <el-radio :label="true">Yes</el-radio>
                  <el-radio :label="false">No</el-radio>
                </el-radio-group>
              </el-form-item>
              <p v-if="form.teaServiceRequired && isTeaServiceUnavailable" class="tea-service-note">
                Tea service is unavailable for bookings on today or earlier. Please select a future date.
              </p>
              <template v-if="form.teaServiceRequired && !isTeaServiceUnavailable">
                <div class="tea-service-options">
                  <el-form-item label="Tea or Water" prop="teaOrWater" class="tea-service-line no-wrap-label">
                    <el-radio-group v-model="form.teaOrWater" class="tea-service-radios">
                      <el-radio label="tea">Tea</el-radio>
                      <el-radio label="water">Water</el-radio>
                    </el-radio-group>
                  </el-form-item>

                  <el-form-item label=" " prop="serviceType" class="tea-service-line tea-service-followup no-wrap-label">
                    <el-radio-group v-model="form.serviceType" class="tea-service-radios">
                      <el-radio label="pot">One Pot</el-radio>
                      <el-radio label="bottle">One Bottle Per Person</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </div>
              </template>
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

          <el-divider class="section-divider" />

          <!-- User Info -->
          <div class="form-section user-info-section">
            <div class="form-row">
              <el-form-item label="Full Name" prop="fullName" class="form-item-half">
                <el-input v-model="form.fullName" disabled></el-input>
              </el-form-item>

              <el-form-item label="Department" prop="department" class="form-item-half no-label">
                <el-input v-model="form.department" disabled></el-input>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="Contact No." prop="contactPhone" class="form-item-half">
                <el-input v-model="form.contactPhone" disabled></el-input>
              </el-form-item>

              <el-form-item label="Email" prop="contactEmail" class="form-item-half no-label">
                <el-input v-model="form.contactEmail" disabled></el-input>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <el-button @click="handleClose" class="cancel-btn">Cancel</el-button>
        <el-button type="default" @click="handleConfirm" class="submit-btn">
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

/** 14" 视口（1100–1599）：弹窗略增高，与 MeetingApproval / UserManagement 一致 */
const VENUE_BOOKING_DIALOG_MODAL_MQ = '(min-width: 1100px) and (max-width: 1599px)'
const venueBookingDialogMaxHeight = ref('')

function updateVenueBookingDialogMaxHeight () {
  if (typeof window === 'undefined') return
  venueBookingDialogMaxHeight.value = window.matchMedia(VENUE_BOOKING_DIALOG_MODAL_MQ).matches ? '124vh' : ''
}

let venueBookingDialogModalMq = null

const dialogWrapperStyle = computed(() => ({
  transform: `translate(${dialogX.value}px, ${dialogY.value}px)`,
  ...(venueBookingDialogMaxHeight.value ? { maxHeight: venueBookingDialogMaxHeight.value } : {})
}))

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

onMounted(() => {
  updateVenueBookingDialogMaxHeight()
  venueBookingDialogModalMq = window.matchMedia(VENUE_BOOKING_DIALOG_MODAL_MQ)
  venueBookingDialogModalMq.addEventListener('change', updateVenueBookingDialogMaxHeight)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  if (venueBookingDialogModalMq) {
    venueBookingDialogModalMq.removeEventListener('change', updateVenueBookingDialogMaxHeight)
  }
})

const form = ref({
  room: '',
  date: null, // 日期初始化为null
  startTime: '',
  endTime: '',
  topic: '',
  remark: '',
  teaServiceRequired: false,
  attendeeCount: 1,
  teaOrWater: 'tea',
  serviceType: 'pot',
  venueSetup: '',
  equipment: '',
  toolsMaterials: '',
  specialRequests: '',
  fullName: 'Karen SHEN',
  department: 'TKOH ASM (GA)',
  contactPhone: '1234 5678',
  contactEmail: 'karenshen@ha.org.hk'
})

const availableRooms = [
  { name: 'Conference Room 1', color: '#3b82f6' },
  { name: 'Conference Room 2', color: '#10b981' },
  { name: 'Conference Room 3', color: '#06b6d4' },
  { name: 'Discussion Room', color: '#f59e0b' },
  { name: 'Function Room', color: '#ec4899' },
  { name: 'Lecture Theatre', color: '#6366f1' },
  { name: 'Auditorium', color: '#8b5cf6' }
]

/** 与原 el-time-select start/end/step（07:00–21:00，30 分钟）一致；改用 el-select 以支持 :teleported="false"（html zoom 下不误位） */
function buildHalfHourTimeOptions(start = '07:00', end = '21:00', stepMinutes = 30) {
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

const isTeaServiceUnavailable = computed(() => {
  if (!form.value.date) return false
  const selectedDate = new Date(form.value.date)
  selectedDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return selectedDate <= today
})

// 禁用过去的日期（只能选择今天及以后的日期）
function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 重置时间为0点，确保今天可选
  return date < today
}

function checkAvailability() {
  if (!form.value.room || !form.value.date || !form.value.startTime || !form.value.endTime) {
    ElMessage.warning('Please fill in Room, Date, Start Time and End Time first')
    return
  }
  
  // 简单的时间验证
  if (form.value.startTime >= form.value.endTime) {
    ElMessage.warning('End time must be after start time')
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
      date: null, // 初始化日期为空
      startTime: '',
      endTime: '',
      topic: '',
      remark: '',
      teaServiceRequired: false,
      attendeeCount: 1,
      teaOrWater: 'tea',
      serviceType: 'pot',
      venueSetup: '',
      equipment: '',
      toolsMaterials: '',
      specialRequests: '',
      fullName: 'Karen SHEN',
      department: 'TKOH ASM (GA)',
      contactPhone: '1234 5678',
      contactEmail: 'karenshen@ha.org.hk'
    }
    if (props.selectedTime) {
      form.value.date = props.selectedTime.date
      form.value.startTime = props.selectedTime.time
      form.value.room = props.selectedTime.room || ''
    }
  }
}

function handleConfirm() {
  if (!formRef.value) return
  formRef.value.validate((valid) => {
    if (valid) {
      // 验证结束时间是否晚于开始时间
      if (form.value.startTime && form.value.endTime && form.value.startTime >= form.value.endTime) {
        ElMessage.error('End time must be later than start time')
        return
      }
      emit('confirm', { ...form.value, id: props.booking?.id || Date.now() })
      ElMessage.success('Booking submitted successfully!')
      handleClose()
    } else {
      ElMessage.error('Please fill in all required fields')
    }
  })
}

function handleClose() {
  emit('close')
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }
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
  /* 解决小屏滚动问题：允许遮罩层滚动 */
  overflow-y: auto;
  padding: 20px 0;
}

/* 弹窗容器 */
.booking-dialog-wrapper {
  width: 75%;
  max-width: 900px;
  max-height: 94vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  /* teleported=false 时下拉在弹窗内，避免 overflow:hidden 裁切 */
  overflow: visible;
  position: relative;
  z-index: 10000;
  /* 修复小屏滚动：确保容器在flex布局中正确计算高度 */
  flex-shrink: 0;
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
  flex-shrink: 0; /* 头部不收缩 */
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
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
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
.modal-close:hover .close-icon {
  stroke: #d1fae5;
}

/* 内容区 - 修复滚动和日期选择器样式问题 */
.modal-body {
  padding: 1.125rem 1.75rem;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
  /* 确保内容区高度计算正确 */
  min-height: 0;
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
  flex-shrink: 0; /* 底部不收缩 */
}

/* 修复下拉框样式 */
.room-select-popper,
.time-select-popper,
.date-picker-popper {
  z-index: 99999 !important;
}

.room-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 修复日期选择器数字不显示问题 */
:deep(.el-date-table) {
  font-size: 14px;
}
:deep(.el-date-table td) {
  color: #333 !important;
  line-height: 28px;
}
:deep(.el-date-table td.disabled) {
  color: #ccc !important;
}
:deep(.el-date-table td.today) {
  color: #00723a !important;
  font-weight: bold;
}
:deep(.el-date-table td.current) {
  background-color: #00723a !important;
  color: #fff !important;
}
:deep(.el-date-table td.current:hover) {
  background-color: #005a2e !important;
}
:deep(.el-date-editor) {
  width: 100%;
}
:deep(.el-date-picker__header-label) {
  font-weight: 600;
  color: #333;
}

/* 确保日期选择器浮层不被遮挡 */
:deep(.date-picker-popper) {
  z-index: 100000 !important;
  position: fixed !important;
}
</style>

<style scoped>
/* 原有表单样式保持不变 */
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
  font-weight: bold;
  font-size: 0.8125rem;
  padding: 0.5rem 1rem;
  color: #ffffff;
}

.check-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.section-divider {
  margin: 0.875rem 0;
}

.tea-service-options {
  background-color: #f9fafb;
  padding: 0.75rem 0.75rem 0.75rem 0;
  border-radius: 0.375rem;
  margin-top: 0.375rem;
}

.tea-service-line {
  margin-bottom: 0.25rem;
}

.tea-service-followup {
  margin-bottom: 0;
}

.tea-service-line :deep(.el-form-item__label) {
  justify-content: flex-end;
  text-align: right;
}

.tea-service-line :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}

.tea-service-radios {
  display: grid;
  grid-template-columns: 130px 220px;
  column-gap: 1rem;
  row-gap: 0;
  justify-content: start;
}

.tea-service-radios :deep(.el-radio) {
  margin-right: 0;
  white-space: nowrap;
}

.tea-service-note {
  margin: -0.375rem 0 0.625rem;
  color: #b45309;
  font-size: 0.75rem;
  line-height: 1.4;
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
  font-weight: bold;
  padding: 0.4375rem 1.25rem;
  font-size: 0.8125rem;
  color: #ffffff;
}

.submit-btn:hover {
  background-color: #005a2e;
  border-color: #005a2e;
}

@media (max-width: 389px) {
  .form-row-three {
    grid-template-columns: 1fr 1fr;
  }
  .paired-layout {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 390px) and (max-width: 767px) {
  .form-row-three {
    grid-template-columns: 1fr 1fr;
  }
  .paired-layout {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1099px) {
  .form-row-three {
    grid-template-columns: 1fr 1fr;
  }
  .paired-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 389px) {
  .booking-dialog-wrapper {
    width: 95% !important;
    max-height: 90vh; /* 小屏降低最大高度，留出更多滚动空间 */
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
  /* 小屏增加表单间距，提升可读性 */
  .booking-form :deep(.el-form-item) {
    margin-bottom: 1rem;
  }
}

@media (min-width: 390px) and (max-width: 767px) {
  .booking-dialog-wrapper {
    width: 95% !important;
    max-height: 90vh; /* 小屏降低最大高度，留出更多滚动空间 */
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
  /* 小屏增加表单间距，提升可读性 */
  .booking-form :deep(.el-form-item) {
    margin-bottom: 1rem;
  }
}

@media (min-width: 1100px) and (max-width: 1599px) {
  .booking-dialog-wrapper {
    width: 95% !important;
    /* max-height：110vh 由脚本 dialogWrapperStyle 控制（与 MeetingApproval 一致） */
  }
}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}

/* 确保下拉框内容可见 */
:deep(.el-select-dropdown),
:deep(.el-popper) {
  z-index: 99999 !important;
}

/* 半宽 Start/End Time 的 el-select */
:deep(.form-row .form-item-half .el-select) {
  width: 100%;
}
</style>