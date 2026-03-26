<template>
  <BookingStyleModal
    :model-value="visible"
    title="Booking Details"
    max-width="400px"
    @update:model-value="onVisibleUpdate"
  >
    <div v-if="booking" class="booking-details">
      <div class="detail-item">
        <label class="detail-label">Room:</label>
        <span class="detail-value">{{ booking.roomName }}</span>
      </div>

      <div class="detail-item">
        <label class="detail-label">Date:</label>
        <span class="detail-value">
          {{ new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) }}
        </span>
      </div>

      <div class="detail-item">
        <label class="detail-label">Time:</label>
        <span class="detail-value">
          {{ booking.startTime }} - {{ booking.endTime }}
        </span>
      </div>

      <div class="detail-item">
        <label class="detail-label">Attendees:</label>
        <span class="detail-value">{{ booking.attendees || '-' }}</span>
      </div>

      <div v-if="booking.notes" class="detail-item">
        <label class="detail-label">Notes:</label>
        <span class="detail-value">{{ booking.notes }}</span>
      </div>

      <div class="detail-item">
        <label class="detail-label">Color:</label>
        <div class="detail-value">
          <div
            class="color-display"
            :style="{ backgroundColor: booking.color || '#f97316' }"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button type="default" class="danger-submit-btn" @click="handleDelete">Delete</el-button>
        <el-button type="default" class="cancel-btn" @click="handleClose">Close</el-button>
      </span>
    </template>
  </BookingStyleModal>
</template>

<script setup>
import BookingStyleModal from './BookingStyleModal.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  booking: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'delete'])

function onVisibleUpdate(v) {
  if (!v) handleClose()
}

const handleDelete = () => {
  if (props.booking) {
    emit('delete', props.booking.id)
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.booking-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  min-width: 100px;
}

.detail-value {
  color: #111827;
  text-align: right;
  flex: 1;
}

.color-display {
  width: 24px;
  height: 24px;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  width: 100%;
}
</style>
