# 日历系统集成指南

## 快速开始

### 1. 文件结构总览

```
src/
├── views/
│   ├── VenueBooking.vue          # 场地选择页面（已修改）
│   └── CalendarView.vue          # ✨ 新增 - 日历主页面
├── components/
│   ├── CalendarMonth.vue         # ✨ 新增 - 月视图
│   ├── CalendarWeek.vue          # ✨ 新增 - 周视图
│   ├── CalendarDay.vue           # ✨ 新增 - 日视图
│   ├── BookingDialog.vue         # ✨ 新增 - 预订对话框
│   └── BookingDetailDialog.vue   # ✨ 新增 - 详情对话框
├── api/
│   ├── booking.js                # 原有
│   └── calendar.js               # ✨ 新增 - 日历 API
└── router/
    └── index.js                  # 已修改 - 添加路由
```

### 2. 用户流程

```
┌─────────────────┐
│    Login        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   VenueBooking.vue      │  ← 选择房间类型
│ ┌────────┐  ┌────────┐  │
│ │会议室  │  │其他场地│  │
│ └────────┘  └────────┘  │
└────────┬────────────────┘
         │ 点击 "Book Now"
         ▼
┌─────────────────────────────┐
│    CalendarView.vue         │  ← 查看日历
│                             │
│ ┌─────┬─────┬──────────┐    │
│ │Day  │Week │Month     │    │
│ └─────┴─────┴──────────┘    │
│                             │
│ [日历显示] [Add Booking]     │
│                             │
│ • 查看预订情况              │
│ • 新增预订                  │
│ • 编辑/删除预订             │
└─────────────────────────────┘
```

### 3. 组件通信流程

```
CalendarView.vue (主容器)
├─ CalendarMonth.vue (月视图)
│  └─ emit: day-click → 切换到日视图
├─ CalendarWeek.vue (周视图)
│  └─ emit: time-slot-click → 打开预订对话框
├─ CalendarDay.vue (日视图)
│  └─ emit: time-slot-click → 打开预订对话框
├─ BookingDialog.vue (新增/编辑)
│  └─ emit: confirm → 保存预订
└─ BookingDetailDialog.vue (详情)
   └─ emit: delete → 删除预订
```

## 关键功能实现

### 1. 视图切换

```vue
<!-- 在 CalendarView.vue 中 -->
<el-button
  :type="currentView === 'month' ? 'primary' : 'default'"
  @click="currentView = 'month'"
>
  Month
</el-button>
```

### 2. 日期导航

```javascript
// 上一个时期
function goToPreviousPeriod() {
  const date = new Date(currentDate.value)
  if (currentView.value === 'month') {
    date.setMonth(date.getMonth() - 1)
  } else if (currentView.value === 'week') {
    date.setDate(date.getDate() - 7)
  } else {
    date.setDate(date.getDate() - 1)
  }
  currentDate.value = date
}
```

### 3. 预订管理

```javascript
// 新增预订
function showBookingDialog() {
  editingBooking.value = null
  dialogVisible.value = true
}

// 处理确认
function handleBookingConfirm(bookingData) {
  bookings.value.push({
    id: Date.now(),
    ...bookingData
  })
  ElMessage.success('Booking added successfully!')
}

// 删除预订
function handleDeleteBooking(bookingId) {
  bookings.value = bookings.value.filter(b => b.id !== bookingId)
}
```

## API 集成指南

### 1. 启用 API 调用

在 `CalendarView.vue` 中取消注释 API 导入：

```javascript
import { 
  getBookingsByMonth, 
  getBookingsByWeek, 
  getBookingsByDate 
} from '../api/calendar'
```

### 2. 获取月视图数据

```javascript
async function fetchMonthBookings() {
  const date = currentDate.value
  try {
    const response = await getBookingsByMonth(
      date.getFullYear(),
      date.getMonth() + 1,
      roomType.value
    )
    bookings.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load bookings')
  }
}
```

### 3. 创建预订

```javascript
async function handleBookingConfirm(bookingData) {
  try {
    const response = await createVenueBooking({
      ...bookingData,
      roomType: roomType.value
    })
    bookings.value.push(response.data)
    ElMessage.success('Booking created successfully!')
  } catch (error) {
    ElMessage.error('Failed to create booking')
  }
}
```

