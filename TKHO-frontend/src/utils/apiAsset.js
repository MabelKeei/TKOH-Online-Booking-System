/**
 * 上传静态资源（/api/uploads/...）
 * - 开发：相对路径，走 Vite 代理
 * - Netlify 生产：<img> 不能带头；用 fetch + ngrok 头拉取后转 blob URL（与 axios API 同源策略）
 */

const blobCache = new Map()

/** @returns {string} 规范化后的 /api/uploads/... 路径 */
export function normalizeUploadAssetPath (raw) {
  const value = String(raw ?? '').trim()
  if (!value || value.startsWith('data:')) return ''

  if (value.startsWith('/api/uploads/')) return value

  try {
    const u = new URL(value)
    if (u.pathname.startsWith('/api/uploads/')) {
      return u.pathname
    }
  } catch {
    /* ignore */
  }

  return ''
}

/**
 * 同步解析（仅开发或已是 blob/data URL 时够用）
 */
export function resolveApiAssetUrl (raw) {
  const path = normalizeUploadAssetPath(raw)
  if (path) {
    return path
  }

  const value = String(raw ?? '').trim()
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
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

/**
 * 生产环境加载上传文件（绕过 ngrok 浏览器拦截页）
 * @returns {Promise<string>} 可用于 img src 的 URL
 */
export async function loadProtectedAssetUrl (raw) {
  const path = normalizeUploadAssetPath(raw)
  if (!path) {
    return resolveApiAssetUrl(raw)
  }

  if (import.meta.env.DEV) {
    return path
  }

  if (blobCache.has(path)) {
    return blobCache.get(path)
  }

  const origin = import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/, '')
  if (!origin) {
    return path
  }

  try {
    const res = await fetch(`${origin}${path}`, {
      method: 'GET',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      credentials: 'omit'
    })
    if (!res.ok) {
      console.warn('[apiAsset] load failed', path, res.status)
      return ''
    }
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    blobCache.set(path, blobUrl)
    return blobUrl
  } catch (err) {
    console.warn('[apiAsset] load error', path, err)
    return ''
  }
}

export function revokeProtectedAssetUrl (raw) {
  const path = normalizeUploadAssetPath(raw)
  if (!path) return
  const blobUrl = blobCache.get(path)
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl)
    blobCache.delete(path)
  }
}
