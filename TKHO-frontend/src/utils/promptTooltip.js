/**
 * @param {unknown} raw
 */
export function formatPromptTooltipText (raw) {
  if (raw == null || raw === '') return ''
  return String(raw)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim()
}

/**
 * @param {Array<{ key?: string, content?: string }>} promptList
 * @param {string} key
 */
export function pickPromptTooltipText (promptList, key) {
  const raw = promptList.find((p) => p.key === key)?.content
  return formatPromptTooltipText(raw)
}
