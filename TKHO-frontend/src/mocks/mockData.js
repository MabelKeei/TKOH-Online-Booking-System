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

  const baseList = [
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
  _employeeListRaw = baseList.map((u, idx) => ({
    ...u,
    // 统一提供最近登录时间，供 UserManagement 表格展示
    lastLoginTime: u.lastLoginTime ?? `2026-03-${String((idx % 27) + 1).padStart(2, '0')} ${String(8 + (idx % 10)).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')}`
  }))

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
      lastLoginTime: '2026-03-18 09:20',
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
let _evTimePeriods = null
let _bookingWindows = null
let _displayConfig = null

export function getMockMeetingPendingList () {
  if (_meetingPendingList) return cloneMockList(_meetingPendingList)
  _meetingPendingList = [
    {
      id: 1,
      bookingId: 'BK20260320001',
      venueName: 'Conference Room A',
      userName: 'John Doe',
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
      userName: 'Jane Smith',
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
      userName: 'Bob Wilson',
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
      userName: 'Alice Brown',
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
    { id: 1, roleName: 'Manager', description: 'Department managers', AnnualVenueQuota: 50, AnnualEvQuota: 100, employeeCount: 15 },
    { id: 2, roleName: 'Staff', description: 'Regular staff members', AnnualVenueQuota: 30, AnnualEvQuota: 60, employeeCount: 120 },
    { id: 3, roleName: 'Senior Staff', description: 'Senior level staff', AnnualVenueQuota: 40, AnnualEvQuota: 80, employeeCount: 35 },
    { id: 4, roleName: 'Executive', description: 'Executive level', AnnualVenueQuota: 100, AnnualEvQuota: 200, employeeCount: 8 }
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
    { id: 1, slotNumber: 'A-01', location: 'Ground Floor', space: 'A', quantity: 2, type: 'EV', status: 'active' },
    { id: 2, slotNumber: 'B-01', location: 'Level 1', space: 'B', quantity: 3, type: 'EV', status: 'active' },
    { id: 3, slotNumber: 'C-01', location: 'Level 2', space: 'C', quantity: 2, type: 'EV', status: 'active' }
  ]
  return cloneMockList(_parkingList)
}

export function getMockEVTimePeriods () {
  if (_evTimePeriods) return cloneMockList(_evTimePeriods)
  _evTimePeriods = [
    { id: 1, period: 'AM', startTime: '08:30', endTime: '13:00', status: 'active' },
    { id: 2, period: 'PM', startTime: '13:45', endTime: '18:15', status: 'active' },
    { id: 3, period: 'Night', startTime: '19:00', endTime: '23:30', status: 'active' }
  ]
  return cloneMockList(_evTimePeriods)
}

export function getMockPromptList () {
  if (_promptList) return cloneMockList(_promptList)
  _promptList = [
    {
      id: 1,
      key: 'ev_booking_points_to_note',
      name: 'EV Booking Points to Note',
      content: `<p><strong>Points to Note:</strong>
<p>1. For reservation of other venues (e.g. Courtyard or Glasshouse), please contact General Office at 22081951 directly
<p>2. General Office reserves the right to cancel any booking or reassign another venue under necessary circumstances.
<p>3. Should user require the following service for the meeting, please directly contact the respective department in advance for arrangement</p>
<table style="border-collapse: collapse; width: 100%; background-color: #f9fafb;">
  <thead>
    <tr>
      <th style="text-align: left; padding: 6px 8px; border: 1px solid #d1d5db;">Service/Equipment</th>
      <th style="text-align: left; padding: 6px 8px; border: 1px solid #d1d5db;">Subject Department</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Zoom/Video Conferencing</td>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Information Technology Dept (Tel: 22081830)</td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Venue Setting / Furniture on-loan</td>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Facility Management Dept (Tek: 22081845)</td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Eguipment on-loar</td>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">General Office (Tet: 22081951)</td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Tea Service for Conference Rooms (ad-hoc)</td>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">General Office (Tel: 22081951)</td>
    </tr>
    <tr>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Tea Service for Other Venue and Rooms</td>
      <td style="padding: 6px 8px; border: 1px solid #d1d5db;">Via ADS</td>
    </tr>
  </tbody>
</table>`,
      category: 'system_fixed',
      canAdd: false
    },
    {
      id: 2,
      key: 'venue_booking_points_to_note',
      name: 'Venue Booking Points to Note',
      content: 'Please arrive on time, keep the venue clean, and restore layout after use.',
      category: 'system_fixed',
      canAdd: false
    },
    {
      id: 3,
      key: 'venue_add_booking_setup',
      name: 'Venue Setup',
      content: 'Specify seating layout and setup details clearly for venue preparation.',
      category: 'system_fixed',
      canAdd: false
    },
    {
      id: 4,
      key: 'venue_add_booking_equipment',
      name: 'Equipment',
      content: 'List all required equipment (projector, microphone, screen, etc.) in advance.',
      category: 'system_fixed',
      canAdd: false
    },
    {
      id: 5,
      key: 'venue_add_booking_tools_materials',
      name: 'Tools and Materials',
      content: 'Provide tools/materials requirements to ensure support is ready before the event.',
      category: 'system_fixed',
      canAdd: false
    },
    {
      id: 6,
      key: 'venue_add_booking_others_special_requests',
      name: 'Others / Special Requests',
      content: 'State any special arrangements or additional support requests clearly.',
      category: 'system_fixed',
      canAdd: false
    },
    {
      id: 9,
      key: 'meeting_approval_reject_template',
      name: 'Meeting Title Non-compliant',
      content: 'Your meeting booking request is rejected because the meeting title is not compliant. Please provide a clear and business-related title.',
      category: 'reject_template',
      canAdd: true,
      templateType: 'meeting_approval'
    },
    {
      id: 10,
      key: 'meeting_approval_reject_template',
      name: 'Insufficient Meeting Details',
      content: 'Your meeting booking request is rejected due to insufficient meeting details. Please complete the purpose and required information before resubmission.',
      category: 'reject_template',
      canAdd: true,
      templateType: 'meeting_approval'
    },
    {
      id: 11,
      key: 'meeting_approval_reject_template',
      name: 'Duplicate Time Slot Booking',
      content: 'Your meeting booking request is rejected because the selected date/time conflicts with an existing booking under your account.',
      category: 'reject_template',
      canAdd: true,
      templateType: 'meeting_approval'
    },
    {
      id: 8,
      key: 'account_application_reject_template',
      name: 'Account Application Reject Template',
      content: 'Your account application is rejected. Reason: {reason}',
      category: 'reject_template',
      canAdd: true,
      templateType: 'account_application'
    },
    {
      id: 12,
      key: 'account_application_reject_template',
      name: 'Invalid Contact Phone Number',
      content: 'Your account application is rejected because the contact telephone number is invalid. Please provide a valid and reachable phone number.',
      category: 'reject_template',
      canAdd: true,
      templateType: 'account_application'
    },
    {
      id: 13,
      key: 'account_application_reject_template',
      name: 'Email Format Invalid',
      content: 'Your account application is rejected due to invalid email format. Please provide a valid corporate email address.',
      category: 'reject_template',
      canAdd: true,
      templateType: 'account_application'
    },
    {
      id: 14,
      key: 'account_application_reject_template',
      name: 'Department Information Missing',
      content: 'Your account application is rejected because department information is missing or incorrect. Please update and submit again.',
      category: 'reject_template',
      canAdd: true,
      templateType: 'account_application'
    }
  ]
  return cloneMockList(_promptList)
}

export function getMockVenueList () {
  if (_venueList) return cloneMockList(_venueList)
  _venueList = [
    {
      id: 1,
      name: 'Conference Room 1',
      tab: 'conference_discussion',
      type: 'conference',
      color: '#3b82f6',
      location: '3F',
      images: [],
      blocks: [
        { id: 1001, startAt: '2026-03-30 13:00', endAt: '2026-03-30 16:00', reason: 'Projector maintenance' }
      ],
      status: 'active'
    },
    { id: 2, name: 'Conference Room 2', tab: 'conference_discussion', type: 'conference', color: '#10b981', location: '3F', images: [], blocks: [], status: 'active' },
    { id: 3, name: 'Conference Room 3', tab: 'conference_discussion', type: 'conference', color: '#06b6d4', location: '3F', images: [], blocks: [], status: 'active' },
    { id: 4, name: 'Discussion Room', tab: 'conference_discussion', type: 'discussion', color: '#f59e0b', location: '3F', images: [], blocks: [], status: 'active' },
    { id: 5, name: 'Function Room', tab: 'other_venues', type: 'other', color: '#ec4899', location: 'Ground Floor', images: [], blocks: [], status: 'active' },
    { id: 6, name: 'Lecture Theatre', tab: 'other_venues', type: 'other', color: '#6366f1', location: '2F', images: [], blocks: [], status: 'active' },
    { id: 7, name: 'Auditorium', tab: 'other_venues', type: 'other', color: '#8b5cf6', location: '1F', images: [], blocks: [], status: 'active' }
  ]
  return cloneMockList(_venueList)
}

export function getMockLicensePlateList () {
  if (_licensePlateList) return cloneMockList(_licensePlateList)

  _licensePlateList = [
    { id: 1, corpId: 'E001', owner: 'John Doe', brand: 'Toyota', type: 'personal', plateNumber: 'SJA1234A', status: 'active' },
    { id: 2, corpId: 'E002', owner: 'Jane Smith', brand: 'Tesla', type: 'company', plateNumber: 'SJB5678B', status: 'active' },
    { id: 3, corpId: 'E006', owner: 'Olivia Chan', brand: 'Honda', type: 'personal', plateNumber: 'SKO9012C', status: 'inactive' },
    { id: 4, corpId: 'E020', owner: 'Ivy Cheong', brand: 'BYD', type: 'company', plateNumber: 'SKP3456D', status: 'active' }
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

function cloneBookingWindow (window) {
  return {
    ...window,
    history: Array.isArray(window.history) ? window.history.map(item => ({ ...item })) : []
  }
}

function ensureBookingWindows () {
  if (_bookingWindows) return
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  const today = new Date()
  const evEnd = new Date(today)
  evEnd.setDate(evEnd.getDate() + 13)
  const now = new Date().toISOString()
  _bookingWindows = {
    venue: {
      resourceType: 'venue',
      currentStartDate: '2026-01-01',
      currentEndDate: '2026-12-31',
      updatedBy: 'System Admin',
      updatedAt: now,
      history: [
        {
          id: 1,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          publishedAt: now,
          publishedBy: 'System Admin'
        }
      ]
    },
    ev: {
      resourceType: 'ev',
      currentStartDate: formatDate(today),
      currentEndDate: formatDate(evEnd),
      updatedBy: 'System Admin',
      updatedAt: now,
      history: [
        {
          id: 1,
          startDate: formatDate(today),
          endDate: formatDate(evEnd),
          publishedAt: now,
          publishedBy: 'System Admin'
        }
      ]
    }
  }
}

export function getMockBookingWindow (resourceType) {
  ensureBookingWindows()
  const key = resourceType === 'ev' ? 'ev' : 'venue'
  return cloneBookingWindow(_bookingWindows[key])
}

export function publishMockBookingWindow ({ resourceType, startDate, endDate, publishedBy = 'Admin' }) {
  ensureBookingWindows()
  const key = resourceType === 'ev' ? 'ev' : 'venue'
  const target = _bookingWindows[key]
  const now = new Date().toISOString()

  target.currentStartDate = startDate
  target.currentEndDate = endDate
  target.updatedBy = publishedBy
  target.updatedAt = now
  target.history.unshift({
    id: Date.now(),
    startDate,
    endDate,
    publishedAt: now,
    publishedBy
  })

  return cloneBookingWindow(target)
}

function ensureDisplayConfig () {
  if (_displayConfig) return
  _displayConfig = {
    venueDisplayMode: 'mixed',
    evDisplayMode: 'independent',
    venueRules: [
      { venueId: 1, displayType: 'merge', mergeGroup: 'Group A' },
      { venueId: 2, displayType: 'merge', mergeGroup: 'Group A' },
      { venueId: 3, displayType: 'independent', mergeGroup: '' },
      { venueId: 4, displayType: 'independent', mergeGroup: '' },
      { venueId: 5, displayType: 'merge', mergeGroup: 'Group B' },
      { venueId: 6, displayType: 'merge', mergeGroup: 'Group B' },
      { venueId: 7, displayType: 'independent', mergeGroup: '' }
    ],
    updatedBy: 'System Admin',
    updatedAt: new Date().toISOString()
  }
}

export function getMockDisplayConfig () {
  ensureDisplayConfig()
  return {
    ..._displayConfig,
    venueRules: _displayConfig.venueRules.map(item => ({ ...item }))
  }
}

export function saveMockDisplayConfig (nextConfig, updatedBy = 'Admin') {
  ensureDisplayConfig()
  _displayConfig = {
    venueDisplayMode: nextConfig.venueDisplayMode,
    evDisplayMode: nextConfig.evDisplayMode,
    venueRules: Array.isArray(nextConfig.venueRules) ? nextConfig.venueRules.map(item => ({ ...item })) : [],
    updatedBy,
    updatedAt: new Date().toISOString()
  }
  return getMockDisplayConfig()
}

