# TKHO Backend (NestJS Migration)

此项目为 `TKHO-backend` 的 NestJS 重构版本，目标对齐 `VisitorSystem` 的模块化架构。

## 快速启动

```powershell
cd TKHO-backend-nest
npm install
Copy-Item .env.example .env
npm run prisma:generate
npm run start:dev
```

Swagger: `http://localhost:4001/api/docs`

## 已迁移模块

- `AuthModule`: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/user`
- `HealthModule`: `GET /api/health`
- `MetaModule`: `GET /api/meta/users`, `GET /api/meta/employees`, `GET /api/meta/venues`
- `ParkingModule`: `POST /api/parking/occupy`（Redis 锁 + Prisma 事务）

## Prisma

- Schema: `prisma/schema.prisma`
- Seed: `prisma/seed.ts`

执行：

```powershell
npm run prisma:migrate
npm run prisma:seed
```

## 双服务并行切流方案

1. 旧服务继续运行（`TKHO-backend`, 端口 4000）。
2. 新服务运行在 4001。
3. 网关按路由切流：
   - 第一步：`/api/health` -> 4001
   - 第二步：`/api/auth/*` -> 4001
   - 第三步：`/api/meta/*` 与 `/api/parking/*` -> 4001
4. 每次切流后回归：登录、获取用户、场地列表、抢占车位。

## 回滚预案

- 任一阶段发现异常，网关立即把对应路由切回 4000。
- 保留旧库结构不变；新服务使用同一数据库，避免数据迁移导致额外回滚成本。
- 回滚后保留新服务日志，定位完成后再灰度重放。
