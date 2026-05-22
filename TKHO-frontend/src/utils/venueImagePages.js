const PAGE_SIZE = 4

/** 将图片列表按每页 4 张分页（2×2） */
export function chunkVenueImages (items, pageSize = PAGE_SIZE) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return []
  const pages = []
  for (let i = 0; i < list.length; i += pageSize) {
    pages.push(list.slice(i, i + pageSize))
  }
  return pages
}

export { PAGE_SIZE as VENUE_IMAGE_PAGE_SIZE }
