# EV 预订 P1（性能与保护）

## Redis 用途

| 功能 | Key / 机制 | 默认 TTL | 失效时机 |
|------|------------|----------|----------|
| 日历余量 `GET /api/parking/calendar-availability` | `ev:calendar:{ver}:{start}:{end}` | 10s | `ev:calendar:ver` +1（预订成功、`occupy`、Admin 发布 window） |
| 订位预览 `GET /api/parking/assignment-preview` | `ev:preview:{ver}:{date}:{periodId}` | 8s | 同上（与日历共用 `ver`）；仅缓存空闲列表，`suggestedSlot` 每次请求随机/首选 |
| Booking window `GET /api/ev-management/booking-window` | `ev:booking-window` | 60s | Admin `PATCH` 发布 |
| 抢订限流 `POST /api/parking/bookings` | `rl:ev:book:{userId}` | 60s 滑动窗口 | 每分钟计数 |

Redis 未连接时：缓存与限流**自动降级**（直查 PostgreSQL / 不限流），`/api/health` 显示 `redis: disconnected`。

## 环境变量

见 `.env.example` 中 `EV_CALENDAR_CACHE_TTL_SEC`、`EV_ASSIGNMENT_PREVIEW_CACHE_TTL_SEC`、`EV_BOOKING_WINDOW_CACHE_TTL_SEC`、`EV_BOOKING_RATE_LIMIT_PER_MIN`。

## 前端

`EVBooking.vue`：booking window 轮询 **60s**（仅 visible）；日历余量 **10s** 自动轮询（仅 visible），与 `EV_CALENDAR_CACHE_TTL_SEC=10` 对齐。他人抢订后网格可变为 Full，无需点击。切回前台立即各拉一次。Admin 发布仍依赖 `BroadcastChannel` + `localStorage` 即时更新。

## 调优建议

- 高峰前可适当提高 `EV_CALENDAR_CACHE_TTL_SEC`（如 30）减轻 DB `groupBy` 压力；用户订课后最多 TTL 秒内日历略滞后，成功订课后前端会 `loadCalendarAvailability()` 刷新。
- 压测账号需低于 `EV_BOOKING_RATE_LIMIT_PER_MIN`，否则会出现 HTTP 429。
