<template>
  <header class="app-header w-full bg-[#00723a] text-white flex items-center justify-between px-8 py-3">
    <h1 class="text-lg font-semibold">
      TKHO Venue Booking
    </h1>

    <nav class="flex items-center gap-4">
      <RouterLink
        to="/manage-booking"
        class="header-link"
        :class="{ 'is-active': isActive('/manage-booking') }"
      >
        Manage Booking
      </RouterLink>
      <RouterLink
        to="/account"
        class="header-link"
        :class="{ 'is-active': isActive('/account') }"
      >
        Account
      </RouterLink>

      <el-button size="small" class="logout-btn !px-4" @click="$emit('logout')">
        Log out
      </el-button>
    </nav>
  </header>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineEmits(['logout'])

const route = useRoute()
const isActive = (path) => route.path === path
</script>

<style scoped>
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
