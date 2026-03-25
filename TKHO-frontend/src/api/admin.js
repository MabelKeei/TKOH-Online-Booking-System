import request from './request'

// 车位管理
export const getParkingSlots = (params) => {
  return request({
    url: '/admin/parking',
    method: 'get',
    params
  })
}

export const createParkingSlot = (data) => {
  return request({
    url: '/admin/parking',
    method: 'post',
    data
  })
}

export const updateParkingSlot = (id, data) => {
  return request({
    url: `/admin/parking/${id}`,
    method: 'put',
    data
  })
}

export const deleteParkingSlot = (id) => {
  return request({
    url: `/admin/parking/${id}`,
    method: 'delete'
  })
}

// 房间管理
export const getVenues = (params) => {
  return request({
    url: '/admin/venues',
    method: 'get',
    params
  })
}

export const createVenue = (data) => {
  return request({
    url: '/admin/venues',
    method: 'post',
    data
  })
}

export const updateVenue = (id, data) => {
  return request({
    url: `/admin/venues/${id}`,
    method: 'put',
    data
  })
}

export const deleteVenue = (id) => {
  return request({
    url: `/admin/venues/${id}`,
    method: 'delete'
  })
}

export const uploadVenueImage = (id, file) => {
  const formData = new FormData()
  formData.append('image', file)
  return request({
    url: `/admin/venues/${id}/images`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 员工管理
export const getEmployees = (params) => {
  return request({
    url: '/admin/employees',
    method: 'get',
    params
  })
}

export const createEmployee = (data) => {
  return request({
    url: '/admin/employees',
    method: 'post',
    data
  })
}

export const updateEmployee = (id, data) => {
  return request({
    url: `/admin/employees/${id}`,
    method: 'put',
    data
  })
}

export const deleteEmployee = (id) => {
  return request({
    url: `/admin/employees/${id}`,
    method: 'delete'
  })
}

export const resetEmployeeQuota = (id) => {
  return request({
    url: `/admin/employees/${id}/reset-quota`,
    method: 'post'
  })
}

// 待审批员工
export const getPendingEmployees = (params) => {
  return request({
    url: '/admin/employees/pending',
    method: 'get',
    params
  })
}

export const approveEmployee = (id) => {
  return request({
    url: `/admin/employees/${id}/approve`,
    method: 'post'
  })
}

export const rejectEmployee = (id, reason) => {
  return request({
    url: `/admin/employees/${id}/reject`,
    method: 'post',
    data: { reason }
  })
}

// 权限管理
export const getRoles = (params) => {
  return request({
    url: '/admin/roles',
    method: 'get',
    params
  })
}

export const createRole = (data) => {
  return request({
    url: '/admin/roles',
    method: 'post',
    data
  })
}

export const updateRole = (id, data) => {
  return request({
    url: `/admin/roles/${id}`,
    method: 'put',
    data
  })
}

export const deleteRole = (id) => {
  return request({
    url: `/admin/roles/${id}`,
    method: 'delete'
  })
}

// 会议审批
export const getPendingBookings = (params) => {
  return request({
    url: '/admin/bookings/pending',
    method: 'get',
    params
  })
}

export const approveBooking = (id) => {
  return request({
    url: `/admin/bookings/${id}/approve`,
    method: 'post'
  })
}

export const rejectBooking = (id, reason) => {
  return request({
    url: `/admin/bookings/${id}/reject`,
    method: 'post',
    data: { reason }
  })
}

export const getApprovedBookings = (params) => {
  return request({
    url: '/admin/bookings/approved',
    method: 'get',
    params
  })
}

export const getRejectedBookings = (params) => {
  return request({
    url: '/admin/bookings/rejected',
    method: 'get',
    params
  })
}

// 系统提示词管理
export const getPrompts = (params) => {
  return request({
    url: '/admin/prompts',
    method: 'get',
    params
  })
}

export const createPrompt = (data) => {
  return request({
    url: '/admin/prompts',
    method: 'post',
    data
  })
}

export const updatePrompt = (id, data) => {
  return request({
    url: `/admin/prompts/${id}`,
    method: 'put',
    data
  })
}

export const deletePrompt = (id) => {
  return request({
    url: `/admin/prompts/${id}`,
    method: 'delete'
  })
}
