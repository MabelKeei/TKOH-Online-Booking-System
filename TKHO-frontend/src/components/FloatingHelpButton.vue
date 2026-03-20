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
    <el-dialog
      v-model="dialogVisible"
      title="Points to Note"
      width="700px"
      :close-on-click-modal="true"
    >
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
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const dialogVisible = ref(false)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const hasMoved = ref(false)

// 检查是否在登录页面
const isLoginPage = computed(() => route.path === '/login' || route.path === '/')

// 初始化位置（右下角）
onMounted(() => {
  position.value = {
    x: window.innerWidth - 70,
    y: window.innerHeight - 70
  }
})

const startDrag = (e) => {
  isDragging.value = true
  hasMoved.value = false
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return

  hasMoved.value = true

  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y

  // 限制在窗口范围内
  position.value = {
    x: Math.max(0, Math.min(newX, window.innerWidth - 60)),
    y: Math.max(0, Math.min(newY, window.innerHeight - 60))
  }
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
})
</script>

<style scoped>
.floating-help-button {
  position: fixed;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00723a 0%, #009647 100%);
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
</style>
