import { useSameOriginApi } from './apiConfig'

/**
 * Resolve `/api/uploads/...` for <img src> and el-upload preview.
 * Netlify 生产环境必须用相对路径，经 Netlify 代理到 ngrok；勿让浏览器直连 ngrok URL。
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

  if (value.startsWith('/api/')) {
    return value
  }

  return value
}
