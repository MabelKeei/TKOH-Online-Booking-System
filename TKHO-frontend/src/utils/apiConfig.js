/**
 * API 基址策略
 * - 本地 dev：/api → Vite 代理 → localhost:4001
 * - Netlify：/api → Netlify 反向代理 → ngrok（避免 <img> 直连 ngrok 被拦截页挡住）
 */
export function useSameOriginApi () {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_DEV_USE_REMOTE_API !== 'true'
  }
  return import.meta.env.VITE_USE_SAME_ORIGIN_API === 'true'
}

export function getApiBaseURL () {
  if (useSameOriginApi()) {
    return '/api'
  }
  const origin = import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/, '')
  return origin ? `${origin}/api` : '/api'
}

export function shouldAttachNgrokHeader (baseURL) {
  return typeof baseURL === 'string' && baseURL.startsWith('https://')
}
