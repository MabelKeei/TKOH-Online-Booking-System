import request from './request'

// 获取资源列表
export const getResources = (params) => {
  return request({
    url: '/resources',
    method: 'get',
    params
  })
}

// 获取预定列表
export const getBookings = (params) => {
  return request({
    url: '/bookings',
    method: 'get',
    params
  })
}

// 创建预定
export const createBooking = (data) => {
  return request({
    url: '/bookings',
    method: 'post',
    data
  })
}

// 更新预定
export const updateBooking = (id, data) => {
  return request({
    url: `/bookings/${id}`,
    method: 'put',
    data
  })
}

// 取消预定
export const cancelBooking = (id) => {
  return request({
    url: `/bookings/${id}`,
    method: 'delete'
  })
}

// 获取预定详情
export const getBookingDetail = (id) => {
  return request({
    url: `/bookings/${id}`,
    method: 'get'
  })
}
