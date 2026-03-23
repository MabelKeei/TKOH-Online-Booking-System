<template>
  <!-- 自定义遮罩 + 弹窗 -->
  <div class="modal-overlay" @click.self="handleClose" v-if="visible">
    <div
      class="booking-dialog-wrapper"
      :style="{ transform: `translate(${dialogX}px, ${dialogY}px)` }"
    >
      <!-- 头部 -->
      <div class="modal-header" @mousedown="handleMouseDown">
        <span class="modal-title">ADD BOOKING | CARPARK EV BOOKING CALENDAR</span>
        <button class="modal-close" @click="handleClose">
          <svg viewBox="0 0 24 24" class="close-icon">
            <path d="M18 6L6 18M6 6l12 12" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 内容 -->
      <div class="modal-body">
        <div class="booking-form-container">
          <!-- License plate number -->
          <div class="form-section">
            <label class="form-label">License plate number <span class="required">*</span></label>
            <el-select
              v-model="form.licensePlate"
              placeholder="Select license plate"
              class="form-input"
              size="large"
            >
              <el-option
                v-for="vehicle in vehicles"
                :key="vehicle.id"
                :label="vehicle.label"
                :value="vehicle.id"
              />
            </el-select>
          </div>

          <!-- Time period -->
          <div class="form-section">
            <label class="form-label">Time period <span class="required">*</span></label>
            <div class="time-period-group">
              <label
                v-for="period in timePeriods"
                :key="period.value"
                class="time-period-option"
                :class="{
                  'is-selected': form.timePeriod === period.value,
                  'is-disabled': !isTimeAvailable(period.value)
                }"
              >
                <input
                  type="radio"
                  :value="period.value"
                  v-model="form.timePeriod"
                  :disabled="!isTimeAvailable(period.value)"
                  class="time-radio"
                />
                <span class="time-label">{{ period.label }}</span>
              </label>
            </div>
          </div>

          <!-- Date -->
          <div class="form-section">
            <label class="form-label">Date <span class="required">*</span></label>
            <el-date-picker
              v-model="form.date"
              type="date"
              placeholder="Select date"
              class="form-input"
              size="large"
              :disabled-date="disabledDate"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
            />
          </div>

          <!-- Parking space -->
          <div class="form-section parking-info-section">
            <div class="parking-info">
              <span class="parking-label">Parking space:</span>
              <span class="parking-value">B3 (auto-assigned)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <el-button @click="handleClose" class="cancel-btn">Cancel</el-button>
        <el-button @click="handleSave" class="save-btn">Save</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    default: ''
  },
  selectedPeriod: {
    type: String,
    default: ''
  },
  availableSlots: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'confirm'])

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

// 时间段选项
const timePeriods = [
  { value: 'am', label: 'AM (08:30 - 13:00)' },
  { value: 'pm', label: 'PM (13:45 - 18:15)' },
  { value: 'night', label: 'Night (19:00 - 23:30)' }
]

// 车辆列表
const vehicles = ref([
  { id: 'AB1234', label: 'AB1234 (Toyota - Personal)' },
  { id: 'CD5678', label: 'CD5678 (Honda - Personal)' },
  { id: 'EF9012', label: 'EF9012 (Tesla - Company)' },
  { id: 'GH3456', label: 'GH3456 (BMW - Personal)' }
])

// 表单数据
const form = ref({
  licensePlate: '',
  timePeriod: '',
  date: '',
  parkingSpace: 'B3'
})

// 监听选中的日期和时段
watch(() => [props.selectedDate, props.selectedPeriod], ([date, period]) => {
  if (date) form.value.date = date
  if (period) form.value.timePeriod = period
}, { immediate: true })

// 检查时段是否可用
function isTimeAvailable(period) {
  if (!form.value.date) return true
  const key = `${form.value.date}-${period}`
  const slot = props.availableSlots[key]
  return !slot || slot.available > 0
}

// 禁用日期（只能预订未来14天）
function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 13)
  return date < today || date > maxDate
}

// 关闭对话框
function handleClose() {
  // 重置拖拽位置
  dialogX.value = 0
  dialogY.value = 0
  emit('close')
}

// 保存预订
function handleSave() {
  if (!form.value.licensePlate) {
    ElMessage.warning('Please select a license plate')
    return
  }
  if (!form.value.timePeriod) {
    ElMessage.warning('Please select a time period')
    return
  }
  if (!form.value.date) {
    ElMessage.warning('Please select a date')
    return
  }

  emit('confirm', {
    licensePlate: form.value.licensePlate,
    timePeriod: form.value.timePeriod,
    date: form.value.date,
    parkingSpace: form.value.parkingSpace
  })
}
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

