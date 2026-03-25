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
    path: '/evBooking/Calendar',
    name: 'EVBookingCalendar',
    component: () => import('../views/EVBooking.vue'),
    meta: {
      title: 'EV Booking'
    }
  },
  {
    path: '/EVBooking/Calendar',
    redirect: '/evBooking/Calendar'
  },
  {
    path: '/evBooking/ManageBooking',
    name: 'EVManageBooking',
    component: () => import('../views/EVManageBooking.vue'),
    meta: {
      title: 'Manage EV Booking'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: 'Login'
    }
  },
  {
    path: '/admin',
    name: 'AdminManagement',
    component: () => import('../views/AdminManagement.vue'),
    redirect: '/admin/ev',
    children: [
      {
        path: 'ev',
        name: 'AdminEVManagement',
        component: () => import('../components/admin/EVManagement.vue'),
        meta: {
          title: 'Admin - EV Management'
        }
      },
      {
        path: 'venue',
        name: 'AdminVenueManagement',
        component: () => import('../components/admin/VenueManagement.vue'),
        meta: {
          title: 'Admin - Venue Management'
        }
      },
      {
        path: 'user',
        name: 'AdminUserManagement',
        component: () => import('../components/admin/UserManagement.vue'),
        meta: {
          title: 'Admin - Users Management'
        }
      },
      {
        path: 'access-right',
        name: 'AdminAccessRightManagement',
        component: () => import('../components/admin/AccessRightManagement.vue'),
        meta: {
          title: 'Admin - Access Right Management'
        }
      },
      {
        path: 'approval',
        name: 'AdminMeetingApproval',
        component: () => import('../components/admin/MeetingApproval.vue'),
        meta: {
          title: 'Admin - Meeting Approval'
        }
      },
      {
        path: 'prompt',
        name: 'AdminPromptManagement',
        component: () => import('../components/admin/PromptManagement.vue'),
        meta: {
          title: 'Admin - System Prompts'
        }
      }
    ],
    meta: {
      title: 'Admin Management'
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
    ? `${to.meta.title} - TKOH GA Service Center`
    : 'TKOH GA Service Center'
  next()
})

export default router
