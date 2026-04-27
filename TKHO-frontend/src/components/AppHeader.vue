<template>
  <header class="app-header w-full bg-[#0A3D1F] text-white flex items-center justify-between px-8 py-3">
    <div class="header-left flex items-center gap-3">
      <img src="../assets/TKOH_logo.png" alt="TKOH Logo" class="header-logo" />
      <h1 class="text-lg font-semibold">
        {{ headerTitle }}
      </h1>
    </div>

    <nav class="flex items-center gap-4">
      <div v-if="isAdmin" class="admin-link-wrapper">
        <RouterLink
          to="/admin"
          class="header-link admin-link"
          :class="{ 'is-active': isAdminNavActive }"
        >
          Admin
        </RouterLink>
        <span v-if="totalPendingCount > 0" class="badge-dot">{{ totalPendingCount > 99 ? '99+' : totalPendingCount }}</span>
      </div>

      <!-- 管理员：Calendar / Manage Booking 悬停选择 Venue / EV -->
      <template v-if="isAdmin">
        <div class="nav-dropdown">
          <button
            type="button"
            class="header-link dropdown-trigger"
            :class="{ 'is-active': isCalendarNavActive }"
          >
            {{ calendarNavLabel }}
          </button>
          <div class="dropdown-panel">
            <div class="dropdown-panel-inner">
              <RouterLink
                to="/VenueBooking/Calendar"
                class="dropdown-link"
                :class="{ 'is-active-sub': route.path === '/VenueBooking/Calendar' }"
              >
                Venue
              </RouterLink>
              <RouterLink
                to="/evBooking/Calendar"
                class="dropdown-link"
                :class="{ 'is-active-sub': route.path === '/evBooking/Calendar' || route.path === '/evBooking' }"
              >
                EV
              </RouterLink>
            </div>
          </div>
        </div>

        <div class="nav-dropdown">
          <button
            type="button"
            class="header-link dropdown-trigger"
            :class="{ 'is-active': isManageNavActive }"
          >
            {{ manageNavLabel }}
          </button>
          <div class="dropdown-panel">
            <div class="dropdown-panel-inner">
              <RouterLink
                to="/VenueBooking/ManageBooking"
                class="dropdown-link"
                :class="{ 'is-active-sub': route.path === '/VenueBooking/ManageBooking' }"
              >
                Venue
              </RouterLink>
              <RouterLink
                to="/evBooking/ManageBooking"
                class="dropdown-link"
                :class="{ 'is-active-sub': route.path === '/evBooking/ManageBooking' }"
              >
                EV
              </RouterLink>
            </div>
          </div>
        </div>
      </template>

      <!-- 普通用户：单链接 + Switch -->
      <template v-else>
        <RouterLink
          :to="calendarPath"
          class="header-link"
          :class="{ 'is-active': isCalendarNavActive }"
        >
          {{ calendarNavLabel }}
        </RouterLink>
        <RouterLink
          :to="manageBookingPath"
          class="header-link"
          :class="{ 'is-active': isActive(manageBookingPath) }"
        >
          {{ manageNavLabel }}
        </RouterLink>
      </template>

      <RouterLink
        to="/Account"
        class="header-link"
        :class="{ 'is-active': isActive('/Account') }"
        @click="saveCurrentPath"
      >
        {{ accountNavLabel }}
      </RouterLink>

      <div class="logout-wrapper">
        <button type="button" class="logout-btn" @click="userStore.performLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Log out
        </button>
        <!-- 仅非管理员：悬停显示 Venue/EV 切换 -->
        <div v-if="!isAdmin" class="switch-dropdown">
          <button type="button" class="switch-btn" @click="handleSwitch">
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
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAdminStore } from '@/stores/admin'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const adminStore = useAdminStore()
const { isAdmin } = storeToRefs(userStore)
const { totalPendingCount } = storeToRefs(adminStore)

let pollingInterval = null

onMounted(() => {
  if (isAdmin.value) {
    adminStore.fetchPendingCounts()
    // 每30秒轮询一次
    pollingInterval = setInterval(() => {
      adminStore.fetchPendingCounts()
    }, 30000)
  }
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})

const isActive = (path) => route.path === path

