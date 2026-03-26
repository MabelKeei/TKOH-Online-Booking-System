<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal-overlay booking-style-modal-root"
      @click.self="onOverlayClick"
    >
      <div
        class="booking-dialog-wrapper"
        :style="wrapperStyle"
      >
        <div class="modal-header" @mousedown="handleMouseDown">
          <span class="modal-title">{{ title }}</span>
          <button type="button" class="modal-close" aria-label="Close" @click="close">
            <svg viewBox="0 0 24 24" class="close-icon">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  /** 与 VenueBookingDialog 一致：横向占比 */
  dialogWidth: {
    type: String,
    default: '92%'
  },
  maxWidth: {
    type: String,
    default: '640px'
  },
  /** 弹窗整体最大高度，默认 94vh，可按视口在页面侧覆盖 */
  maxHeight: {
    type: String,
    default: '94vh'
  },
  /** 为 false 时点击遮罩不关闭（对齐 el-dialog close-on-click-modal=false） */
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dialogX = ref(0)
const dialogY = ref(0)

const wrapperStyle = computed(() => ({
  transform: `translate(${dialogX.value}px, ${dialogY.value}px)`,
  '--bsm-width': props.dialogWidth,
  '--bsm-max-width': props.maxWidth,
  '--bsm-max-height': props.maxHeight
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

function onOverlayClick() {
  if (props.closeOnClickOverlay) close()
}

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      dialogX.value = 0
      dialogY.value = 0
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style>
/* 与 VenueBookingDialog.vue 弹窗外壳一致 */
.booking-style-modal-root.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10050;
  overflow-y: auto;
  padding: 20px 0;
}

.booking-style-modal-root .booking-dialog-wrapper {
  width: var(--bsm-width, 92%);
  max-width: var(--bsm-max-width, 640px);
  max-height: var(--bsm-max-height, 94vh);
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  /* teleported=false 时下拉在弹窗内，避免 overflow:hidden 裁切 */
  overflow: visible;
  position: relative;
  z-index: 10051;
  flex-shrink: 0;
}

.booking-style-modal-root .modal-header {
  background: #00723a;
  color: #fff;
  padding: 0.75rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.booking-style-modal-root .modal-title {
  font-size: 1.0625rem;
  font-weight: 600;
  line-height: 1.5;
}

.booking-style-modal-root .modal-close {
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

.booking-style-modal-root .close-icon {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}

.booking-style-modal-root .modal-close:hover .close-icon {
  stroke: #d1fae5;
}

.booking-style-modal-root .modal-body {
  padding: 1.125rem 1.75rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-bottom: 20px;
}

.booking-style-modal-root .modal-body::-webkit-scrollbar {
  width: 6px;
}

.booking-style-modal-root .modal-body::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.booking-style-modal-root .modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.booking-style-modal-root .modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}
</style>
