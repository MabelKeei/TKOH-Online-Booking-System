import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import router from '../router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 仅当后端显式返回 { code } 信封时按 code 判错（如 200 业务码）
    if (res && typeof res === 'object' && 'code' in res && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    const normalizeMessage = (payload, fallback = '请求失败') => {
      const raw = payload?.message
      if (Array.isArray(raw)) return raw[0] || fallback
      if (typeof raw === 'string') return raw
      return fallback
    }
    const { response } = error
    if (response) {
      switch (response.status) {
        case 401: {
          const url = response.config?.url || ''
          const isLoginAttempt = url.includes('/auth/login')
          if (!isLoginAttempt) {
            ElMessage.error('未授权，请重新登录')
            const userStore = useUserStore()
            userStore.logout()
            router.push('/login')
          }
          break
        }
        case 403:
          ElMessage.error(normalizeMessage(response.data, '拒绝访问'))
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(normalizeMessage(response.data))
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
