/** 顶部 Important Note 横幅：从富文本 content 提取一行纯文本摘要 */
export function extractNoticeBannerSummary (html) {
  const raw = String(html || '').trim()
  if (!raw) return ''

  if (typeof document === 'undefined') {
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const root = document.createElement('div')
  root.innerHTML = raw

  const mainTitle = root.querySelector('.main-title')
  if (mainTitle?.textContent?.trim()) {
    return mainTitle.textContent.replace(/\s+/g, ' ').trim()
  }

  const venueLine = root.querySelector('.venue-notice-line:not(.zh)')
  if (venueLine?.textContent?.trim()) {
    return venueLine.textContent.replace(/\s+/g, ' ').trim()
  }

  for (const p of root.querySelectorAll('p')) {
    const text = (p.textContent || '').replace(/\s+/g, ' ').trim()
    if (!text) continue
    if (/^\[\s*For Attention/i.test(text)) continue
    if (text.length >= 8) return text
  }

  const plain = (root.textContent || '').replace(/\s+/g, ' ').trim()
  if (!plain) return ''
  return plain.length > 200 ? `${plain.slice(0, 200)}…` : plain
}
