/**
 * 集中 mock 数据（单文件管理）
 * 为兼顾加载速度：大数组采用惰性初始化；EV 预订数据按需生成（调用一次即可）。
 */

let _employeeListRaw = null
let _employeeListNormalized = null
let _pendingListRaw = null
let _pendingListNormalized = null

function cloneMockItem (item) {
  // 组件会对列表做 push/splice/替换，因此每次必须返回“独立副本”
  const out = { ...item }
  for (const [k, v] of Object.entries(out)) {
    if (Array.isArray(v)) out[k] = v.slice()
  }
  return out
}

function cloneMockList (list) {
  return list.map(cloneMockItem)
}

export function createMockUser ({ corpId, system }) {
  return {
    id: 1,
    name: corpId,
    // 模拟角色：admin 与 booking 用户区分 AppHeader；后续由后端权限覆盖
    role: system === 'admin' ? 'admin' : 'user',
    system
  }
}

export function createMockToken () {
  return 'mock-token-' + Date.now()
}

export const mockAdminPendingCounts = {
  pendingBookingsCount: 3,
  pendingUsersCount: 2
}

function normalizeEmployeeRaw (u) {
  const role = u.role ?? u.position ?? ''
  const annualQuotaEV = u.annualQuotaEV ?? u.annualQuota ?? 0
  const usedQuotaEV = u.usedQuotaEV ?? u.usedQuota ?? 0
  const annualQuotaVenue = u.annualQuotaVenue ?? u.annualQuota ?? 0
  const usedQuotaVenue = u.usedQuotaVenue ?? u.usedQuota ?? 0
  return { ...u, role, annualQuotaEV, usedQuotaEV, annualQuotaVenue, usedQuotaVenue }
}