### 4. 删除预订

```javascript
async function handleDeleteBooking(bookingId) {
  try {
    await deleteVenueBooking(bookingId)
    bookings.value = bookings.value.filter(b => b.id !== bookingId)
    ElMessage.success('Booking deleted!')
  } catch (error) {
    ElMessage.error('Failed to delete booking')
  }
}
```

## 样式定制

### 1. 颜色主题

编辑各组件中的颜色值：

```javascript
// BookingDialog.vue
const colorOptions = [
  '#f97316',  // 橙色
  '#3b82f6',  // 蓝色
  '#10b981',  // 绿色
  '#f43f5e',  // 红色
  '#8b5cf6',  // 紫色
  '#14b8a6'   // 青色
]
```

### 2. 时间范围

编辑 CalendarWeek.vue 和 CalendarDay.vue：

```javascript
// 当前：8:00 - 18:00
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return slots
})
```

### 3. 响应式调整

所有组件都使用 Tailwind CSS 进行响应式设计，支持：
- 移动设备 (< 640px)
- 平板 (640px - 1024px)
- 桌面 (> 1024px)

## 后端 API 实现建议

### 数据库表结构

```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_id INT NOT NULL,
  room_name VARCHAR(100) NOT NULL,
  room_type VARCHAR(20),  -- 'conference' or 'other'
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  attendees INT,
  notes TEXT,
  color VARCHAR(20),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_date (booking_date),
  INDEX idx_room (room_id),
  INDEX idx_type (room_type)
);

CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20),  -- 'conference' or 'other'
  capacity INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 必需的 API 端点

| 方法 | 路由 | 描述 |
|------|------|------|
| GET | `/bookings/month?year=2026&month=3&roomType=conference` | 获取月份预订 |
| GET | `/bookings/week?weekStart=2026-03-18&roomType=conference` | 获取周预订 |
| GET | `/bookings/date?date=2026-03-18&roomType=conference` | 获取日期预订 |
| POST | `/bookings` | 创建预订 |
| PUT | `/bookings/:id` | 更新预订 |
| DELETE | `/bookings/:id` | 删除预订 |
| GET | `/rooms?roomType=conference` | 获取房间列表 |
| GET | `/rooms/availability` | 检查可用性 |

## 测试检查清单

- [ ] 可以从 VenueBooking 页面进入日历
- [ ] 月视图显示所有日期和预订指示符
- [ ] 周视图显示7天的时间槽
- [ ] 日视图显示当日的详细预订
- [ ] 可以切换视图类型
- [ ] 可以导航到前后时期
- [ ] 可以点击时间槽打开预订对话框
- [ ] 可以新增预订
- [ ] 可以查看预订详情
- [ ] 可以删除预订
- [ ] 预订颜色显示正确
- [ ] 对话框验证工作正常
- [ ] 响应式设计在各种屏幕上工作
- [ ] 时间段选择逻辑正确
- [ ] 房间类型过滤正确

## 故障排除

### 问题：日期导航不工作

**解决方案**：检查 `currentDate` ref 的绑定

```javascript
// 确保使用 ref 赋值而不是直接修改
currentDate.value = newDate
```

### 问题：预订不显示

**解决方案**：确保日期格式匹配

```javascript
// 使用 ISO 字符串或标准格式
date: new Date().toISOString()
```

### 问题：对话框不打开

**解决方案**：检查 `dialogVisible` 的绑定

```javascript
// 确保使用 v-model 和 ref
<BookingDialog :visible="dialogVisible" @close="dialogVisible = false" />
```

## 性能优化建议

1. **虚拟滚动** - 对于大量预订，使用虚拟滚动
2. **分页加载** - 按周或月加载数据，避免一次性加载
3. **缓存策略** - 缓存已加载的月份数据
4. **图片优化** - 如果有场地图片，使用 WebP 格式

## 下一步计划

- [ ] 连接真实后端 API
- [ ] 添加预约冲突检测
- [ ] 实现用户权限控制
- [ ] 添加邮件通知功能
- [ ] 导出日历为 iCal 格式
- [ ] 集成 Google Calendar
- [ ] 添加重复预约功能
- [ ] 实现预约审批流程
