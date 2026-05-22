import request from '@/api/request'

export function getEvParkingSlots() {
  return request.get('/ev-management/parking')
}

export function createEvParkingSlot(payload) {
  return request.post('/ev-management/parking', payload)
}

export function updateEvParkingSlot(id, payload) {
  return request.patch(`/ev-management/parking/${id}`, payload)
}

export function deleteEvParkingSlot(id) {
  return request.delete(`/ev-management/parking/${id}`)
}

export function getEvTimePeriods() {
  return request.get('/ev-management/time-periods')
}

export function createEvTimePeriod(payload) {
  return request.post('/ev-management/time-periods', payload)
}

export function updateEvTimePeriod(id, payload) {
  return request.patch(`/ev-management/time-periods/${id}`, payload)
}

export function deleteEvTimePeriod(id) {
  return request.delete(`/ev-management/time-periods/${id}`)
}

export function getEvBookingWindow() {
  return request.get('/ev-management/booking-window')
}

export function publishEvBookingWindow(payload) {
  return request.patch('/ev-management/booking-window', payload)
}

/** scope: 'my' | 'all'（all 仅管理员） */
export function listEvManageBookings(scope = 'my') {
  return request.get('/ev-management/bookings', { params: { scope } })
}

export function cancelEvManageBooking(id) {
  return request.patch(`/ev-management/bookings/${id}/cancel`)
}
