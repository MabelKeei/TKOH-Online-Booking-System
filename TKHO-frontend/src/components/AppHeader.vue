<template>
  <header class="app-header w-full bg-[#00723a] text-white flex items-center justify-between px-8 py-3">
    <h1 class="text-lg font-semibold">
      {{ headerTitle }}
    </h1>

    <nav class="flex items-center gap-4">
      <RouterLink
        to="/VenueBooking/Calendar"
        class="header-link"
        :class="{ 'is-active': isActive('/VenueBooking/Calendar') }"
      >
        Calendar
      </RouterLink>
      <RouterLink
        to="/VenueBooking/ManageBooking"
        class="header-link"
        :class="{ 'is-active': isActive('/VenueBooking/ManageBooking') }"
      >
        Manage Booking
      </RouterLink>
      <RouterLink
        to="/Account"
        class="header-link"
        :class="{ 'is-active': isActive('/Account') }"
      >
        Account
      </RouterLink>

      <div class="logout-wrapper">
        <el-button size="small" class="logout-btn !px-4" @click="$emit('logout')">
          Log out
        </el-button>
        <div class="switch-dropdown">
          <button class="switch-btn" @click="handleSwitch">
            {{ switchButtonText }}
          </button>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineEmits(['logout'])

const route = useRoute()
const router = useRouter()

const isActive = (path) => route.path === path

// 判断当前是否在 Venue 相关页面
const isVenuePage = computed(() => {
  return route.path.includes('VenueBooking') ||
         route.path === '/Account'
})

// 页面标题
const headerTitle = computed(() => {
  return isVenuePage.value ? 'TKHO Venue Booking' : 'TKHO EV Booking'
})

// 切换按钮文字
const switchButtonText = computed(() => {
  return isVenuePage.value ? 'Switch EV Booking' : 'Switch Venue Booking'
})

// 处理切换
const handleSwitch = () => {
  if (isVenuePage.value) {
    router.push('/evBooking')
  } else {
    router.push('/VenueBooking')
  }
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-link {
  font-weight: 700;
  color: #fff;
  background: transparent;
  padding: 0;
  border: 0;
  text-decoration: none;
  line-height: 1;
}

.header-link:hover {
  text-decoration: underline;
}

.header-link.is-active {
  text-decoration: underline;
}

.logout-wrapper {
  position: relative;
  display: inline-block;
}

.logout-wrapper:hover .switch-dropdown,
.switch-dropdown:hover {
  display: block;
}

.switch-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0;
  z-index: 1000;
  padding-top: 0.5rem;
}

.switch-btn {
  background-color: #3b82f6;
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: inherit;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  min-height: 36px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.switch-btn:hover {
  background-color: #2563eb;
}

.logout-btn {
  background-color: #f97316 !important;
  border-color: #f97316 !important;
  color: #fff !important;
  font-weight: 700 !important;
  font-size: inherit !important;
  border-radius: 8px !important;
  padding-top: 0.4rem !important;
  padding-bottom: 0.4rem !important;
  min-height: 32px;
}

@media (max-width: 768px) {
  .app-header {
    padding-inline: 1rem;
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .app-header h1 {
    font-size: 1rem;
  }

  nav {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
