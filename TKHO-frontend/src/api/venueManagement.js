import request from '@/api/request'

export function getVenueManagementVenues() {
  return request.get('/venue-management/venues')
}

export function createVenue(payload) {
  return request.post('/venue-management/venues', payload)
}

export function updateVenue(id, payload) {
  return request.patch(`/venue-management/venues/${id}`, payload)
}

export function deleteVenue(id) {
  return request.delete(`/venue-management/venues/${id}`)
}

export function getVenueBookingWindow() {
  return request.get('/venue-management/booking-window')
}

export function publishVenueBookingWindow(payload) {
  return request.patch('/venue-management/booking-window', payload)
}

export function createVenueBlock(venueId, payload) {
  return request.post(`/venue-management/venues/${venueId}/blocks`, payload)
}

export function deleteVenueBlock(venueId, blockId) {
  return request.delete(`/venue-management/venues/${venueId}/blocks/${blockId}`)
}

export function uploadVenueImage(venueId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/venue-management/venues/${venueId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** scope: 'my' | 'all'（all 仅管理员） */
export function listVenueManageBookings(scope = 'my') {
  return request.get('/venue-management/bookings', { params: { scope } })
}

export function updateVenueManageBooking(id, payload) {
  return request.patch(`/venue-management/bookings/${id}`, payload)
}

export function toggleVenueManageBookingCancel(id) {
  return request.patch(`/venue-management/bookings/${id}/toggle-cancel`)
}

export function approveVenueManageBooking(id, payload) {
  return request.post(`/venue-management/bookings/${id}/approve`, payload)
}

export function rejectVenueManageBooking(id, payload) {
  return request.post(`/venue-management/bookings/${id}/reject`, payload)
}

