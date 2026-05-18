import request from '@/api/request'

export function getPrompts(params = {}) {
  return request.get('/prompt-management/prompts', { params })
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