/** 所有 /admin 及子路径下均高亮 Admin */
const isAdminNavActive = computed(() => {
  const p = route.path
  return p === '/admin' || p.startsWith('/admin/')
})

const isVenuePage = computed(() => {
  if (route.path === '/Account') {
    const fromPath = sessionStorage.getItem('accountFromPath')
    if (fromPath) {
      return fromPath.includes('VenueBooking')
    }
  }
  return route.path.includes('VenueBooking')
})

const navSection = computed(() => {
  if (route.path === '/Account') {
    const fromPath = sessionStorage.getItem('accountFromPath')
    if (fromPath?.includes('/admin')) return 'admin'
    if (fromPath?.includes('VenueBooking')) return 'venue'
    return 'ev'
  }
  if (route.path.includes('/admin')) return 'admin'
  if (route.path.includes('VenueBooking')) return 'venue'
  return 'ev'
})

const calendarPath = computed(() =>
  isVenuePage.value ? '/VenueBooking/Calendar' : '/evBooking/Calendar'
)

const isCalendarNavActive = computed(() => {
  if (isAdmin.value) {
    return (
      route.path === '/VenueBooking/Calendar' ||
      route.path === '/evBooking/Calendar' ||
      route.path === '/evBooking'
    )
  }
  if (isVenuePage.value) {
    return route.path === '/VenueBooking/Calendar'
  }
  return route.path === '/evBooking' || route.path === '/evBooking/Calendar'
})

const isManageNavActive = computed(() => {
  if (isAdmin.value) {
    return route.path === '/VenueBooking/ManageBooking' || route.path === '/evBooking/ManageBooking'
  }
  return route.path === manageBookingPath.value
})

const headerTitle = computed(() => {
  if (route.path.includes('/admin')) {
    return 'TKOH GA Service Center'
  }
  return isVenuePage.value ? 'TKOH Venue Booking' : 'TKOH EV Booking'
})

const switchButtonText = computed(() => {
  return isVenuePage.value ? 'Switch EV Booking' : 'Switch Venue Booking'
})

const manageBookingPath = computed(() => {
  return isVenuePage.value ? '/VenueBooking/ManageBooking' : '/evBooking/ManageBooking'
})

const calendarNavLabel = computed(() => {
  if (navSection.value === 'ev' || navSection.value === 'venue') return 'Book Now'
  return 'Calendar'
})

const manageNavLabel = computed(() => {
  if (navSection.value === 'ev' || navSection.value === 'venue') return 'My Bookings'
  return 'Manage Booking'
})

const accountNavLabel = computed(() => {
  if (navSection.value === 'ev' || navSection.value === 'venue') return 'My Account'
  return 'Account'
})

const handleSwitch = () => {
  if (isVenuePage.value) {
    router.push('/evBooking/Calendar')
  } else {
    router.push('/VenueBooking')
  }
}

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

.admin-link-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.admin-link {
  display: inline-block;
}

.admin-link:hover {
  text-decoration: underline;
}

.admin-link.is-active {
  text-decoration: underline;
}

.badge-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: #fff;
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 9px;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.nav-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  color: inherit;
}

.nav-dropdown:hover .dropdown-panel,
.dropdown-panel:hover {
  display: block;
}

.dropdown-panel {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 0.35rem;
  min-width: 148px;
  z-index: 1001;
}

.dropdown-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.35rem;
}

.dropdown-panel-inner {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  background: #fff;
}

.dropdown-link {
  display: block;
  padding: 0.5rem 0.875rem;
  background: #fff;
  color: #0a3d1f;
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-link:last-child {
  border-bottom: none;
}

.dropdown-link:hover {
  background: #ecfdf5;
}

.dropdown-link.is-active-sub {
  background: #d1fae5;
  color: #065f46;
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

@media (min-width: 768px) and (max-width: 1099px) {
  .app-header {
    padding-inline: 0.75rem;
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .app-header h1 {
    font-size: 1rem;
  }

  nav {
    width: 100%;
    justify-content: flex-end;
    gap: 0.625rem;
    flex-wrap: wrap;
  }
}

@media (max-width: 389px) {
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

@media (min-width: 390px) and (max-width: 767px) {
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
