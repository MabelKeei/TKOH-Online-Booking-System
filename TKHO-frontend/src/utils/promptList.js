/** 统一解析 prompts API 返回值（数组或 { data: [] }） */
export function normalizePromptList (data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function findPromptByKey (list, key) {
  if (!key) return null
  const items = normalizePromptList(list)
  return (
    items.find((item) => item?.key === key || item?.promptKey === key) || null
  )
}

export function getPromptContentByKey (list, key) {
  return findPromptByKey(list, key)?.content ?? ''
}

/** 富文本去标签后是否有可见文字（空串、仅空白或 &nbsp; 视为无内容） */
export function hasPromptHtmlContent (html) {
  const raw = String(html || '').trim()
  if (!raw) return false
  if (typeof document === 'undefined') {
    return raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim().length > 0
  }
  const root = document.createElement('div')
  root.innerHTML = raw
  return (root.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().length > 0
}