/* 弹窗容器 */
.booking-dialog-wrapper {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: min(500px, 95vw);
  max-height: min(90vh, 700px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 头部 */
.modal-header {
  background: #00723a;
  color: #fff;
  padding: clamp(0.625rem, 2vh, 1rem) clamp(0.875rem, 3vw, 1.5rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
}

.modal-title {
  font-size: clamp(0.625rem, 1.8vw, 0.875rem);
  font-weight: 700;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.modal-close:hover {
  opacity: 0.8;
}

.close-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

/* 内容区域 */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: clamp(0.75rem, 2.5vh, 1.5rem) clamp(0.875rem, 3vw, 1.5rem);
  background: #fafafa;
  min-height: 0;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 表单容器 */
.booking-form-container {
  display: flex;
  flex-direction: column;
  gap: clamp(0.625rem, 2vh, 1rem);
}

/* 表单区块 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 1vh, 0.5rem);
}

.form-label {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  line-height: 1.2;
}

.required {
  color: #dc2626;
  font-weight: 700;
}

/* 输入框样式 */
.form-input {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(0, 114, 58, 0.1);
  border-color: #00723a;
}

/* 时间段选择组 */
.time-period-group {
  display: flex;
  flex-direction: column;
  gap: clamp(0.375rem, 1.5vh, 0.625rem);
  background: white;
  padding: clamp(0.5rem, 1.5vh, 0.875rem);
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.time-period-option {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  padding: clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.625rem, 2vw, 0.875rem);
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
  min-height: 2.5rem;
}

.time-period-option:hover:not(.is-disabled) {
  background: #f3f4f6;
  border-color: #00723a;
  transform: translateX(4px);
}

.time-period-option.is-selected {
  background: #d6f3c5;
  border-color: #00723a;
  box-shadow: 0 2px 6px rgba(0, 114, 58, 0.2);
}

.time-period-option.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.time-radio {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #00723a;
}

.time-period-option.is-disabled .time-radio {
  cursor: not-allowed;
}

.time-label {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  font-weight: 500;
  color: #374151;
  flex: 1;
  line-height: 1.2;
}

.time-period-option.is-selected .time-label {
  color: #00723a;
  font-weight: 600;
}

/* 停车位信息 */
.parking-info-section {
  margin-top: 0;
}

.parking-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 1.5vh, 0.75rem) clamp(0.625rem, 2vw, 0.875rem);
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
}

.parking-label {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  font-weight: 600;
  color: #166534;
  line-height: 1.2;
}

.parking-value {
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  font-weight: 500;
  color: #15803d;
  line-height: 1.2;
}

/* 底部按钮 */
.modal-footer {
  padding: clamp(0.625rem, 1.5vh, 0.875rem) clamp(0.875rem, 3vw, 1.5rem);
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  flex-shrink: 0;
}

.cancel-btn,
.save-btn {
  padding: clamp(0.5rem, 1.2vh, 0.625rem) clamp(1rem, 3vw, 1.5rem);
  font-weight: 600;
  font-size: clamp(0.75rem, 1.8vw, 0.875rem);
  border-radius: 6px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.cancel-btn {
  background: #6b7280;
  color: white;
}

.cancel-btn:hover {
  background: #4b5563;
}

.save-btn {
  background: #f97316;
  color: white;
}

.save-btn:hover {
  background: #ea580c;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .booking-dialog-wrapper {
    max-width: 98vw;
    max-height: 95vh;
  }

  .modal-body {
    padding: 0.75rem;
  }

  .booking-form-container {
    gap: 0.625rem;
  }

  .time-period-group {
    padding: 0.5rem;
    gap: 0.375rem;
  }

  .time-period-option {
    padding: 0.5rem;
    min-height: 2.25rem;
  }

  .modal-header {
    padding: 0.625rem 0.875rem;
  }

  .modal-title {
    font-size: 0.625rem;
    letter-spacing: 0.2px;
  }

  .close-icon {
    width: 16px;
    height: 16px;
  }

  .modal-footer {
    padding: 0.625rem 0.875rem;
  }
}

@media (max-height: 700px) {
  .booking-dialog-wrapper {
    max-height: 95vh;
  }

  .modal-body {
    padding: 0.75rem 1rem;
  }

  .booking-form-container {
    gap: 0.5rem;
  }

  .form-section {
    gap: 0.375rem;
  }

  .time-period-group {
    padding: 0.625rem;
    gap: 0.375rem;
  }

  .time-period-option {
    padding: 0.5rem 0.625rem;
    min-height: 2.25rem;
  }

  .parking-info {
    padding: 0.5rem 0.625rem;
  }

  .modal-header {
    padding: 0.625rem 1rem;
  }

  .modal-footer {
    padding: 0.625rem 1rem;
  }
}

@media (max-height: 600px) {
  .booking-dialog-wrapper {
    max-height: 98vh;
  }

  .modal-body {
    padding: 0.5rem 0.875rem;
  }

  .booking-form-container {
    gap: 0.375rem;
  }

  .time-period-group {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  .time-period-option {
    padding: 0.375rem 0.5rem;
    min-height: 2rem;
  }

  .modal-header {
    padding: 0.5rem 0.875rem;
  }

  .modal-footer {
    padding: 0.5rem 0.875rem;
  }
}
</style>
