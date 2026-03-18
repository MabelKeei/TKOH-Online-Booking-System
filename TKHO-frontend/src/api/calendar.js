import request from './request'

// 获取指定日期范围的预订
export const getBookingsByDateRange = (params) => {
  return request({
    url: '/bookings/range',
    method: 'get',
    params
  })
}

// 获取指定日期的预订
export const getBookingsByDate = (date, roomType) => {
  return request({
    url: '/bookings/date',
    method: 'get',
    params: {
      date,
      roomType
    }
  })
}

// 获取指定周的预订
export const getBookingsByWeek = (weekStart, roomType) => {
  return request({
    url: '/bookings/week',
    method: 'get',
    params: {
      weekStart,
      roomType
    }
  })
}

// 获取指定月的预订
export const getBookingsByMonth = (year, month, roomType) => {
  return request({
    url: '/bookings/month',
    method: 'get',
    params: {
      year,
      month,
      roomType
    }
  })
}

// 创建预订
export const createVenueBooking = (data) => {
  return request({
    url: '/bookings',
    method: 'post',
    data
  })
}

// 更新预订
export const updateVenueBooking = (id, data) => {
  return request({
    url: `/bookings/${id}`,
    method: 'put',
    data
  })
}

// 删除预订
export const deleteVenueBooking = (id) => {
  return request({
    url: `/bookings/${id}`,
    method: 'delete'
  })
}

// 获取可用房间列表
export const getAvailableRooms = (roomType) => {
  return request({
    url: '/rooms',
    method: 'get',
    params: {
      roomType
    }
  })
}

// 检查房间可用性
export const checkRoomAvailability = (roomId, date, startTime, endTime) => {
  return request({
    url: '/rooms/availability',
    method: 'get',
    params: {
      roomId,
      date,
      startTime,
      endTime
    }
  })
}
