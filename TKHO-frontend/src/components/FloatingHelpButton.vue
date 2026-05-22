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
    <BookingStyleModal v-model="dialogVisible" title="Points to Note" max-width="900px">
      <div class="help-content">
        <p v-if="pointsToNoteLoading" class="empty-note">Loading...</p>
        <div
          v-else-if="currentPointsToNoteContent"
          class="help-rich-content"
          v-html="currentPointsToNoteContent"
        ></div>
        <p v-else class="empty-note">No points to note for current system.</p>
      </div>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMockPromptList } from '@/mocks/mockData'
import { getPrompts, getPublicPointsToNote } from '@/api/promptManagement'
import { formatPointsToNoteForDisplay } from '@/utils/pointsToNoteHtml'
import BookingStyleModal from './BookingStyleModal.vue'

const route = useRoute()
const userStore = useUserStore()
const dialogVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false)
const BUTTON_SIZE = 50
const EDGE_GAP = 10
const POINTS_TO_NOTE_KEYS = {
  parking: 'ev_booking_points_to_note',
  room: 'venue_booking_points_to_note'
}
const pointsToNoteByKey = ref({
  [POINTS_TO_NOTE_KEYS.parking]: '',
  [POINTS_TO_NOTE_KEYS.room]: ''
})
const pointsToNoteLoading = ref(false)

const applyPointsToNoteList = (list) => {
  const items = Array.isArray(list) ? list : []
  pointsToNoteByKey.value = {
    [POINTS_TO_NOTE_KEYS.parking]:
      items.find((item) => item.key === POINTS_TO_NOTE_KEYS.parking)?.content || '',
    [POINTS_TO_NOTE_KEYS.room]:
      items.find((item) => item.key === POINTS_TO_NOTE_KEYS.room)?.content || ''
  }
}

const loadPointsToNote = async () => {
  pointsToNoteLoading.value = true
  try {
    const data = userStore.token
      ? await getPrompts({ category: 'system_fixed' })
      : await getPublicPointsToNote()
    applyPointsToNoteList(data)
  } catch {
    applyPointsToNoteList(getMockPromptList())
  } finally {
    pointsToNoteLoading.value = false
  }
}

const activeSystem = computed(() => {
  if (route.path.startsWith('/evBooking')) return 'parking'
  if (route.path.startsWith('/VenueBooking')) return 'room'
  const systemFromStore = userStore.userInfo?.system
  if (systemFromStore) return systemFromStore
  return ''
})

const currentPointsToNoteKey = computed(() => {
  if (route.path.startsWith('/evBooking')) return POINTS_TO_NOTE_KEYS.parking
  if (route.path.startsWith('/VenueBooking')) return POINTS_TO_NOTE_KEYS.room
  return POINTS_TO_NOTE_KEYS[activeSystem.value] || ''
})

const currentPointsToNoteContent = computed(() => {
  const targetKey = currentPointsToNoteKey.value
  if (!targetKey) return ''
  const rawContent = pointsToNoteByKey.value[targetKey] || ''
  return formatPointsToNoteForDisplay(rawContent)
})

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

// 登录、展示页、EV 管理预订等不显示悬浮帮助
const isLoginPage = computed(() =>
  route.path === '/login' ||
  route.path === '/' ||
  route.path === '/Account' ||
  route.path === '/VenueBooking/Display' ||
  route.path === '/VenueBooking/Display/Merge' ||
  route.path === '/VenueBooking/Display/TeaService' ||
  route.path === '/evBooking/Display' ||
  route.path === '/EVBooking/Display' ||
  route.path === '/evBooking/ManageBooking' ||
  route.path === '/VenueBooking/ManageBooking' ||
  route.name === 'VenueManageBooking'
)

// 初始化位置（右下角）
onMounted(() => {
  loadPointsToNote()
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
  if (!hasMoved.value && currentPointsToNoteContent.value) {
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
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

/* 全局 font-synthesis: none 会吞掉斜体，与 PromptManagement 预览区一致 */
.help-rich-content {
  font-synthesis: style;
}

.help-rich-content :deep(em),
.help-rich-content :deep(i),
.help-rich-content :deep([style*='font-style: italic']),
.help-rich-content :deep([style*='font-style:italic']) {
  font-style: italic !important;
}

.help-rich-content :deep(p) {
  margin: 0 0 8px;
}

.help-rich-content :deep(strong),
.help-rich-content :deep(b) {
  font-weight: 700;
  color: inherit;
}

.help-rich-content :deep(u) {
  text-decoration: underline;
}

.help-rich-content :deep(ol) {
  list-style-type: decimal;
  list-style-position: outside;
  margin: 0;
  padding-left: 1.5rem;
}

.help-rich-content :deep(ul) {
  list-style-type: disc;
  list-style-position: outside;
  margin: 0;
  padding-left: 1.5rem;
}

.help-rich-content :deep(li) {
  display: list-item;
}

.help-rich-content :deep(li + li) {
  margin-top: 6px;
}

.help-rich-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0 0;
  text-align: left;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.help-rich-content :deep(th),
.help-rich-content :deep(td) {
  padding: 6px 10px;
  font-size: 16px;
  text-align: left;
  border: 1px solid #d1d5db;
}

/* 表头默认浅绿底 + 深绿字（覆盖编辑器内联白底） */
.help-rich-content :deep(thead th),
.help-rich-content :deep(th) {
  font-weight: 700;
  background: linear-gradient(135deg, #d0e8d6 0%, #c8e6d0 100%) !important;
  color: #0a3d1f !important;
}

/* 无 thead 时，首行作表头 */
.help-rich-content :deep(table:not(:has(thead)) tbody > tr:first-child > td) {
  font-weight: 700;
  background: linear-gradient(135deg, #d0e8d6 0%, #c8e6d0 100%) !important;
  color: #0a3d1f !important;
}

.help-rich-content :deep(tbody tr:nth-child(odd)) td {
  background-color: #f8fcf9;
}

.help-rich-content :deep(tbody tr:nth-child(even)) td {
  background-color: #ffffff;
}

.empty-note {
  margin: 0;
  color: #6b7280;
}

@media (max-width: 389px) {}

@media (min-width: 390px) and (max-width: 767px) {}

@media (min-width: 768px) and (max-width: 1099px) {}

@media (min-width: 1100px) and (max-width: 1599px) {}

@media (min-width: 1600px) and (max-width: 2239px) {}

@media (min-width: 2240px) {}
</style>
