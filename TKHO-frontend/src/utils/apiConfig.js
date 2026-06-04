/**
 * API 基址策略
 * - 本地 dev：/api → Vite 代理 → localhost:3210
 * - Docker / 自建：VITE_USE_SAME_ORIGIN_API=true，整站 /api 经入口 Nginx（:3200）
 * - 静态托管 + 外部 API：设 VITE_API_ORIGIN（见 .env.netlify.example）
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
