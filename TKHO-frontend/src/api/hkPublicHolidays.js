import request from './request'

export function getHkPublicHolidays (params) {
  return request.get('/meta/hk-public-holidays', { params })
}

export function syncHkPublicHolidays () {
  return request.post('/system-settings/sync-hk-holidays')
}
