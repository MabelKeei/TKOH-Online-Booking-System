/**
 * API 基址策略
 * - 本地 dev：/api → Vite 代理 → localhost:3210
 * - Netlify 默认：VITE_API_ORIGIN 直连 ngrok（axios 带 ngrok-skip-browser-warning）
 * - 仅当 VITE_USE_SAME_ORIGIN_API=true 时整站走 /api（需 Edge 代理并附带 ngrok 头，勿仅用 _redirects）
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
