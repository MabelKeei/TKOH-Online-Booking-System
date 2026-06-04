/**
 * 上传静态资源（/api/uploads/...）
 * - 开发 / Docker 同源：相对路径 /api/uploads/...（Vite 或入口 Nginx 代理）
 * - 外部 API 域（VITE_API_ORIGIN）：fetch 后转 blob URL（Netlify 等场景）
 */

import { useSameOriginApi } from '@/utils/apiConfig'

const blobCache = new Map()

/** 拉取上传文件时使用的 origin（不含尾斜杠） */
function getAssetFetchOrigin () {
  if (import.meta.env.DEV) return ''
  if (useSameOriginApi() && typeof window !== 'undefined') {
    return window.location.origin.replace(/\/+$/, '')
  }
  return import.meta.env.VITE_API_ORIGIN?.replace(/\/+$/, '') || ''
}

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
    const origin = getAssetFetchOrigin()
    if (origin) {
      return `${origin}${value}`
    }
    return value
  }

  return value
}

/**
 * 加载上传文件为可用于 img src 的 URL
 * @returns {Promise<string>}
 */
export async function loadProtectedAssetUrl (raw) {
  const path = normalizeUploadAssetPath(raw)
  if (!path) {
    return resolveApiAssetUrl(raw)
  }

  if (import.meta.env.DEV || useSameOriginApi()) {
    return path
  }

  if (blobCache.has(path)) {
    return blobCache.get(path)
  }

  const origin = getAssetFetchOrigin()
  if (!origin) {
    return path
  }

  const headers = {}
  if (origin.includes('ngrok')) {
    headers['ngrok-skip-browser-warning'] = 'true'
  }

  try {
    const res = await fetch(`${origin}${path}`, {
      method: 'GET',
      headers,
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
