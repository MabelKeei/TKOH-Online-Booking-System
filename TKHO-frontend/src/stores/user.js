import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  /** 管理员：后续可改为后端返回的 roles / permissions */
  const isAdmin = computed(() => {
    const u = userInfo.value
    if (!u) return false
    if (u.role === 'admin') return true
    if (u.system === 'admin') return true
    return false
  })

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
      try {
        const parsed = JSON.parse(storedUserInfo)
        if (parsed && !parsed.role && parsed.system) {
          parsed.role = parsed.system === 'admin' ? 'admin' : 'user'
          localStorage.setItem('userInfo', JSON.stringify(parsed))
        }
        userInfo.value = parsed
      } catch {
        userInfo.value = null
      }
    }
  }

  return {
    userInfo,
    token,
    isAdmin,
    login,
    logout,
    initUserInfo
  }
})
