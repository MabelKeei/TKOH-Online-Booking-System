import request from './request'

export const getAccountVehicles = (userId) => {
  return request({
    url: '/account/vehicles',
    method: 'get',
    params: userId ? { userId: String(userId) } : undefined
  })
}

export const createAccountVehicle = (data) => {
  return request({
    url: '/account/vehicles',
    method: 'post',
    data
  })
}

export const updateAccountVehicle = (id, data) => {
  return request({
    url: `/account/vehicles/${id}`,
    method: 'patch',
    data
  })
}

export const deleteAccountVehicle = (id) => {
  return request({
    url: `/account/vehicles/${id}`,
    method: 'delete'
  })
}

export const setDefaultAccountVehicle = (id) => {
  return request({
    url: `/account/vehicles/${id}/default`,
    method: 'post'
  })
}
