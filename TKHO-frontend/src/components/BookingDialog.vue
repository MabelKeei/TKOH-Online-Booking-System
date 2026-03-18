<template>
  <el-dialog
    :model-value="visible"
    :title="isEditing ? 'Edit Booking' : 'Add New Booking'"
    width="500px"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      label-width="120px"
      @submit.prevent="handleConfirm"
    >
      <!-- 房间选择 -->
      <el-form-item label="Room" prop="roomName" :rules="[{ required: true, message: 'Please select a room' }]">
        <el-select v-model="form.roomName" placeholder="Select a room">
          <el-option
            v-for="room in availableRooms"
            :key="room"
            :label="room"
            :value="room"
          />
        </el-select>
      </el-form-item>

      <!-- 日期选择 -->
      <el-form-item label="Date" prop="date" :rules="[{ required: true, message: 'Please select a date' }]">
        <el-date-picker
          v-model="form.date"
          type="date"
          placeholder="Select date"
          :disabledDate="disabledDate"
        />
      </el-form-item>

      <!-- 开始时间 -->
      <el-form-item label="Start Time" prop="startTime" :rules="[{ required: true, message: 'Please select start time' }]">
        <el-time-picker
          v-model="form.startTime"
          placeholder="Pick a start time"
          format="HH:mm"
          :start="8 * 60"
          :end="18 * 60"
        />
      </el-form-item>

      <!-- 结束时间 -->
      <el-form-item label="End Time" prop="endTime" :rules="[{ required: true, message: 'Please select end time' }]">
        <el-time-picker
          v-model="form.endTime"
          placeholder="Pick an end time"
          format="HH:mm"
          :start="8 * 60"
          :end="18 * 60"
        />
      </el-form-item>

      <!-- 参与人数 -->
      <el-form-item label="Attendees" prop="attendees">
        <el-input-number v-model="form.attendees" :min="1" :max="100" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="Notes" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          rows="3"
          placeholder="Add any notes about this booking"
        />
      </el-form-item>

      <!-- 颜色选择 -->
      <el-form-item label="Color" prop="color">
        <div class="color-picker">
          <div
            v-for="color in colorOptions"
            :key="color"
            class="color-option"
            :style="{ backgroundColor: color }"
            :class="{ 'selected': form.color === color }"
            @click="form.color = color"
          />
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleConfirm">
          {{ isEditing ? 'Update' : 'Confirm' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

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
const isEditing = computed(() => !!props.booking)

const colorOptions = [
  '#f97316',
  '#3b82f6',
  '#10b981',
  '#f43f5e',
  '#8b5cf6',
  '#14b8a6'
]

const form = ref({
  roomName: '',
  date: null,
  startTime: null,
  endTime: null,
  attendees: 1,
  notes: '',
  color: '#f97316'
})

// 可用房间列表（根据房间类型）
const availableRooms = computed(() => {
  if (props.roomType === 'conference') {
    return [
      'Conference Room A',
      'Conference Room B',
      'Conference Room C',
      'Discussion Room 1',
      'Discussion Room 2'
    ]
  } else {
    return [
      'Main Hall',
      'Garden Area',
      'Outdoor Pavilion',
      'Event Space 1',
      'Event Space 2'
    ]
  }
})

// 禁用过去的日期
function disabledDate(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

// 初始化表单
function initializeForm() {
  if (props.booking) {
    form.value = { ...props.booking }
  } else {
    form.value = {
      roomName: '',
      date: null,
      startTime: null,
      endTime: null,
      attendees: 1,
      notes: '',
      color: '#f97316'
    }

    // 如果有选定的时间，初始化表单
    if (props.selectedTime) {
      form.value.date = new Date(props.selectedTime.date)
      form.value.startTime = props.selectedTime.time
    }
  }
}

// 确认预订
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

// 关闭对话框
function handleClose() {
  emit('close')
}

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initializeForm()
  }
})

// 初始化
initializeForm()
</script>

<style scoped>
:deep(.el-dialog__body) {
  padding: 1.5rem;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: #111827;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #111827;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
