# EV 抢订并发压测

脚本：`ev-booking-concurrent.mjs` — 多用户登录后对同一「日期 + 时段」并发 `POST /api/parking/bookings`。

## 前置条件

1. PostgreSQL、**Redis**（P1 日历缓存 / 抢订限流；未启动则降级为直查 DB）已启动，且已执行迁移（含 P0 唯一索引）：
   ```powershell
   cd TKHO-backend
   npx prisma migrate deploy
   ```
2. 已 seed 测试数据（默认密码 `123456`）：
   ```powershell
   npm run prisma:seed
   ```
3. 后端已启动（默认 `http://127.0.0.1:4001`）：
   ```powershell
   npm run start:dev
   ```
4. 确认测试用日期在 **Admin → EV Management → Booking Date Range** 已发布范围内。

## 日历级压测（14 天 × 3 时段 × 100 人）

脚本：`ev-booking-calendar-stress.mjs`

- 默认 **100** 并发预订、**14** 天、时段 **1,2,3**
- 每个 `(booking_date, period_id)` 最多 **3** 笔成功（与 `ev_parking_slots` 中 active 数量一致）
- 理论上限：`14 × 3 × 3 = 126` 笔成功（库内无旧预订且 spread 均匀时）
- `TARGET_MODE=spread`：100 个请求均匀分布到 42 个「日×时段」格子上
- **空表 + spread + 100 并发**：预期约 **100 success**（每格最多 3 笔请求、每格 3 车位）

> **历史问题（已修）**  
> 1. `FOR UPDATE SKIP LOCKED` 锁在 3 行 `ev_parking_slots` 上，跨日期/时段误报已满。  
> 2. raw SQL 用 JS `Date` 比较 `booking_date`，与 Prisma 写入的 `DATE` 不一致，导致 `NOT EXISTS` 看不到已订车位，同一格子并发都抢 slot 1 → 每格仅 ~1 笔成功。现统一为 `YYYY-MM-DD::date` + advisory lock。

### 准备

1. Admin 发布 **Booking Date Range** 覆盖压测的 14 天（或设置 `START_DATE`）
2. 清表（示例 14 天从 2026-05-21 起）：

```sql
DELETE FROM ev_bookings
WHERE booking_date >= DATE '2026-05-21'
  AND booking_date <= DATE '2026-06-03'
  AND period_id IN (1, 2, 3);
```

3. `npm run prisma:seed`（3 车位、25 用户车牌）

### 运行

```powershell
cd TKHO-backend
$env:CONCURRENCY = "100"
$env:USER_COUNT = "100"
$env:DAYS = "14"
$env:START_DATE = "2026-05-21"
$env:PERIOD_IDS = "1,2,3"
$env:TARGET_MODE = "spread"
npm run load-test:ev-calendar
```

### 其它模式

| TARGET_MODE | 说明 |
|-------------|------|
| `spread` | 100 请求轮询分布到各日×时段（推荐） |
| `hot` | 全部打同一日+时段，测单格抢 3 车位 |
| `random` | 每请求随机选一格 |

单格热点示例（等同 100 人抢同一天 AM）：

```powershell
$env:TARGET_MODE = "hot"
$env:HOT_DATE = "2026-05-21"
$env:HOT_PERIOD_ID = "1"
$env:CONCURRENCY = "100"
npm run load-test:ev-calendar
```

预期：约 **3 success**、**97 conflict**。

### spread 空表校验（压测前 COUNT=0 时）

```sql
SELECT COUNT(*) FROM ev_bookings
WHERE status IN ('pending', 'confirmed')
  AND booking_date BETWEEN DATE '2026-05-21' AND DATE '2026-06-03'
  AND period_id IN (1, 2, 3);
```

压测后 `success` 应接近 `min(CONCURRENCY, 42×3)`（100 并发 → ~100），且 `COUNT(*)` 与 `success` 一致。

---

## 默认 seed 规模

- **EV 车位**：3 个（`EV-01` ~ `EV-03`）→ 同一日期+时段最多 **3 笔**成功预订
- **用户车牌**：seed 已为 25 个用户各建 1 块车牌（`SEED001A` …）；重新 seed 后无需压测时再创建车牌

压测 100 并发时，预期约 **3 success + 97 conflict**（若未清表且已满）。

## 测试前清理（建议）

对将要压测的 `booking_date` + `period_id`，删除旧预订，避免已满导致大量 409：

```sql
DELETE FROM ev_bookings
WHERE booking_date = DATE '2026-05-20'   -- 改成你的 BOOKING_DATE
  AND period_id = 1;                     -- 改成你的 PERIOD_ID
```

查看当前 active 车位数：

```sql
SELECT COUNT(*) AS active_slots FROM ev_parking_slots WHERE status = 'active';
```

成功预订数应 **≤ active_slots**。

## P1 限流与压测

默认 `EV_BOOKING_RATE_LIMIT_PER_MIN=30`（每用户每分钟）。100 并发若大量复用同一账号可能返回 **429**。压测前可在启动后端的 shell 中提高：

