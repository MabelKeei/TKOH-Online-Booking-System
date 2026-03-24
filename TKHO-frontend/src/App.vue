<template>
  <div id="app">
    <router-view />
    <FloatingHelpButton />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import FloatingHelpButton from './components/FloatingHelpButton.vue'

const userStore = useUserStore()

onMounted(() => {
  // 初始化用户信息
  userStore.initUserInfo()
})
</script>

<style scoped>
#app {
  min-height: var(--zoom-vh);
  background-color: #f5f5f5;
}
</style>

<style>
/* 自定义日期选择器样式 - 全局样式 */
.el-picker-panel {
  border: 1px solid #e5e7eb !important;
}

.el-date-picker__header-label {
  color: #374151 !important;
  font-weight: 600 !important;
}

.el-date-table td.today .el-date-table-cell__text {
  color: #00723a !important;
  font-weight: 700 !important;
}

.el-date-table td.current:not(.disabled) .el-date-table-cell__text {
  background-color: #00723a !important;
  color: white !important;
}

.el-date-table td.available:hover .el-date-table-cell__text {
  background-color: #d6f3c5 !important;
  color: #00723a !important;
}

.el-picker-panel__icon-btn:hover {
  color: #00723a !important;
}
</style>
