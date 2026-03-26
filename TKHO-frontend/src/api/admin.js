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

// 用户管理
export const getUsers = (params) => {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

export const createUser = (data) => {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

export const updateUser = (id, data) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

export const deleteUser = (id) => {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

export const resetUserQuota = (id) => {
  return request({
    url: `/admin/users/${id}/reset-quota`,
    method: 'post'
  })
}

// 待审批用户
export const getPendingUsers = (params) => {
  return request({
    url: '/admin/users/pending',
    method: 'get',
    params
  })
}

export const approveUser = (id) => {
  return request({
    url: `/admin/users/${id}/approve`,
    method: 'post'
  })
}

export const rejectUser = (id, reason) => {
  return request({
    url: `/admin/users/${id}/reject`,
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
