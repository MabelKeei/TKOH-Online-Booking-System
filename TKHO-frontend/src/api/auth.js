import request from './request'

// 登录
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 登出
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

// 获取用户信息
export const getUserInfo = () => {
  return request({
    url: '/auth/user',
    method: 'get'
  })
}

export const updateProfile = (data) => {
  return request({
    url: '/auth/profile',
    method: 'patch',
    data
  })
}

export const changePassword = (data) => {
  return request({
    url: '/auth/password',
    method: 'patch',
    data
  })
}
