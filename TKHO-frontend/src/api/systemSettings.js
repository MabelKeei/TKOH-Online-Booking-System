import request from './request'

export function getSystemSettings () {
  return request.get('/system-settings')
}

export function saveSystemSettings (payload) {
  return request.put('/system-settings', payload)
}
