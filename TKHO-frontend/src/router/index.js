import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 访问根路径时自动重定向到登录页
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/VenueBooking',
    name: 'VenueBooking',
    component: () => import('../views/VenueBooking.vue'),
    meta: {
      title: 'Venue Booking'
    }
  },
  {
    path: '/VenueBooking/Calendar',
    name: 'VenueCalendarView',
    component: () => import('../views/VenueCalendarView.vue'),
    meta: {
      title: 'Booking Calendar'
    }
  },
  {
    path: '/VenueBooking/ManageBooking',
    name: 'VenueManageBooking',
    component: () => import('../views/VenueManageBooking.vue'),
    meta: {
      title: 'Manage Booking'
    }
  },
  {
    path: '/Account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    meta: {
      title: 'Account'
    }
  },
  {
    path: '/evBooking',
    name: 'EVBooking',
    component: () => import('../views/EVBooking.vue'),
    meta: {
      title: 'EV Booking'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Login'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard
router.beforeEach((to, from, next) => {
  // Set page title
  document.title = to.meta.title
    ? `${to.meta.title} - TKHO Resource Booking System`
    : 'TKHO Resource Booking System'
  next()
})

export default router