export function getMockEmployeeListRaw () {
  if (_employeeListRaw) return cloneMockList(_employeeListRaw)

  _employeeListRaw = [
    { id: 1, corpId: 'E001', name: 'John Doe', department: 'IT', position: 'Manager', email: 'john@tkoh.com', annualQuota: 50, usedQuota: 12, status: 'active' },
    { id: 2, corpId: 'E002', name: 'Jane Smith', department: 'HR', position: 'Staff', email: 'jane@tkoh.com', annualQuota: 30, usedQuota: 5, status: 'active' },
    { id: 3, corpId: 'E003', name: 'Michael Tan', department: 'Finance', position: 'Senior Staff', email: 'michael.tan@tkoh.com', annualQuota: 40, usedQuota: 9, status: 'active' },
    { id: 4, corpId: 'E004', name: 'Emily Wong', department: 'Operations', position: 'Staff', email: 'emily.wong@tkoh.com', annualQuota: 30, usedQuota: 3, status: 'active' },
    { id: 5, corpId: 'E005', name: 'Daniel Lee', department: 'IT', position: 'Engineer', email: 'daniel.lee@tkoh.com', annualQuota: 35, usedQuota: 14, status: 'active' },
    { id: 6, corpId: 'E006', name: 'Olivia Chan', department: 'Admin', position: 'Assistant', email: 'olivia.chan@tkoh.com', annualQuota: 25, usedQuota: 2, status: 'active' },
    { id: 7, corpId: 'E007', name: 'Ryan Lim', department: 'Logistics', position: 'Coordinator', email: 'ryan.lim@tkoh.com', annualQuota: 30, usedQuota: 7, status: 'active' },
    { id: 8, corpId: 'E008', name: 'Sophia Ng', department: 'HR', position: 'Executive', email: 'sophia.ng@tkoh.com', annualQuota: 30, usedQuota: 11, status: 'active' },
    { id: 9, corpId: 'E009', name: 'Kevin Ho', department: 'Sales', position: 'Staff', email: 'kevin.ho@tkoh.com', annualQuota: 30, usedQuota: 6, status: 'active' },
    { id: 10, corpId: 'E010', name: 'Grace Low', department: 'Marketing', position: 'Executive', email: 'grace.low@tkoh.com', annualQuota: 35, usedQuota: 15, status: 'active' },
    { id: 11, corpId: 'E011', name: 'Jason Chua', department: 'IT', position: 'Analyst', email: 'jason.chua@tkoh.com', annualQuota: 35, usedQuota: 8, status: 'active' },
    { id: 12, corpId: 'E012', name: 'Alicia Koh', department: 'Legal', position: 'Officer', email: 'alicia.koh@tkoh.com', annualQuota: 25, usedQuota: 4, status: 'active' },
    { id: 13, corpId: 'E013', name: 'Marcus Teo', department: 'Operations', position: 'Supervisor', email: 'marcus.teo@tkoh.com', annualQuota: 40, usedQuota: 18, status: 'active' },
    { id: 14, corpId: 'E014', name: 'Hannah Goh', department: 'Finance', position: 'Staff', email: 'hannah.goh@tkoh.com', annualQuota: 30, usedQuota: 10, status: 'active' },
    { id: 15, corpId: 'E015', name: 'Brandon Yap', department: 'Procurement', position: 'Officer', email: 'brandon.yap@tkoh.com', annualQuota: 30, usedQuota: 5, status: 'active' },
    { id: 16, corpId: 'E016', name: 'Natalie Sim', department: 'Admin', position: 'Manager', email: 'natalie.sim@tkoh.com', annualQuota: 45, usedQuota: 13, status: 'active' },
    { id: 17, corpId: 'E017', name: 'Darren Ang', department: 'Security', position: 'Lead', email: 'darren.ang@tkoh.com', annualQuota: 25, usedQuota: 1, status: 'active' },
    { id: 18, corpId: 'E018', name: 'Chloe Tan', department: 'Customer Service', position: 'Staff', email: 'chloe.tan@tkoh.com', annualQuota: 30, usedQuota: 12, status: 'active' },
    { id: 19, corpId: 'E019', name: 'Samuel Neo', department: 'Warehouse', position: 'Coordinator', email: 'samuel.neo@tkoh.com', annualQuota: 30, usedQuota: 7, status: 'inactive' },
    { id: 20, corpId: 'E020', name: 'Ivy Cheong', department: 'Marketing', position: 'Staff', email: 'ivy.cheong@tkoh.com', annualQuota: 30, usedQuota: 9, status: 'active' },
    { id: 21, corpId: 'E021', name: 'Leonard Fong', department: 'Sales', position: 'Manager', email: 'leonard.fong@tkoh.com', annualQuota: 50, usedQuota: 20, status: 'active' },
    { id: 22, corpId: 'E022', name: 'Vanessa Liew', department: 'IT', position: 'Support', email: 'vanessa.liew@tkoh.com', annualQuota: 30, usedQuota: 6, status: 'inactive' },
    { id: 23, corpId: 'E023', name: 'Tommy Tan', department: 'EV', role: 'EV Booking', email: 'tommy.tan@tkoh.com', annualQuotaEV: 40, usedQuotaEV: 22, annualQuotaVenue: 20, usedQuotaVenue: 12, status: 'expired' },
    { id: 24, corpId: 'E024', name: 'Lily Wong', department: 'Venue', role: 'Venue Booking', email: 'lily.wong@tkoh.com', annualQuotaEV: 25, usedQuotaEV: 15, annualQuotaVenue: 55, usedQuotaVenue: 28, status: 'expired' },
    { id: 25, corpId: 'E025', name: 'Ethan Lim', department: 'Admin', role: 'Admin', email: 'ethan.lim@tkoh.com', annualQuotaEV: 60, usedQuotaEV: 40, annualQuotaVenue: 60, usedQuotaVenue: 35, status: 'expired' }
  ]

  return cloneMockList(_employeeListRaw)
}

export function getMockEmployeeListNormalized () {
  if (_employeeListNormalized) return cloneMockList(_employeeListNormalized)

  // 注意：这里需要基于 raw 的缓存做 normalize，然后返回克隆副本
  _employeeListNormalized = _employeeListRaw
    ? _employeeListRaw.map(normalizeEmployeeRaw)
    : getMockEmployeeListRaw().map(normalizeEmployeeRaw)

  return cloneMockList(_employeeListNormalized)
}

export function getMockPendingListRaw () {
  if (_pendingListRaw) return cloneMockList(_pendingListRaw)

  _pendingListRaw = [
    {
      id: 101,
      corpId: 'E003',
      name: 'Bob Wilson',
      department: 'Finance',
      role: 'Staff',
      email: 'bob@tkoh.com',
      submittedAt: '2026-03-20 10:30',
      reason: 'Requesting access to make EV/Venue bookings for team meetings.'
    }
  ]

  return cloneMockList(_pendingListRaw)
}

export function getMockPendingListNormalized () {
  if (_pendingListNormalized) return cloneMockList(_pendingListNormalized)

  const raw = _pendingListRaw ?? getMockPendingListRaw()
  _pendingListNormalized = raw.map((u) => ({
    ...u,
    role: u.role ?? u.position ?? ''
  }))

  return cloneMockList(_pendingListNormalized)
}

