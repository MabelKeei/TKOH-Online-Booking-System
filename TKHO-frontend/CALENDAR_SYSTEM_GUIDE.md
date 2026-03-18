# 场地预订日历系统 - 使用指南

## 功能概述

该系统实现了一个完整的场地预订日历界面，支持多种视图模式和预订管理功能。

## 系统架构

### 主要文件

1. **CalendarView.vue** - 主控制页面
   - 视图切换（日/周/月）
   - 预订管理
   - 日期导航
   - 对话框管理

2. **日历视图组件**
   - `CalendarMonth.vue` - 月视图
     - 显示整月日期
     - 预订指示符（点）
     - 点击日期进入日视图
   
   - `CalendarWeek.vue` - 周视图
     - 显示一周7天
     - 时间槽网格（8:00-18:00）
     - 预订块显示
     - 时间段选择
   
   - `CalendarDay.vue` - 日视图
     - 24小时时间轴
     - 预订详细显示
     - 时间段选择
     - 空状态提示

3. **对话框组件**
   - `BookingDialog.vue` - 新增/编辑预订
     - 房间选择
     - 日期/时间选择
     - 参与人数
     - 备注
     - 颜色编码
   
   - `BookingDetailDialog.vue` - 预订详情
     - 显示预订信息
     - 删除功能

4. **API 接口** - `calendar.js`
   - 获取日期范围预订
   - 按日期/周/月获取预订
   - 创建/更新/删除预订
   - 房间可用性检查

## 使用流程

### 1. 进入预订日历

```
登录 → VenueBooking.vue (场地选择) → CalendarView.vue (日历视图)
       ↓
选择房间类型（会议室或其他场地）
```

### 2. 视图切换

- **月视图** - 概览整个月的预订情况
  - 绿色预订指示符
  - 点击日期查看详情或切换到日视图

- **周视图** - 查看一周的详细预订
  - 时间槽网格
  - 直观显示时间冲突

- **日视图** - 查看单日的时间轴
  - 详细的预订时间显示
  - 易于添加新预订

### 3. 新增预订

点击"Add Booking"按钮或在日/周视图中点击时间槽：

1. 选择房间
2. 选择日期
3. 输入开始和结束时间
4. 输入参与人数
5. 添加备注（可选）
6. 选择颜色标记
7. 点击确认

### 4. 管理预订

- **查看详情** - 点击预订块
- **编辑** - (可扩展功能)
- **删除** - 在详情对话框中点击删除按钮

## 功能特性

### 房间类型分类

```javascript
// 会议室
- Conference Room A
- Conference Room B
- Conference Room C
- Discussion Room 1
- Discussion Room 2

// 其他场地
- Main Hall
- Garden Area
- Outdoor Pavilion
- Event Space 1
- Event Space 2
```

### 时间范围

- 营业时间：8:00 - 18:00
- 时间单位：30分钟
- 支持灵活的预订时长

### 颜色编码

预订可以用不同颜色标记：
- 🟠 橙色 (默认)
- 🔵 蓝色
- 🟢 绿色
- 🔴 红色
- 🟣 紫色
- 🟦 青色

## 路由配置

```javascript
// VenueBooking 选择页面
/venue-booking

// 日历视图（带房间类型参数）
/calendar?roomType=conference  // 会议室
/calendar?roomType=other       // 其他场地
```

## API 端点

### 获取预订

```javascript
// 月视图
GET /bookings/month?year=2026&month=3&roomType=conference

// 周视图
GET /bookings/week?weekStart=2026-03-18&roomType=conference

// 日视图
GET /bookings/date?date=2026-03-18&roomType=conference

// 日期范围
GET /bookings/range?startDate=2026-03-01&endDate=2026-03-31&roomType=conference
```

### 预订操作

```javascript
// 创建预订
POST /bookings
{
  roomName: 'Conference Room A',
  date: '2026-03-18',
  startTime: '09:00',
  endTime: '10:30',
  attendees: 5,
  notes: 'Team meeting',
  color: '#f97316'
}

// 更新预订
PUT /bookings/:id
{ ...same fields... }

// 删除预订
DELETE /bookings/:id
```

### 房间管理

```javascript
// 获取可用房间列表
GET /rooms?roomType=conference

// 检查房间可用性
GET /rooms/availability?roomId=1&date=2026-03-18&startTime=09:00&endTime=10:30
```

## 示例数据

系统启动时会加载示例预订数据：

```javascript
- Conference Room A - 今天 09:00-10:30 (5人)
- Conference Room B - 今天 14:00-15:30 (8人)
- Discussion Room 1 - 明天 10:00-11:30 (3人)
- Conference Room A - 下周 13:00-14:00 (4人)
```

## 技术栈

- **框架**: Vue 3 (Composition API)
- **UI框架**: Element Plus
- **路由**: Vue Router
- **状态管理**: Pinia (可扩展)
- **样式**: Tailwind CSS
- **HTTP客户端**: Axios

## 扩展方向

1. **预约冲突检测** - 添加实时可用性检查
2. **预约提醒** - 邮件/短信通知
3. **导出功能** - 日历导出 (iCal, PDF)
4. **搜索过滤** - 房间/时间搜索
5. **批量操作** - 批量预约/取消
6. **权限管理** - 不同用户权限控制
7. **日历同步** - 与外部日历集成 (Google Calendar等)

## 常见问题

**Q: 如何修改营业时间？**
A: 编辑各个日历组件中的 `timeSlots` 计算属性

**Q: 如何集成真实 API？**
A: 取消注释 `calendar.js` 的导入，在 `onMounted` 中调用相应的 API 函数

**Q: 如何自定义房间列表？**
A: 修改 `BookingDialog.vue` 中的 `availableRooms` 计算属性

**Q: 支持多语言吗？**
A: 当前使用英文，可通过 Vue i18n 集成实现多语言
