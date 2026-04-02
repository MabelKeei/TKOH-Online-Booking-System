<template>
  <div v-if="!isLoginPage">
    <!-- 可拖拽的悬浮按钮 -->
    <div
      class="floating-help-button"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      title="Points to Note"
      aria-label="Points to Note"
      @mousedown="startDrag"
      @click="handleClick"
    >
      <span class="icon">!</span>
    </div>

    <!-- 帮助信息弹窗 -->
    <BookingStyleModal v-model="dialogVisible" title="Points to Note" max-width="700px">
      <div class="help-content">
        <ol>
          <li>
            1. For reservation of other venues (e.g. Courtyard or Glasshouse), please contact General Office at <strong>22081951</strong> directly
          </li>
          <li>
            2. General Office reserves the right to cancel any booking or reassign another venue under necessary circumstances.
          </li>
          <li>
            3. Should user require the following service for the meeting, please directly contact the respective department in advance for arrangement
          </li>
        </ol>

        <table class="service-table">
          <thead>
            <tr>
              <th>Service/Equipment</th>
              <th>Subject Department</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Zoom/Video Conferencing</td>
              <td>Information Technology Dept (Tel: 22081830)</td>
            </tr>
            <tr>
              <td>Venue Setting / Furniture on-loan</td>
              <td>Facility Management Dept (Tel: 22081845)</td>
            </tr>
            <tr>
              <td>Equipment on-loan</td>
              <td>General Office (Tel: 22081951)</td>
            </tr>
            <tr>
              <td>Tea Service for Conference Rooms (ad-hoc)</td>
              <td>General Office (Tel: 22081951)</td>
            </tr>
            <tr>
              <td>Tea Service for Other Venue and Rooms</td>
              <td>Via ADS</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import BookingStyleModal from './BookingStyleModal.vue'

const route = useRoute()
const dialogVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false)
const BUTTON_SIZE = 50
const EDGE_GAP = 10

const getZoomScale = () => {
  const zoomRaw = window.getComputedStyle(document.documentElement).zoom
  const zoom = Number.parseFloat(zoomRaw)
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1
}

const getViewport = () => {
  const scale = getZoomScale()
  return {
    width: window.innerWidth / scale,
    height: window.innerHeight / scale
  }
}

const clampPosition = (x, y) => {
  const { width, height } = getViewport()
  return {
    x: Math.max(EDGE_GAP, Math.min(x, width - BUTTON_SIZE - EDGE_GAP)),
    y: Math.max(EDGE_GAP, Math.min(y, height - BUTTON_SIZE - EDGE_GAP))
  }
}

const placeToBottomRight = () => {
  const { width, height } = getViewport()
  position.value = clampPosition(width - BUTTON_SIZE - EDGE_GAP, height - BUTTON_SIZE - EDGE_GAP)
}

const keepInsideViewport = () => {
  position.value = clampPosition(position.value.x, position.value.y)
}

const recalibrateAfterRouteChange = async () => {
  await nextTick()
  keepInsideViewport()
  requestAnimationFrame(() => {
    keepInsideViewport()
  })
}

// 检查是否在登录页面或 display 页面（含 merge 独立页，不显示悬浮帮助）
const isLoginPage = computed(() =>
  route.path === '/login' ||
  route.path === '/' ||
  route.path === '/VenueBooking/Display' ||
  route.path === '/VenueBooking/Display/Merge' ||
  route.path === '/VenueBooking/Display/TeaService'
)

// 初始化位置（右下角）
onMounted(() => {
  placeToBottomRight()
  window.addEventListener('resize', keepInsideViewport)
})

watch(
  () => route.fullPath,
  () => {
    recalibrateAfterRouteChange()
  }
)

const startDrag = (e) => {
  isDragging.value = true
  hasMoved.value = false
  const scale = getZoomScale()
  dragStart.value = {
    x: e.clientX / scale - position.value.x,
    y: e.clientY / scale - position.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return

  hasMoved.value = true

  const scale = getZoomScale()
  const newX = e.clientX / scale - dragStart.value.x
  const newY = e.clientY / scale - dragStart.value.y

  // 限制在窗口范围内
  position.value = clampPosition(newX, newY)
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const handleClick = () => {
  // 只有在没有拖拽时才打开弹窗
  if (!hasMoved.value) {
    dialogVisible.value = true
  }
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('resize', keepInsideViewport)
})
</script>

<style scoped>
.floating-help-button {
  position: fixed;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0A3D1F 0%, #009647 100%);
  box-shadow: 0 4px 12px rgba(0, 114, 58, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  transition: transform 0.2s, box-shadow 0.2s;
  user-select: none;
}

.floating-help-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 114, 58, 0.4);
}

.floating-help-button:active {
  transform: scale(0.95);
}

.icon {
  color: white;
  font-size: 32px;
  font-weight: bold;
  font-family: Arial, sans-serif;
}

.help-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.help-content ol {
  padding-left: 20px;
  margin-bottom: 20px;
}

.help-content li {
  margin-bottom: 12px;
}

.service-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.service-table th,
.service-table td {
  border: 1px solid #e5e7eb;
  padding: 12px;
  text-align: left;
}

.service-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #111827;
}

.service-table tr:hover {
  background-color: #f9fafb;
}

@media (max-width: 389px) {}

@media (min-width: 390px) and (max-width: 767px) {}

@media (min-width: 768px) and (max-width: 1099px) {}

@media (min-width: 1100px) and (max-width: 1599px) {}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}
</style>
