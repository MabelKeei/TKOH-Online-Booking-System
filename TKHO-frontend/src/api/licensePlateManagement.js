import request from './request'

export function listLicensePlates () {
  return request.get('/license-plate-management/plates')
}

export function getLicensePlate (id) {
  return request.get(`/license-plate-management/plates/${id}`)
}

export function createLicensePlate (payload) {
  return request.post('/license-plate-management/plates', payload)
}

export function updateLicensePlate (id, payload) {
  return request.patch(`/license-plate-management/plates/${id}`, payload)
}

export function deleteLicensePlate (id) {
  return request.delete(`/license-plate-management/plates/${id}`)
}
