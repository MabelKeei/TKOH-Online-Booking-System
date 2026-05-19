import axios from 'axios'
import { useUserStore } from '../stores/user'
import { useStatusDialogStore } from '../stores/statusDialog'
import router from '../router'

import { getApiBaseURL, shouldAttachNgrokHeader } from '@/utils/apiConfig'

const apiBaseURL = getApiBaseURL()

const showStatusDialog = (message, type = 'error') => {
  useStatusDialogStore().show(message, type)
}

// 创建 axios 实例
const request = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (shouldAttachNgrokHeader(config.baseURL)) {
      config.headers['ngrok-skip-browser-warning'] = 'true'
    }
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 登录页 catch 会再弹一次；拦截器里跳过登录请求的提示，避免重复
const isLoginRequest = (config) => (config?.url || '').includes('/auth/login')
/** 公开注册页自行用 ElMessageBox 提示，避免与全局 status 弹窗重复 */
const isRegistrationSubmitRequest = (config) =>
  (config?.url || '').includes('/user-management/registration/submit')

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 仅当后端显式返回 { code } 信封时按 code 判错（如 200 业务码）
    if (res && typeof res === 'object' && 'code' in res && res.code !== 200) {
      if (!isLoginRequest(response.config) && !isRegistrationSubmitRequest(response.config)) {
        showStatusDialog(res.message || '请求失败', 'error')
      }
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
    const { response, config } = error
    const skipGlobalDialog = isLoginRequest(config) || isRegistrationSubmitRequest(config)
    if (response) {
      switch (response.status) {
        case 401: {
          const url = response.config?.url || ''
          const isLoginAttempt = url.includes('/auth/login')
          if (!isLoginAttempt) {
            showStatusDialog('未授权，请重新登录', 'error')
            const userStore = useUserStore()
            userStore.logout()
            router.push('/login')
          }
          break
        }
        case 403:
          if (!skipGlobalDialog) {
            showStatusDialog(normalizeMessage(response.data, '拒绝访问'), 'error')
          }
          break
        case 404:
          if (!skipGlobalDialog) {
            showStatusDialog('请求的资源不存在', 'error')
          }
          break
        case 500:
          if (!skipGlobalDialog) {
            showStatusDialog('服务器错误', 'error')
          }
          break
        default:
          if (!skipGlobalDialog) {
            showStatusDialog(normalizeMessage(response.data), 'error')
          }
      }
    } else if (!skipGlobalDialog) {
      showStatusDialog('网络错误，请检查网络连接', 'error')
    }
    return Promise.reject(error)
  }
)

export default request
