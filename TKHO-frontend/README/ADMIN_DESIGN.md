# Admin Management System - Updated Design

## 新设计概述

管理员系统已重新设计为左侧菜单栏 + 右侧内容区域的布局。

## 界面结构

```
┌─────────────────────────────────────────────────────────┐
│                    App Header                           │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│   Admin      │                                          │
│   Sidebar    │         Content Area                     │
│   Menu       │         (Table Pages)                    │
│              │                                          │
│  - Parking   │                                          │
│  - Venue     │                                          │
│  - Employee  │                                          │
│  - Permission│                                          │
│  - Approval  │                                          │
│  - Prompts   │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

## 左侧菜单栏

### 设计特点
- 固定宽度：260px
- 深绿色渐变背景 (#0A3D1F → #005a2f)
- 固定定位，始终可见
- 菜单项包含图标和文字标签

### 菜单项
1. **Parking Management** (车位管理) - 🚗
2. **Venue Management** (房间管理) - 🏢
3. **Employee Management** (员工管理) - 👥
4. **Permission Management** (权限管理) - 🛡️
5. **Meeting Approval** (会议审批) - ✅
6. **Prompts and Templates** (系统提示词) - 💬

### 交互效果
- 悬停：半透明白色背景
- 激活：白色左边框 + 更亮的背景
- 平滑过渡动画

## 右侧内容区域

### 页面结构
每个管理页面都包含：

1. **页面头部** (Page Header)
   - 绿色渐变背景
   - 页面标题（白色文字）
   - 操作按钮（如"添加"按钮）

2. **页面内容** (Page Content)
   - 白色背景
   - 数据表格
   - 分页控件（如需要）

### 表格页面列表

#### 1. Parking Management (车位管理)
- 显示所有停车位
- 列：车位编号、位置、类型、状态
- 操作：编辑、删除
- 添加按钮：新增停车位

#### 2. Venue Management (房间管理)
- 显示所有场地/会议室
- 列：场地名称、类型、容量、位置、图片数量、状态
- 操作：编辑、删除、查看图片
- 添加按钮：新增场地
- 支持上传多张图片

#### 3. Employee Management (员工管理)
- **Tab 1: Employee List**
  - 显示所有员工
  - 列：Corp ID、姓名、部门、职位、邮箱、配额使用情况、状态
  - 操作：编辑、重置配额、删除
  - 添加按钮：新增员工

- **Tab 2: Pending Approval** (带徽章显示待审批数量)
  - 显示待审批的新员工注册
  - 列：Corp ID、姓名、部门、职位、邮箱、提交时间
  - 操作：批准、拒绝

- 二维码按钮：显示员工注册二维码

#### 4. Permission Management (权限管理)
- 显示所有角色/职位
- 列：角色名称、描述、年度配额、员工数量
- 操作：编辑、删除
- 添加按钮：新增角色
- 注意：有员工的角色不能删除

#### 5. Meeting Approval (会议审批)
- **Tab 1: Pending Approval** (带徽章显示待审批数量)
  - 显示待审批的会议预定
  - 列：预定ID、场地、员工、部门、会议标题、日期、时间、提交时间
  - 操作：批准、拒绝（需填写原因）

- **Tab 2: Approved**
  - 显示已批准的会议
  - 列：预定ID、场地、员工、会议标题、日期、时间、批准时间、批准人

- **Tab 3: Rejected**
  - 显示已拒绝的会议
  - 列：预定ID、场地、员工、会议标题、日期、时间、拒绝时间、拒绝人、拒绝原因

#### 6. Prompts and Templates (系统提示词管理)
- 显示所有系统提示消息
- 列：提示键、标题、内容、类型、状态
- 操作：编辑、删除
- 添加按钮：新增提示
- 提示类型：Success、Warning、Error、Info

## 样式设计

### 颜色方案
- 主色：绿色 (#0A3D1F)
- 辅助色：深绿 (#005a2f)
- 背景：米色渐变 (#f8ecdd → #f5e6d3)
- 卡片背景：白色 (#ffffff)
- 文字：深灰 (#2c2c2c)

### 组件样式
- 圆角：12px (页面容器)
- 阴影：0 2px 12px rgba(0, 0, 0, 0.08)
- 按钮：渐变背景，悬停效果
- 表格：Element Plus 默认样式，带边框和斑马纹

## 响应式设计

### 桌面端 (>768px)
- 侧边栏宽度：260px
- 内容区域：自适应剩余宽度

### 移动端 (≤768px)
- 侧边栏宽度：200px
- 字体和间距适当缩小
- 表格可横向滚动

## 访问方式

1. 登录页面选择 "Admin Management"
2. 输入账号密码（默认：test / 123456）
3. 自动跳转到 `/admin` 路由
4. 默认显示 "Parking Management" 页面
5. 点击左侧菜单切换不同管理功能

## 技术实现

### 路由
- 路径：`/admin`
- 组件：`AdminManagement.vue`

### 组件结构
```
AdminManagement.vue (主容器)
├── AppHeader (顶部导航)
├── Sidebar (左侧菜单)
└── Content Area (内容区域)
    ├── ParkingManagement.vue
    ├── VenueManagement.vue
    ├── EmployeeManagement.vue
    ├── PermissionManagement.vue
    ├── MeetingApproval.vue
    └── PromptManagement.vue
```

### 状态管理
- 使用 `activeMenu` 控制当前显示的页面
- 使用 `v-if` 条件渲染对应组件
- 每个子组件独立管理自己的数据和状态

## 开发服务器

当前运行在：http://localhost:3001/

所有组件已通过热模块替换 (HMR) 成功更新。
