# 场地预订日历系统 - 架构与工作流图

## 系统整体架构

```
┌────────────────────────────────────────────────────────────────┐
│                      用户界面层 (Vue 3)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              CalendarView.vue (主容器)                    │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │  日期导航       │  │  视图切换 (Day/Week/Month)  │  │ │
│  │  │  [<< Prev]      │  │  [Day] [Week] [Month]       │  │ │
│  │  │  日期范围显示   │  │  [Add Booking]              │  │ │
│  │  │  [Next >>]      │  └──────────────────────────────┘  │ │
│  │  └─────────────────┘                                    │ │
│  │                                                          │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │              日历内容区域                          │ │ │
│  │  ├────────────────────────────────────────────────────┤ │ │
│  │  │                                                   │ │ │
│  │  │  ┌──────────────────┐  ┌──────────────────┐     │ │ │
│  │  │  │ CalendarMonth    │  │ CalendarWeek     │     │ │ │
│  │  │  │ (月视图)          │  │ (周视图)         │     │ │ │
│  │  │  │ 日期网格         │  │ 时间槽网格      │     │ │ │
│  │  │  │ 预订指示符(●)    │  │ 预订块显示      │     │ │ │
│  │  │  └──────────────────┘  └──────────────────┘     │ │ │
│  │  │                                                   │ │ │
│  │  │  ┌──────────────────────────────────────────┐   │ │ │
│  │  │  │ CalendarDay (日视图)                      │   │ │ │
│  │  │  │ 时间轴 8:00-18:00                         │   │ │ │
│  │  │  │ 预订块与时间段交互                        │   │ │ │
│  │  │  └──────────────────────────────────────────┘   │ │ │
│  │  │                                                   │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  ┌──────────────────┐  ┌────────────────────────────┐   │ │
│  │  │ BookingDialog    │  │ BookingDetailDialog        │   │ │
│  │  │ (新增/编辑)      │  │ (查看/删除)                │   │ │
│  │  │ 房间/日期/时间   │  │ 预订信息展示               │   │ │
│  │  │ 参与人数/备注    │  │ 删除按钮                   │   │ │
│  │  └──────────────────┘  └────────────────────────────┘   │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                              ↓
                         API 层
┌────────────────────────────────────────────────────────────────┐
│                    calendar.js (API 调用)                      │
├────────────────────────────────────────────────────────────────┤
│  • getBookingsByMonth()      获取月份预订                     │
│  • getBookingsByWeek()       获取周预订                       │
│  • getBookingsByDate()       获取日期预订                     │
│  • createVenueBooking()      创建预订                         │
│  • updateVenueBooking()      更新预订                         │
│  • deleteVenueBooking()      删除预订                         │
│  • checkRoomAvailability()   检查可用性                       │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                   后端 API 服务                                 │
├────────────────────────────────────────────────────────────────┤
│  • GET /bookings/month                                         │
│  • GET /bookings/week                                          │
│  • GET /bookings/date                                          │
│  • POST /bookings                                              │
│  • PUT /bookings/:id                                           │
│  • DELETE /bookings/:id                                        │
│  • GET /rooms                                                  │
│  • GET /rooms/availability                                     │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│                  数据库                                         │
├────────────────────────────────────────────────────────────────┤
│  • bookings 表 (预订)                                          │
│  • rooms 表 (房间)                                             │
│  • users 表 (用户)                                             │
└────────────────────────────────────────────────────────────────┘
```

## 用户流程图

```
┌──────────────┐
│   登录页面   │
│  Login.vue   │
└──────┬───────┘
       │ 登录成功
       ↓
┌──────────────────────────────┐
│   场地选择页面               │
│   VenueBooking.vue           │
├──────────────────────────────┤
│ ┌────────────────────────────┤
│ │ Conference Rooms  [Book Now]│
│ │ Other Venues      [Book Now]│
│ └────────────────────────────┤
└──────────────────────────────┘
       │ 点击 Book Now
       ├─────────────────────────────────┐
       ↓                                 ↓
   会议室                             其他场地
   roomType=conference              roomType=other
       │                                 │
       └─────────────────┬───────────────┘
                         ↓
          ┌──────────────────────────────┐
          │   日历视图                    │
          │   CalendarView.vue           │
          │   (roomType 查询参数)        │
          ├──────────────────────────────┤
          │  [Day][Week][Month]          │
          │  [Add Booking]               │
          │                              │
          │  ┌────────────────────────┐  │
          │  │ 日历显示区域           │  │
          │  └────────────────────────┘  │
          └──────────────────────────────┘
                     ↓
        ┌────────────┴───────────────┐
        ↓                            ↓
    新增预订                    查看预订详情
    BookingDialog.vue           BookingDetailDialog.vue
    [确认]                       [删除]
        ↓                            ↓
    预订已保存                   预订已删除
```

## 组件间通信流程

```
CalendarView
│
├─→ AppHeader (显示用户信息/登出)
│   └─ emit: logout
│
├─→ BookingSteps (步骤条)
│   (只读显示，当前步骤：Booking)
│
├─→ 视图切换
│   ├─ CalendarMonth
│   │  ├─ props: currentDate, bookings
│   │  └─ emit: day-click → 选择日期
│   │
│   ├─ CalendarWeek
│   │  ├─ props: currentDate, bookings
│   │  └─ emit: time-slot-click → 选择时间槽
│   │
│   └─ CalendarDay
│      ├─ props: currentDate, bookings
│      └─ emit: time-slot-click → 选择时间槽
│
├─→ BookingDialog
│   ├─ props: visible, booking, roomType, selectedTime
│   ├─ emit: confirm → 保存预订
│   └─ emit: close → 关闭对话框
│
└─→ BookingDetailDialog
    ├─ props: visible, booking
    ├─ emit: delete → 删除预订
    └─ emit: close → 关闭对话框
```