```powershell
$env:EV_BOOKING_RATE_LIMIT_PER_MIN = "200"
```

## 运行压测

在 `TKHO-backend` 目录：

```powershell
# 50 并发，默认明天、时段 1
$env:CONCURRENCY = "50"
node scripts/load-test/ev-booking-concurrent.mjs
```

常用参数（环境变量）：

| 变量 | 说明 | 默认 |
|------|------|------|
| `BASE_URL` | API 根地址 | `http://127.0.0.1:4001` |
| `CONCURRENCY` | 同时发多少预订请求 | `50` |
| `USER_COUNT` | 使用多少个 seed 账号（循环） | 同 `CONCURRENCY` |
| `USER_START` | 从第几个用户开始（2 = E002） | `2` |
| `BOOKING_DATE` | `YYYY-MM-DD` | 明天 |
| `PERIOD_ID` | 时段 id | `1` |
| `PASSWORD` | 登录密码 | `123456` |
| `DRY_RUN` | `1` 只测登录 | - |

示例：模拟约 100 并发（seed 仅 25 用户，会循环账号）：

```powershell
$env:CONCURRENCY = "100"
$env:USER_COUNT = "100"
$env:BOOKING_DATE = "2026-05-20"
$env:PERIOD_ID = "1"
node scripts/load-test/ev-booking-concurrent.mjs
```

仅验证登录：

```powershell
$env:DRY_RUN = "1"
$env:CONCURRENCY = "10"
node scripts/load-test/ev-booking-concurrent.mjs
```

## 结果解读

脚本输出示例字段：

- **success**：HTTP 2xx，预订成功
- **conflict**：409 或「已满 / unavailable」类消息（预期行为，车位抢完）
- **error**：其它失败（需排查）
- **Unique slots booked**：成功响应里不同的 `slotId` 数量
- **duplicateSlot**：若 >0，表示两次成功返回了相同车位（**不应出现**，需查 P0 约束）
- **Latency p50/p95**：响应耗时

### 通过标准（P0）

1. `success` ≤ 数据库 `active` 车位数  
2. `success + conflict` ≈ `CONCURRENCY`（少量 `error` 可接受，但应为 0 更佳）  
3. `duplicateSlot` 为 0  
4. 下方 SQL **0 行**（无重复占同一车位）

## 数据库校验（必做）

```sql
-- 同一 slot + period + date 不应有多条有效预订
SELECT slot_id, period_id, booking_date, COUNT(*) AS cnt
FROM ev_bookings
WHERE status IN ('pending', 'confirmed')
  AND booking_date = DATE '2026-05-20'   -- 你的测试日期
  AND period_id = 1
GROUP BY slot_id, period_id, booking_date
HAVING COUNT(*) > 1;
```

```sql
-- 该时段总预订数 vs 车位数
SELECT
  (SELECT COUNT(*) FROM ev_parking_slots WHERE status = 'active') AS total_slots,
  (SELECT COUNT(*) FROM ev_bookings
   WHERE status IN ('pending', 'confirmed')
     AND booking_date = DATE '2026-05-20'
     AND period_id = 1) AS bookings;
```

## 推荐测试步骤

### 步骤 1：冒烟（5 并发）

```powershell
$env:CONCURRENCY = "5"
node scripts/load-test/ev-booking-concurrent.mjs
```

期望：5 个 success（若车位 ≥5），SQL 无重复。

### 步骤 2：车位打满（并发 = 车位数 + 10）

假设 20 个 active 车位：

```powershell
$env:CONCURRENCY = "30"
node scripts/load-test/ev-booking-concurrent.mjs
```

期望：success ≈ 20，conflict ≈ 10，无 duplicateSlot。

### 步骤 3：高压（50–100 并发）

```powershell
$env:CONCURRENCY = "100"
node scripts/load-test/ev-booking-concurrent.mjs
```

观察 p95 延迟、error 比例；后端 CPU/DB 连接池是否告警。

### 步骤 4：对比 P0 前行为（可选）

若仍保留旧分支，可在相同数据下对比：旧版大量 `Booking in progress`；新版应以 `fully booked` 为主、吞吐更高。

## 故障排查

| 现象 | 可能原因 |
|------|----------|
| 全部 login failed | 未 seed、密码不对、`BASE_URL` 错误 |
| 全部 error 401 | token 未带上（检查后端 JWT） |
| success 为 0 | 日期不在 booking window、时段无效、已满未清理 |
| duplicateSlot > 0 | 未部署唯一索引迁移 |
| 迁移失败 | 库中已有重复数据，先清理再 `migrate deploy` |

## 说明

- Seed 只有 25 个用户；`CONCURRENCY > 25` 时会**循环**使用 E002–E025 等账号。无车牌的用户会自动 `POST /api/account/vehicles` 创建临时车牌。
- 同一账号若被多次并发使用，会共用同一车牌（若业务限制「一人一单」需另加 DB 约束）。
- 生产压测请在**独立测试库**执行，勿对生产数据清表。
