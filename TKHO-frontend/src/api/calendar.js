import request from './request'

export const getBookingsByDateRange = (params) => {
  return request({
    url: '/venue-calendar/bookings/range',
    method: 'get',
    params
  })
}

export const getBookingsByDate = (date, roomType) => {
  return request({
    url: '/venue-calendar/bookings/date',
    method: 'get',
    params: { date, roomType }
  })
}

export const getBookingsByWeek = (weekStart, roomType) => {
  return request({
    url: '/venue-calendar/bookings/week',
    method: 'get',
    params: { weekStart, roomType }
  })
}

export const getBookingsByMonth = (year, month, roomType) => {
  return request({
    url: '/venue-calendar/bookings/month',
    method: 'get',
    params: { year, month, roomType }
  })
}

export const createVenueBooking = (data) => {
  return request({
    url: '/venue-calendar/bookings',
    method: 'post',
    data
  })
}

export const updateVenueBooking = (id, data) => {
  return request({
    url: `/venue-calendar/bookings/${id}`,
    method: 'put',
    data
  })
}

export const deleteVenueBooking = (id) => {
  return request({
    url: `/venue-calendar/bookings/${id}`,
    method: 'delete'
  })
}

export const getAvailableRooms = (roomType) => {
  return request({
    url: '/venue-calendar/rooms',
    method: 'get',
    params: { roomType }
  })
}

export const checkRoomAvailability = (roomId, date, startTime, endTime, excludeBookingId) => {
  return request({
    url: '/venue-calendar/rooms/availability',
    method: 'get',
    params: { roomId, date, startTime, endTime, excludeBookingId }
  })
}

/** 按当前视图拉取预订（day / week / month）；不按 roomType 过滤，由房间筛选控制展示 */
export function fetchCalendarBookingsByView ({ view, currentDate }) {
  const d = currentDate instanceof Date ? currentDate : new Date(currentDate)
  const y = d.getFullYear()
  const m = d.getMonth() + 1

  if (view === 'day') {
    const date = `${y}-${String(m).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return getBookingsByDate(date)
  }

  if (view === 'week') {
    const weekStartDate = new Date(d)
    weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay())
    const weekStart = `${weekStartDate.getFullYear()}-${String(weekStartDate.getMonth() + 1).padStart(2, '0')}-${String(weekStartDate.getDate()).padStart(2, '0')}`
    return getBookingsByWeek(weekStart)
  }

  return getBookingsByMonth(y, m)
}
