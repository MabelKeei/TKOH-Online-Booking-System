# TKHO 后端接口与前端调用待办清单

更新时间：2026-04-27

## 1. 目标

本文件用于梳理当前项目中：

- 已完成的后端接口能力
- 前端已定义但后端未完成的接口
- 前端页面仍使用 Mock 数据、尚未接入真实接口的模块
- 可执行的分阶段待办（按优先级）

---

## 2. 当前后端已实现接口（基线）

后端当前已注册模块：`auth`、`health`、`meta`、`parking`。

### 2.1 Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/user`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/password`

### 2.2 Health

- `GET /api/health`

### 2.3 Meta

- `GET /api/meta/users`
- `GET /api/meta/employees`
- `GET /api/meta/venues`

### 2.4 Parking

- `POST /api/parking/occupy`

---

## 3. 未完成后端接口清单（按前端需求倒排）

以下接口已在前端 API 层声明或被页面逻辑依赖，但后端当前尚无对应控制器/路由实现。

### 3.1 Admin 管理接口（来源：`src/api/admin.js`）

#### 车位管理

- `GET /api/admin/parking`
- `POST /api/admin/parking`
- `PUT /api/admin/parking/:id`
- `DELETE /api/admin/parking/:id`

#### 场地管理

- `GET /api/admin/venues`
- `POST /api/admin/venues`
- `PUT /api/admin/venues/:id`
- `DELETE /api/admin/venues/:id`
- `POST /api/admin/venues/:id/images`

#### 用户管理

- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id/reset-quota`
- `GET /api/admin/users/pending`
- `POST /api/admin/users/:id/approve`
- `POST /api/admin/users/:id/reject`

#### 角色与权限

- `GET /api/admin/roles`
- `POST /api/admin/roles`
- `PUT /api/admin/roles/:id`
- `DELETE /api/admin/roles/:id`

#### 会议审批

- `GET /api/admin/bookings/pending`
- `POST /api/admin/bookings/:id/approve`
- `POST /api/admin/bookings/:id/reject`
- `GET /api/admin/bookings/approved`
- `GET /api/admin/bookings/rejected`

#### 系统提示词

- `GET /api/admin/prompts`
- `POST /api/admin/prompts`
- `PUT /api/admin/prompts/:id`
- `DELETE /api/admin/prompts/:id`

### 3.2 资源/预订接口（来源：`src/api/booking.js`）

- `GET /api/resources`
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `GET /api/bookings/:id`

### 3.3 日历/房间接口（来源：`src/api/calendar.js`）

- `GET /api/bookings/range`
- `GET /api/bookings/date`
- `GET /api/bookings/week`
- `GET /api/bookings/month`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `GET /api/rooms`
- `GET /api/rooms/availability`

---

## 4. 前端待接入情况（当前阻塞点）

### 4.1 已确认存在 TODO/注释占位

- `src/stores/admin.js`
  - 当前使用 `mockAdminPendingCounts`
  - 真实接口调用（`getPendingBookings`、`getPendingUsers`）仍注释

- `src/views/VenueCalendarView.vue`
  - `calendar api` 导入被注释
  - 存在 TODO：
    - 持久化 booking 到 API
    - 从 API 拉取 bookings

### 4.2 仍以 Mock 数据驱动的核心页面

- 管理端：
  - Meeting Approval
  - User Management
  - Access Right Management
  - License Plate Management
  - Prompt Management
  - Venue Management
  - EV Management
  - Display Management

- 业务端：
  - EVBooking
  - EVManageBooking
  - VenueManageBooking
  - VenueCalendarView
  - 部分 Display 视图

说明：上述页面已具备前端交互流程，但数据来源主要为 `src/mocks/mockData.js`，尚未完成真实后端联调。

---

## 5. 分阶段待办（建议执行顺序）

### [P0] 先打通最小可联调闭环

1. 后端新增 `admin` 模块最小集：
   - `GET /api/admin/bookings/pending`
   - `GET /api/admin/users/pending`
   - `POST /api/admin/bookings/:id/approve|reject`
   - `POST /api/admin/users/:id/approve|reject`
2. 前端 `stores/admin.js` 改为真实调用，移除计数 mock。
3. 登录后管理首页角标改为后端实时数据。

### [P1] 完成预订主链路

1. 后端新增 `bookings` 模块（列表、创建、删除、详情）。
2. 后端新增 `rooms` 可用性查询接口。
3. 前端接入：
   - `VenueCalendarView`（拉取/创建/删除）
   - `VenueBookingDialog`（可用性校验）
   - `EVBooking`（占用流程与可用数同步）

### [P2] 完成管理后台数据化

1. 落地 `admin` 全量资源接口（users/roles/venues/parking/prompts）。
2. 各管理页面逐个替换 mock 数据源。
3. 增加必要的筛选、分页、状态流转字段统一定义。

---

## 6. 联调规范建议（避免返工）

### 6.1 返回结构统一

建议全项目统一为以下两种之一：

- 方案 A：直接返回业务对象（当前后端多为此方案）
- 方案 B：统一信封 `{ code, message, data }`

当前前端 `request` 已兼容两种，但建议后续固定一种，避免接口风格混用。

### 6.2 状态枚举统一

至少统一以下枚举：

- 用户状态：`pending | active | rejected`（或等价命名）
- 预订状态：`pending | confirmed | cancelled | rejected`
- 资源状态：`active | disabled`（或等价命名）

### 6.3 分页与筛选约定

对列表型接口建议统一支持：

- 查询参数：`page`, `pageSize`, `keyword`, `status`
- 返回：`{ list, total, page, pageSize }`

---

## 7. 验收标准（Done Definition）

满足以下条件视为“接口联调完成”：

1. 前端关键页面不再依赖 `mockData` 主数据流。
2. 后端提供与前端 API 层一致的路由与字段。
3. 管理端待审批数量与实际列表一致。
4. 会议室/EV 预订可完成“查询-创建-取消/删除-刷新”闭环。
5. 401/403/422/500 场景均有可见错误提示。

---

## 8. 备注

- 本清单基于当前仓库代码静态盘点，适合作为近期迭代排期与接口开发 checklist。
- 每完成一个模块，建议同步更新本文件并标记完成状态（TODO / DOING / DONE）。
