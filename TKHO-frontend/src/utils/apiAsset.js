/**
 * Resolve `/api/uploads/...` for <img src>.
 * - 本地 dev：相对路径 /api/...（与 axios 相同，走 Vite 代理到 localhost:4001）
 * - Netlify 生产：VITE_API_ORIGIN（ngrok）拼完整 URL
 */
function useLocalDevProxy () {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_USE_REMOTE_API !== 'true'
}

export function getApiOrigin () {
  if (useLocalDevProxy()) {
    const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET?.replace(/\/+$/, '')
    if (proxyTarget) return proxyTarget
    return typeof window !== 'undefined' ? window.location.origin : ''
  }

  const explicit = import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/, '')
  if (explicit) return explicit

  return typeof window !== 'undefined' ? window.location.origin : ''
}

export function resolveApiAssetUrl (raw) {
  const value = String(raw ?? '').trim()
  if (!value) return ''

  if (value.startsWith('data:')) {
    return ''
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  if (value.startsWith('/api/')) {
    if (useLocalDevProxy()) {
      return value
    }
    const origin = getApiOrigin()
    return origin ? `${origin}${value}` : value
  }

  return value
}
