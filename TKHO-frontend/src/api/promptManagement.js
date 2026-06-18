import request from '@/api/request'

export function getPrompts(params = {}, config = {}) {
  return request.get('/prompt-management/prompts', { params, ...config })
}

/** 登录页：未登录可读 EV / Venue Points to Note */
export function getPublicPointsToNote() {
  return request.get('/prompt-management/public/points-to-note')
}

/** EV / Venue 预订页 Important Note（无需 JWT） */
export function getPublicBookingNotices() {
  return request.get('/prompt-management/public/booking-notices')
}

export function createPrompt(payload) {
  return request.post('/prompt-management/prompts', payload)
}

export function updatePrompt(id, payload) {
  return request.patch(`/prompt-management/prompts/${id}`, payload)
}

export function deletePrompt(id) {
  return request.delete(`/prompt-management/prompts/${id}`)
}
