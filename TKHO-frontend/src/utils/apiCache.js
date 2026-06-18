const cache = new Map()

export function getCachedValue (key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value
}

export function setCachedValue (key, value, ttlMs = 5 * 60 * 1000) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  })
}

export function invalidateCachedValue (key) {
  cache.delete(key)
}

export async function getCachedOrFetch (key, ttlMs, fetcher) {
  const cached = getCachedValue(key)
  if (cached != null) return cached
  const value = await fetcher()
  setCachedValue(key, value, ttlMs)
  return value
}
