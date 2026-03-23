<template>
  <header class="app-header w-full bg-[#00723a] text-white flex items-center justify-between px-8 py-3">
    <div class="header-left flex items-center gap-3">
      <img src="../assets/TKOH_logo.png" alt="TKHO Logo" class="header-logo" />
      <h1 class="text-lg font-semibold">
        {{ headerTitle }}
      </h1>
    </div>

    <nav class="flex items-center gap-4">
      <RouterLink
        :to="calendarPath"
        class="header-link"
        :class="{ 'is-active': isCalendarNavActive }"
      >
        Calendar
      </RouterLink>
      <RouterLink
        :to="manageBookingPath"
        class="header-link"
        :class="{ 'is-active': isActive(manageBookingPath) }"
      >
        Manage Booking
      </RouterLink>
      <RouterLink
        to="/Account"
        class="header-link"
        :class="{ 'is-active': isActive('/Account') }"
        @click="saveCurrentPath"
      >
        Account
      </RouterLink>

      <div class="logout-wrapper">
        <button class="logout-btn" @click="$emit('logout')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Log out
        </button>
        <div class="switch-dropdown">
          <button class="switch-btn" @click="handleSwitch">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="17 1 21 5 17 9"></polyline>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <polyline points="7 23 3 19 7 15"></polyline>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
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
  // 如果在 Account 页面，检查来源
  if (route.path === '/Account') {
    const fromPath = sessionStorage.getItem('accountFromPath')
    if (fromPath) {
      return fromPath.includes('VenueBooking')
    }
  }
  return route.path.includes('VenueBooking')
})

const calendarPath = computed(() =>
  isVenuePage.value ? '/VenueBooking/Calendar' : '/evBooking/Calendar'
)

const isCalendarNavActive = computed(() => {
  if (isVenuePage.value) {
    return route.path === '/VenueBooking/Calendar'
  }
  return route.path === '/evBooking' || route.path === '/evBooking/Calendar'
})

// 页面标题
const headerTitle = computed(() => {
  return isVenuePage.value ? 'TKHO Venue Booking' : 'TKHO EV Booking'
})

// 切换按钮文字
const switchButtonText = computed(() => {
  return isVenuePage.value ? 'Switch EV Booking' : 'Switch Venue Booking'
})

const manageBookingPath = computed(() => {
  return isVenuePage.value ? '/VenueBooking/ManageBooking' : '/evBooking/ManageBooking'
})

// 处理切换
const handleSwitch = () => {
  if (isVenuePage.value) {
    router.push('/evBooking/Calendar')
  } else {
    router.push('/VenueBooking')
  }
}

// 保存当前路径到 sessionStorage
const saveCurrentPath = () => {
  if (route.path !== '/Account') {
    sessionStorage.setItem('accountFromPath', route.path)
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

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
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

.logout-btn {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.375rem 0.75rem;
  min-height: 30px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.logout-btn svg {
  width: 14px;
  height: 14px;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.logout-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

.switch-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  border-radius: 8px;
  padding: 0.4rem 0.875rem;
  min-height: 32px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.switch-btn svg {
  width: 14px;
  height: 14px;
}

.switch-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.switch-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
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

  .header-logo {
    height: 24px;
  }

  nav {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