let _meetingPendingList = null
let _meetingApprovedList = null
let _meetingRejectedList = null
let _accessRoleList = null
let _departmentList = null
let _parkingList = null
let _promptList = null
let _venueList = null
let _licensePlateList = null

export function getMockMeetingPendingList () {
  if (_meetingPendingList) return cloneMockList(_meetingPendingList)
  _meetingPendingList = [
    {
      id: 1,
      bookingId: 'BK20260320001',
      venueName: 'Conference Room A',
      employeeName: 'John Doe',
      department: 'IT',
      meetingTitle: 'Q1 Project Review Meeting',
      date: '2026-03-25',
      time: '14:00-16:00',
      submittedAt: '2026-03-20 10:30'
    },
    {
      id: 2,
      bookingId: 'BK20260320002',
      venueName: 'Conference Room B',
      employeeName: 'Jane Smith',
      department: 'HR',
      meetingTitle: 'Team Building Planning',
      date: '2026-03-26',
      time: '10:00-12:00',
      submittedAt: '2026-03-20 11:15'
    }
  ]
  return cloneMockList(_meetingPendingList)
}

export function getMockMeetingApprovedList () {
  if (_meetingApprovedList) return cloneMockList(_meetingApprovedList)
  _meetingApprovedList = [
    {
      id: 101,
      bookingId: 'BK20260319001',
      venueName: 'Conference Room A',
      employeeName: 'Bob Wilson',
      meetingTitle: 'Budget Review',
      date: '2026-03-24',
      time: '09:00-11:00',
      approvedAt: '2026-03-19 15:30',
      approvedBy: 'Admin'
    }
  ]
  return cloneMockList(_meetingApprovedList)
}

export function getMockMeetingRejectedList () {
  if (_meetingRejectedList) return cloneMockList(_meetingRejectedList)
  _meetingRejectedList = [
    {
      id: 201,
      bookingId: 'BK20260318001',
      venueName: 'Conference Room B',
      employeeName: 'Alice Brown',
      meetingTitle: 'Casual Discussion',
      date: '2026-03-23',
      time: '15:00-17:00',
      rejectedAt: '2026-03-18 16:45',
      rejectedBy: 'Admin',
      reason: 'Meeting title not specific enough'
    }
  ]
  return cloneMockList(_meetingRejectedList)
}

export function getMockAccessRoleList () {
  if (_accessRoleList) return cloneMockList(_accessRoleList)
  _accessRoleList = [
    { id: 1, roleName: 'Manager', description: 'Department managers', venueQuota: 50, evQuota: 100, employeeCount: 15 },
    { id: 2, roleName: 'Staff', description: 'Regular staff members', venueQuota: 30, evQuota: 60, employeeCount: 120 },
    { id: 3, roleName: 'Senior Staff', description: 'Senior level staff', venueQuota: 40, evQuota: 80, employeeCount: 35 },
    { id: 4, roleName: 'Executive', description: 'Executive level', venueQuota: 100, evQuota: 200, employeeCount: 8 }
  ]
  return cloneMockList(_accessRoleList)
}

export function getMockDepartmentList () {
  if (_departmentList) return cloneMockList(_departmentList)
  _departmentList = [
    { id: 1, departmentName: 'IT', description: 'Information Technology Department', employeeCount: 25 },
    { id: 2, departmentName: 'HR', description: 'Human Resources Department', employeeCount: 12 },
    { id: 3, departmentName: 'Finance', description: 'Finance and Accounting Department', employeeCount: 18 },
    { id: 4, departmentName: 'Marketing', description: 'Marketing and Sales Department', employeeCount: 20 },
    { id: 5, departmentName: 'Operations', description: 'Operations Management Department', employeeCount: 30 },
    { id: 6, departmentName: 'Sales', description: 'Sales Department', employeeCount: 15 },
    { id: 7, departmentName: 'Admin', description: 'Administration Department', employeeCount: 10 },
    { id: 8, departmentName: 'Legal', description: 'Legal Department', employeeCount: 5 },
    { id: 9, departmentName: 'Logistics', description: 'Logistics Department', employeeCount: 12 },
    { id: 10, departmentName: 'Procurement', description: 'Procurement Department', employeeCount: 8 },
    { id: 11, departmentName: 'Security', description: 'Security Department', employeeCount: 6 },
    { id: 12, departmentName: 'Customer Service', description: 'Customer Service Department', employeeCount: 14 },
    { id: 13, departmentName: 'Warehouse', description: 'Warehouse Department', employeeCount: 10 }
  ]
  return cloneMockList(_departmentList)
}

