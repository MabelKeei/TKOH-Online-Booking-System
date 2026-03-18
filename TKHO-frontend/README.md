# TKHO 医院资源预定系统 - 前端项目

## 项目简介

这是一个基于 Vue 3 的现代化前端项目，用于医院内部资源预定系统。

## 技术栈

### 核心技术
- **Vue 3** (^3.5.22) - 渐进式 JavaScript 框架
- **Vite** (^6.4.1) - 下一代前端构建工具
- **Vue Router 4** (^4.6.3) - 官方路由管理器
- **Pinia** (^3.0.3) - Vue 的状态管理库

### UI 和样式
- **Element Plus** (^2.11.7) - 基于 Vue 3 的组件库
- **Tailwind CSS** (^4.1.17) - 实用优先的 CSS 框架
- **Font Awesome** (^7.1.0) - 图标库

### 工具库
- **Axios** (^1.13.1) - HTTP 客户端
- **qrcode** (^1.5.4) - 二维码生成库

## 环境要求

- Node.js >= 18.20.8 < 19.0.0
- npm >= 9.0.0

## 项目结构

```
TKHO-frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   │   ├── auth.js        # 认证相关 API
│   │   ├── booking.js     # 预定相关 API
│   │   └── request.js     # Axios 请求封装
│   ├── assets/            # 资源文件
│   ├── components/         # 组件
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.js        # 用户状态
│   │   └── booking.js     # 预定状态
│   ├── utils/             # 工具函数
│   │   └── qrcode.js      # 二维码工具
│   ├── views/             # 页面视图
│   │   ├── Home.vue       # 首页
│   │   ├── Login.vue      # 登录页
│   │   ├── Booking.vue    # 预定页
│   │   └── MyBookings.vue # 我的预定页
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
└── postcss.config.js      # PostCSS 配置
```

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 功能特性

- ✅ Vue 3 + Vite 项目初始化
- ✅ Vue Router 路由配置
- ✅ Pinia 状态管理
- ✅ Element Plus UI 组件库集成
- ✅ Tailwind CSS 样式框架
- ✅ Font Awesome 图标库
- ✅ Axios HTTP 请求封装
- ✅ 二维码生成工具
- ✅ 用户认证和状态管理
- ✅ 基础页面结构（首页、登录、预定、我的预定）
- ✨ **NEW** 场地预订日历系统
  - 支持月/周/日三种视图切换
  - 灵活的日期导航
  - 可视化预订管理
  - 实时预订冲突显示
  - 多种颜色编码支持
  - 响应式设计（移动/平板/桌面）

## API 代理配置

项目已配置 API 代理，开发环境下所有 `/api` 请求会被代理到 `http://localhost:8080`。

可在 `vite.config.js` 中修改代理配置。

## 开发说明

### 状态管理

使用 Pinia 进行状态管理：
- `user` store: 管理用户信息和认证状态
- `booking` store: 管理预定相关状态

### API 请求

所有 API 请求都通过 `src/api/request.js` 封装的 axios 实例发送，已配置：
- 请求拦截器：自动添加认证 token
- 响应拦截器：统一错误处理

### 路由配置

路由配置在 `src/router/index.js`，包含：
- `/` - 首页
- `/login` - 登录页
- `/booking` - 资源预定页
- `/my-bookings` - 我的预定页

## 后续开发建议

1. 完善资源预定功能
2. 添加资源管理页面
3. 实现预定详情和二维码生成
4. 添加权限管理
5. 完善错误处理和用户反馈
6. 添加单元测试和 E2E 测试

## 📅 日历系统使用指南

### 快速开始

1. 登录系统
2. 进入"Venue Booking"选择场地类型
3. 选择"Conference Rooms"或"Other Venues"
4. 进入日历管理界面

### 功能说明

#### 视图切换
- **Month** - 查看整月预订概览
- **Week** - 查看一周详细时间槽
- **Day** - 查看当日详细时间轴

#### 预订操作
- 点击时间槽快速新增预订
- 点击预订块查看/删除详情
- 支持参与人数、备注、颜色标记

#### 房间管理
- **会议室**: Conference Rooms A/B/C, Discussion Rooms 1/2
- **其他场地**: Main Hall, Garden Area, Pavilion, Event Spaces

### 相关文档

- 📖 [CALENDAR_SYSTEM_GUIDE.md](./CALENDAR_SYSTEM_GUIDE.md) - 完整使用指南
- 🔧 [CALENDAR_INTEGRATION_GUIDE.md](./CALENDAR_INTEGRATION_GUIDE.md) - 集成指南
- 🏗️ [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - 系统架构
- ⚡ [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - 快速参考
- ✅ [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md) - 完成总结

## 许可证

MIT
