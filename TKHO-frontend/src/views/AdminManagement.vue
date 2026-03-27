<template>
  <div class="admin-container">
    <AppHeader @logout="handleLogout" />

    <div class="admin-layout">
      <!-- Left Sidebar Menu -->
      <aside :class="['admin-sidebar', { collapsed: isCollapsed }]">
        <div
          class="sidebar-header"
          :class="{ 'is-home': isAdminHome }"
          role="button"
          tabindex="0"
          title="Back to admin home"
          @click="goAdminHome"
          @keydown.enter.prevent="goAdminHome"
          @keydown.space.prevent="goAdminHome"
        >
          <el-icon class="sidebar-header-icon">
            <HelpFilled />
          </el-icon>
          <span v-if="!isCollapsed">Admin Panel</span>
        </div>
        <nav class="sidebar-menu">
          <div
            v-for="item in menuItems"
            :key="item.key"
            :class="['menu-item', { active: activeMenu === item.key }]"
            @click="navigateTo(item.path)"
            :title="item.label"
          >
            <font-awesome-icon :icon="['fas', item.icon]" class="menu-icon" />
            <span v-if="!isCollapsed" class="menu-label">{{ item.label }}</span>
            <span v-if="item.badge && item.badge > 0" class="menu-badge">{{ item.badge > 99 ? '99+' : item.badge }}</span>
          </div>
        </nav>
        <div class="sidebar-toggle" @click="toggleSidebar">
          <font-awesome-icon :icon="['fas', isCollapsed ? 'angles-right' : 'angles-left']" />
        </div>
      </aside>

      <!-- Main Content Area -->
      <main :class="['admin-content', { expanded: isCollapsed }]">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { HelpFilled } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useAdminStore } from '../stores/admin'
import { storeToRefs } from 'pinia'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const adminStore = useAdminStore()
const { pendingBookingsCount, pendingUsersCount } = storeToRefs(adminStore)

const isCollapsed = ref(false)

const menuItems = computed(() => [
  { key: 'approval', label: 'Meeting Approval', icon: 'check-circle', path: '/admin/approval', badge: pendingBookingsCount.value },
  { key: 'ev', label: 'EV Management', icon: 'car', path: '/admin/ev' },
  { key: 'venue', label: 'Venue Management', icon: 'building', path: '/admin/venue' },
  { key: 'user', label: 'Users Management', icon: 'users', path: '/admin/user', badge: pendingUsersCount.value },
  { key: 'access-right', label: 'Access Right', icon: 'user-shield', path: '/admin/access-right' },
  { key: 'prompt', label: 'System Prompts', icon: 'message', path: '/admin/prompt' },
  { key: 'license-plate', label: 'License Plate', icon: 'id-card', path: '/admin/license-plate' },
  { key: 'display', label: 'Display Management', icon: 'desktop', path: '/admin/display' }
])

const isAdminHome = computed(() => {
  const p = route.path
  return p === '/admin' || p === '/admin/'
})

const activeMenu = computed(() => {
  if (isAdminHome.value) return null
  const currentItem = menuItems.value.find(item => route.path.startsWith(item.path))
  return currentItem?.key ?? null
})