export function getMockEVParkingList () {
  if (_parkingList) return cloneMockList(_parkingList)
  _parkingList = [
    { id: 1, slotNumber: 'A-01', location: 'Ground Floor', type: 'EV', status: 'active' },
    { id: 2, slotNumber: 'A-02', location: 'Ground Floor', type: 'EV', status: 'active' },
    { id: 3, slotNumber: 'B-01', location: 'Level 1', type: 'Regular', status: 'active' },
    { id: 4, slotNumber: 'B-02', location: 'Level 1', type: 'Regular', status: 'active' },
    { id: 5, slotNumber: 'C-01', location: 'Level 2', type: 'EV', status: 'active' },
    { id: 6, slotNumber: 'C-02', location: 'Level 2', type: 'Regular', status: 'inactive' }
  ]
  return cloneMockList(_parkingList)
}

export function getMockPromptList () {
  if (_promptList) return cloneMockList(_promptList)
  _promptList = [
    {
      id: 1,
      key: 'booking_success',
      title: 'Booking Success',
      content: 'Your booking has been submitted successfully. Please wait for admin approval.',
      type: 'success',
      status: 'active'
    },
    {
      id: 2,
      key: 'booking_cancelled',
      title: 'Booking Cancelled',
      content: 'Your booking has been cancelled successfully.',
      type: 'info',
      status: 'active'
    },
    {
      id: 3,
      key: 'quota_exceeded',
      title: 'Quota Exceeded',
      content: 'You have reached your annual booking quota. Please contact admin for assistance.',
      type: 'warning',
      status: 'active'
    },
    {
      id: 4,
      key: 'approval_rejected',
      title: 'Booking Rejected',
      content: 'Your booking request has been rejected by admin. Reason: {reason}',
      type: 'error',
      status: 'active'
    },
    {
      id: 5,
      key: 'venue_unavailable',
      title: 'Venue Unavailable',
      content: 'The selected venue is not available for the chosen time slot.',
      type: 'warning',
      status: 'active'
    }
  ]
  return cloneMockList(_promptList)
}

export function getMockVenueList () {
  if (_venueList) return cloneMockList(_venueList)
  _venueList = [
    { id: 1, name: 'Conference Room A', type: 'conference', capacity: 10, location: '3F', images: [], status: 'active' },
    { id: 2, name: 'Conference Room B', type: 'conference', capacity: 20, location: '3F', images: [], status: 'active' },
    { id: 3, name: 'Courtyard', type: 'other', capacity: 50, location: 'Ground Floor', images: [], status: 'active' }
  ]
  return cloneMockList(_venueList)
}

export function getMockLicensePlateList () {
  if (_licensePlateList) return cloneMockList(_licensePlateList)

  _licensePlateList = [
    { id: 1, corpId: 'E001', owner: 'John Doe', type: 'personal', plateNumber: 'SJA1234A', status: 'active' },
    { id: 2, corpId: 'E002', owner: 'Jane Smith', type: 'company', plateNumber: 'SJB5678B', status: 'active' },
    { id: 3, corpId: 'E006', owner: 'Olivia Chan', type: 'personal', plateNumber: 'SKO9012C', status: 'inactive' },
    { id: 4, corpId: 'E020', owner: 'Ivy Cheong', type: 'company', plateNumber: 'SKP3456D', status: 'active' }
  ]

  return cloneMockList(_licensePlateList)
}

export function generateEVBookingsMock ({
  days = 14,
  periods = ['am', 'pm', 'night'],
  totalPerSlot = 3,
  // 默认从“当前时间”开始生成，保持与原组件一致的随机体验
  today = new Date()
} = {}) {
  const bookings = {}

  const base = new Date(today)
  const formatDate = (date) => date.toISOString().split('T')[0]

  for (let i = 0; i < days; i++) {
    const date = new Date(base)
    date.setDate(date.getDate() + i)
    const dateStr = formatDate(date)

    periods.forEach((period) => {
      const key = `${dateStr}-${period}`
      const random = Math.random()

      if (random < 0.15) {
        bookings[key] = { available: 0, total: totalPerSlot }
      } else if (random < 0.30) {
        bookings[key] = { available: 1, total: totalPerSlot }
      } else if (random < 0.50) {
        bookings[key] = { available: 2, total: totalPerSlot }
      } else {
        bookings[key] = { available: totalPerSlot, total: totalPerSlot }
      }
    })
  }

  return bookings
}

