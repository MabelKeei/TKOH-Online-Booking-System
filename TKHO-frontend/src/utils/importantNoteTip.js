/**
 * Important Note 顶栏折叠状态：同一次登录 / 同标签页刷新内保持；登出或关标签后重置。
 * @typedef {'ev' | 'venue'} ImportantNoteTipScope
 */

const PREFIX = 'tkoh-important-note-tip-expanded'

function resolveUserKey (userId) {
  if (userId != null && userId !== '') return String(userId)
  try {
    const parsed = JSON.parse(localStorage.getItem('userInfo') || 'null')
    const id = parsed?.id ?? parsed?.staffId
    if (id != null && id !== '') return String(id)
  } catch {
    /* ignore */
  }
  return 'anon'
}

function storageKey (scope, userId) {
  return `${PREFIX}:${scope}:${resolveUserKey(userId)}`
}

/**
 * @param {ImportantNoteTipScope} scope
 * @param {string|number|null|undefined} [userId]
 * @returns {boolean} true=展开显示条，默认展开
 */
export function loadImportantNoteTipExpanded (scope, userId) {
  try {
    const raw = sessionStorage.getItem(storageKey(scope, userId))
    if (raw === '0') return false
    if (raw === '1') return true
  } catch {
    /* ignore */
  }
  return true
}

/**
 * @param {ImportantNoteTipScope} scope
 * @param {string|number|null|undefined} [userId]
 * @param {boolean} expanded
 */
export function saveImportantNoteTipExpanded (scope, userId, expanded) {
  try {
    sessionStorage.setItem(storageKey(scope, userId), expanded ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}

/** 登出时清除本页偏好，下次登录重新默认展开 */
export function clearImportantNoteTipPrefs () {
  try {
    const keys = []
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(`${PREFIX}:`)) keys.push(key)
    }
    keys.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    /* ignore */
  }
}
