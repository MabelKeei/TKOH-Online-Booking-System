<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onMounted(() => {
  // 初始化用户信息
  userStore.initUserInfo()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
