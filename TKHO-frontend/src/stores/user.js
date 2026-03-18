import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  // 登录
  const login = (userData, authToken) => {
    userInfo.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    localStorage.setItem('userInfo', JSON.stringify(userData))
  }

  // 登出
  const logout = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 初始化用户信息
  const initUserInfo = () => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
    }
  }

  return {
    userInfo,
    token,
    login,
    logout,
    initUserInfo
  }
})
