import request from '@/api/request'

export function getAccessRoles() {
  return request.get('/access-right/roles')
}

export function createAccessRole(payload) {
  return request.post('/access-right/roles', payload)
}

export function updateAccessRole(id, payload) {
  return request.patch(`/access-right/roles/${id}`, payload)
}

export function deleteAccessRole(id) {
  return request.delete(`/access-right/roles/${id}`)
}

export function getAccessDepartments() {
  return request.get('/access-right/departments')
}

export function createAccessDepartment(payload) {
  return request.post('/access-right/departments', payload)
}

export function updateAccessDepartment(id, payload) {
  return request.patch(`/access-right/departments/${id}`, payload)
}

export function deleteAccessDepartment(id) {
  return request.delete(`/access-right/departments/${id}`)
}