## 数据流向

```
初始化
  │
  └─→ onMounted()
      │
      ├─ 初始化 currentDate (今天)
      ├─ 初始化 bookings (从 API 获取)
      ├─ 初始化 roomType (从路由参数)
      │
      └─ 示例数据加载:
         ├─ 今天 09:00-10:30 Conference Room A
         ├─ 今天 14:00-15:30 Conference Room B
         ├─ 明天 10:00-11:30 Discussion Room 1
         └─ 下周 13:00-14:00 Conference Room A

用户交互
  │
  ├─→ 视图切换 (day/week/month)
  │   └─ currentView = 'month'
  │
  ├─→ 日期导航
  │   ├─ goToPreviousPeriod()
  │   │  └─ currentDate 更新
  │   └─ goToNextPeriod()
  │      └─ currentDate 更新
  │
  ├─→ 新增预订
  │   ├─ showBookingDialog()
  │   │  └─ dialogVisible = true
  │   │
  │   ├─ 用户填写表单
  │   │
  │   └─ handleBookingConfirm(bookingData)
  │      ├─ API 调用 (可选)
  │      ├─ bookings.push(newBooking)
  │      └─ ElMessage.success()
  │
  ├─→ 查看详情
  │   ├─ 点击预订块
  │   │  └─ selectedBooking = booking
  │   │      detailDialogVisible = true
  │   │
  │   └─ 显示 BookingDetailDialog
  │
  └─→ 删除预订
      ├─ handleDeleteBooking(bookingId)
      │  ├─ 确认对话框
      │  ├─ bookings.filter()
      │  └─ ElMessage.success()
      │
      └─ 预订列表更新
```

## 路由拓扑

```
┌─ /
│  └─ redirect → /login
│
├─ /login
│  └─ Login.vue (登录)
│      │ 登录成功
│      └─→ /venue-booking
│
├─ /venue-booking
│  └─ VenueBooking.vue (场地选择)
│      │ 选择会议室
│      └─→ /calendar?roomType=conference
│      │ 选择其他场地
│      └─→ /calendar?roomType=other
│
├─ /calendar ✨ 新增
│  └─ CalendarView.vue
│      ├─ 参数: roomType=conference|other
│      └─ 功能: 日历显示与预订管理
│
├─ /manage-booking
│  └─ ManageBooking.vue (管理预订)
│
├─ /account
│  └─ Account.vue (账户)
│
└─ /ev-booking
   └─ EVBooking.vue (EV充电预订)
```

## 状态管理流程

```
CalendarView (局部状态)
│
├─ currentView: 'month' | 'week' | 'day'
│  └─ 控制显示哪个日历视图
│
├─ currentDate: Date
│  └─ 当前查看的日期/周/月
│
├─ bookings: Array
│  └─ 所有预订列表
│      │
│      ├─ 新增: push(newBooking)
│      ├─ 删除: filter(id !== targetId)
│      └─ 更新: map(b => b.id === id ? {...newData} : b)
│
├─ roomType: 'conference' | 'other'
│  └─ 当前房间类型（从路由参数）
│
├─ dialogVisible: boolean
│  └─ 预订对话框显示状态
│
├─ detailDialogVisible: boolean
│  └─ 详情对话框显示状态
│
├─ editingBooking: Booking | null
│  └─ 当前编辑的预订对象
│
└─ selectedTime: TimeSlot | null
   └─ 用户选择的时间槽
```

## 时间处理逻辑

```
月视图
  └─→ new Date(currentDate) → 获取当前月份
      └─→ 计算月份的天数、首日星期几
          └─→ 生成 42 格日期网格 (6×7)

周视图
  └─→ currentDate → 获取所在周的周一
      └─→ 循环 7 天生成周日期数组
          └─→ 时间槽: 8:00-18:00 (11 时段)

日视图
  └─→ currentDate → 当天日期
      └─→ 时间轴: 8:00-18:00 (11 时段)
          └─→ 计算预订的位置和高度
              (startHour - 8) * slotHeight
```

## 预订对象数据结构

```
Booking {
  id: Number,                    // 唯一标识
  roomName: String,              // 房间名称
  date: Date | String,           // 预订日期
  startTime: String ('HH:mm'),   // 开始时间
  endTime: String ('HH:mm'),     // 结束时间
  attendees: Number,             // 参与人数
  notes: String,                 // 备注
  color: String,                 // 颜色 (#f97316 等)
  roomType: String,              // 房间类型
  createdBy: Number,             // 创建者 ID
  createdAt: Timestamp           // 创建时间
}
```

## 样式系统

```
Tailwind CSS 布局
├─ Flexbox 排列
├─ Grid 网格
├─ 响应式断点
│  ├─ sm: 640px
│  ├─ md: 768px
│  ├─ lg: 1024px
│  └─ 2xl: 1536px
│
└─ 颜色方案
   ├─ 背景: #f5f5f5
   ├─ 卡片: white
   ├─ 文字: #111827 (gray-900)
   ├─ 预订: 6 种颜色
   │  ├─ #f97316 (orange)
   │  ├─ #3b82f6 (blue)
   │  ├─ #10b981 (green)
   │  ├─ #f43f5e (rose)
   │  ├─ #8b5cf6 (violet)
   │  └─ #14b8a6 (teal)
   └─ 边界: #e5e7eb (gray-200)
```

---

这个架构设计遵循 Vue 3 Composition API 最佳实践，组件间通过 props 和 emit 进行通信，状态集中管理在父组件，数据流向清晰易维护。
