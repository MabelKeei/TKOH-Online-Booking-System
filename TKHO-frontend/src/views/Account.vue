<template>
  <div class="page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden">
    <AppHeader @logout="onLogout" />

    <main class="flex-1 flex items-center justify-center px-6">
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-900">Account</h2>
        <p class="mt-3 text-gray-600">（空白页面，占位用）</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()

const onLogout = () => {
  router.push('/login')
}
</script>
