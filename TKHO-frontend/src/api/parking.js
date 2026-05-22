import request from '@/api/request'

export function getEvCalendarAvailability(params) {
  return request.get('/parking/calendar-availability', { params })
}

export function getEvAssignmentPreview(params) {
  return request.get('/parking/assignment-preview', { params })
}

export function createEvBooking(payload) {
  return request.post('/parking/bookings', payload)
}

export function occupyParkingSlot(payload) {
  return request.post('/parking/occupy', payload)
}
