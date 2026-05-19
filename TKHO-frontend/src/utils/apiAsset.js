/**
 * 解析资源 URL（场地图、展示 QR 等）
 * - 开发：相对 /api → Vite 代理
 * - Netlify：/api/uploads/... 保持同源，由 _redirects 转发到 ngrok（避免 <img> 直连 ngrok）
 * - 其他 /api 路径在直连后端场景下可拼 VITE_API_ORIGIN
 */
export function resolveApiAssetUrl (raw) {
  const value = String(raw ?? '').trim()
  if (!value) return ''

  if (value.startsWith('data:')) {
    return ''
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  if (value.startsWith('/api/uploads/')) {
    return value
  }

  if (value.startsWith('/api/')) {
    const origin = import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/, '')
    if (origin && !import.meta.env.DEV) {
      return `${origin}${value}`
    }
    return value
  }

  return value
}