const goAdminHome = () => {
  if (route.path !== '/admin') {
    router.push('/admin')
  }
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path)
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-container {
  min-height: var(--zoom-vh, 100vh);
  background: linear-gradient(135deg, #f8ecdd 0%, #f5e6d3 50%, #f8ecdd 100%);
  padding-top: 60px;
  position: relative;
}

.admin-container::before {
  content: '';
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 114, 58, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 114, 58, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.admin-layout {
  display: flex;
  height: calc(var(--zoom-vh, 100vh) - 60px);
  overflow: hidden;
  position: relative;
}

.admin-sidebar {
  width: 220px;
  background: linear-gradient(180deg, #0A3D1F 0%, #005a2f 100%);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  z-index: 100;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.3s ease;
}

.admin-sidebar.collapsed {
  width: 70px;
}

.sidebar-toggle {
  padding: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  font-size: 18px;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.admin-sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 2rem 0.4rem 1.75rem 0.4rem;
}

.admin-sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 0.75rem 0.4rem;
  margin: 0.25rem 0.2rem;
}

.admin-sidebar.collapsed .menu-label {
  display: none;
}

.menu-label {
  transition: opacity 0.3s ease;
}

.sidebar-header {
  padding: 1.3rem 1rem 1.15rem 1rem;
  color: #ffffff;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.1);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.sidebar-header:hover {
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-header.is-home {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.sidebar-header-icon {
  flex-shrink: 0;
  font-size: 22px;
  color: inherit;
}

.sidebar-header-icon :deep(svg) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.sidebar-menu {
  flex: 1;
  padding: 0 0 0.35rem 0;
  overflow-y: auto;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.68rem 0.4rem;
  margin: 0.25rem 0.55rem;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 10px;
  font-size: 15px;
  white-space: nowrap;
}

.menu-badge {
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
  margin-left: auto;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  animation: pulse-menu-badge 2s ease-in-out infinite;
}

@keyframes pulse-menu-badge {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.92;
  }
}

.admin-sidebar.collapsed .menu-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  font-size: 0.625rem;
  padding: 0 4px;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: #ffffff;
  border-radius: 0 2px 2px 0;
  transition: height 0.3s ease;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-item.active {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.menu-item.active::before {
  height: 60%;
}

.menu-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.menu-label {
  font-size: 15px;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-content {
  flex: 1;
  margin-left: 220px;
  padding: 0.75rem;
  overflow-y: auto;
  background: transparent;
  position: relative;
  transition: margin-left 0.3s ease;
}

.admin-content.expanded {
  margin-left: 70px;
}

.admin-content::-webkit-scrollbar {
  width: 8px;
}

.admin-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.admin-content::-webkit-scrollbar-thumb {
  background: rgba(0, 114, 58, 0.3);
  border-radius: 4px;
}

.admin-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 114, 58, 0.5);
}

/* phone-small: <= 389px */
@media (max-width: 389px) {
  .admin-sidebar {
    width: 170px;
  }

  .admin-content {
    margin-left: 170px;
    padding: 0.75rem;
  }

  .sidebar-header {
    font-size: 15px;
    padding: 0.9rem 0.7rem 0.8rem 0.7rem;
    line-height: 1.2;
  }

  .sidebar-header-icon {
    font-size: 18px;
  }

  .menu-item {
    padding: 0.56rem 0.32rem;
    margin: 0.25rem 0.4rem;
    font-size: 13px;
  }

  .menu-icon {
    font-size: 16px;
    width: 20px;
  }

  .menu-label {
    font-size: 13px;
  }
}

/* phone-regular: 390px - 767px */
@media (min-width: 390px) and (max-width: 767px) {
  .admin-sidebar {
    width: 180px;
  }

  .admin-content {
    margin-left: 180px;
    padding: 0.75rem;
  }

  .sidebar-header {
    font-size: 16px;
    padding: 1rem 0.75rem 0.88rem 0.75rem;
    line-height: 1.2;
  }

  .sidebar-header-icon {
    font-size: 20px;
  }

  .menu-item {
    padding: 0.62rem 0.36rem;
    margin: 0.25rem 0.4rem;
    font-size: 14px;
  }

  .menu-icon {
    font-size: 18px;
    width: 22px;
  }

  .menu-label {
    font-size: 14px;
  }
}

/* ipad: 768px - 1099px */
@media (min-width: 768px) and (max-width: 1099px) {
  .admin-sidebar {
    width: 200px;
  }

  .admin-content {
    margin-left: 200px;
    padding: 0.75rem;
  }

  .sidebar-header {
    font-size: 17px;
    padding: 1.2rem 0.9rem 1.05rem 0.9rem;
    line-height: 1.2;
  }

  .sidebar-header-icon {
    font-size: 21px;
  }

  .menu-item {
    padding: 0.66rem 0.4rem;
    margin: 0.25rem 0.5rem;
    font-size: 14px;
  }

  .menu-icon {
    font-size: 18px;
    width: 22px;
  }

  .menu-label {
    font-size: 14px;
  }
}

/* laptop-14: 1100px - 1599px */
@media (min-width: 1100px) and (max-width: 1599px) {
  .admin-sidebar {
    width: 220px;
  }

  .admin-content {
    margin-left: 220px;
    padding: 0.75rem;
  }

  .sidebar-header {
    font-size: 18px;
    padding: 1.35rem 0.95rem 1.2rem 0.95rem;
    line-height: 1.2;
  }

  .sidebar-header-icon {
    font-size: 22px;
  }

  .menu-item {
    padding: 0.7rem 0.42rem;
    margin: 0.25rem 0.5rem;
    font-size: 14px;
  }

  .menu-icon {
    font-size: 19px;
    width: 23px;
  }

  .menu-label {
    font-size: 14px;
  }
}

/* desktop-24: 1600px - 2239px */
@media (min-width: 1600px) and (max-width: 2239px) {
  .admin-sidebar {
    width: 240px;
  }

  .admin-content {
    margin-left: 240px;
    padding: 1rem;
  }

  .sidebar-header {
    font-size: 19px;
    padding: 1.45rem 1.05rem 1.28rem 1.05rem;
    line-height: 1.2;
  }

  .sidebar-header-icon {
    font-size: 23px;
  }

  .menu-item {
    padding: 0.78rem 0.5rem;
    margin: 0.25rem 0.55rem;
    font-size: 15px;
  }

  .menu-icon {
    font-size: 20px;
    width: 24px;
  }

  .menu-label {
    font-size: 15px;
  }
}

/* desktop-27: >= 2240px */
@media (min-width: 2240px) {
  .admin-sidebar {
    width: 280px;
  }

  .admin-content {
    margin-left: 280px;
    padding: 1.25rem;
  }

  .sidebar-header {
    font-size: 21px;
    padding: 1.65rem 1.2rem 1.45rem 1.2rem;
    line-height: 1.2;
  }

  .sidebar-header-icon {
    font-size: 25px;
  }

  .menu-item {
    padding: 0.88rem 0.58rem;
    margin: 0.25rem 0.65rem;
    font-size: 16px;
  }

  .menu-icon {
    font-size: 22px;
    width: 26px;
  }

  .menu-label {
    font-size: 16px;
  }
}
</style>
