/** 去掉重复的 Points to Note 标题（后台富文本常带一行） */
export function stripDuplicatePointsToNoteHeading (html) {
  return (html || '').replace(
    /^\s*<p>\s*<strong>\s*Points?\s+to\s+Note\s*:\s*<\/strong>\s*<\/p>\s*/i,
    ''
  )
}

/** ol 列表项内若已有 "1." 文本，与 CSS list-style 编号会显示成 1. 1. */
export function normalizePointsToNoteHtml (html) {
  if (!html) return ''
  if (typeof document === 'undefined') {
    return html.replace(/<li>(\s*)(?:\d+\.\s*)+/gi, '<li>$1')
  }
  const root = document.createElement('div')
  root.innerHTML = html
  root.querySelectorAll('ol > li').forEach((li) => {
    li.innerHTML = li.innerHTML.replace(/^(?:\s|&nbsp;|<br\s*\/?>)*((?:\d+\.\s*)+)/i, '')
  })
  return root.innerHTML
}

export function formatPointsToNoteForDisplay (html) {
  return normalizePointsToNoteHtml(stripDuplicatePointsToNoteHeading(html))
}
