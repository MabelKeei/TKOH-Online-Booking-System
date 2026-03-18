import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 访问根路径时自动重定向到登录页
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/venue-booking',
    name: 'VenueBooking',
    component: () => import('../views/VenueBooking.vue'),
    meta: {
      title: 'Venue Booking'
    }
  },
  {
    path: '/calendar',
    name: 'CalendarView',
    component: () => import('../views/CalendarView.vue'),
    meta: {
      title: 'Booking Calendar'
    }
  },
  {
    path: '/manage-booking',
    name: 'ManageBooking',
    component: () => import('../views/ManageBooking.vue'),
    meta: {
      title: 'Manage Booking'
    }
  },
  {
    path: '/account',
    name: 'Account',
    component: () => import('../views/Account.vue'),
    meta: {
      title: 'Account'
    }
  },
  {
    path: '/ev-booking',
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
