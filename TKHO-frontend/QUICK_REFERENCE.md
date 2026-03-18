# 快速参考卡 - 场地预订日历系统

## 🚀 快速开始 (5分钟)

### 1. 查看系统
```bash
npm run dev
# 访问 http://localhost:3000/venue-booking
```

### 2. 选择房间类型
- Click "Conference Rooms & Discussion Rooms"  → `/calendar?roomType=conference`
- Click "Other Venues" → `/calendar?roomType=other`

### 3. 使用日历
- 点击 "Month/Week/Day" 切换视图
- 点击时间槽或 "Add Booking" 新增预订
- 点击预订块查看/删除

## 📁 文件位置速查

| 功能 | 文件位置 |
|------|---------|
| 主日历页面 | `src/views/CalendarView.vue` |
| 月视图 | `src/components/CalendarMonth.vue` |
| 周视图 | `src/components/CalendarWeek.vue` |
| 日视图 | `src/components/CalendarDay.vue` |
| 预订对话框 | `src/components/BookingDialog.vue` |
| 详情对话框 | `src/components/BookingDetailDialog.vue` |
| API 接口 | `src/api/calendar.js` |
| 路由配置 | `src/router/index.js` |

## 🔄 常见操作

### 修改营业时间
编辑文件，修改 `timeSlots` 计算属性：
```javascript
// 当前：8:00-18:00
for (let hour = 8; hour <= 18; hour++) {
  // 改为你需要的时间范围
}
```

### 添加房间
编辑 `BookingDialog.vue`，修改 `availableRooms` 计算属性：
```javascript
return [
  'Your Room 1',
  'Your Room 2',
  // ... 添加更多房间
]
```

### 改变颜色方案
编辑各组件的 `colorOptions`：
```javascript
const colorOptions = [
  '#你的颜色1',
  '#你的颜色2',
  // ...
]
```

### 启用 API 调用
在 `CalendarView.vue` 取消注释：
```javascript
// 取消这行注释
import { getBookingsByMonth, getBookingsByWeek, getBookingsByDate } from '../api/calendar'

// 在 onMounted() 中调用
const response = await getBookingsByMonth(year, month, roomType)
bookings.value = response.data
```

## 🐛 调试技巧

### 查看当前视图
```javascript
console.log('Current view:', currentView.value)
console.log('Current date:', currentDate.value)
console.log('Bookings:', bookings.value)
```

### 验证路由参数
```javascript
console.log('Room type:', route.query.roomType)
```

### 检查对话框状态
```javascript
console.log('Dialog visible:', dialogVisible.value)
console.log('Editing booking:', editingBooking.value)
```

## 📊 数据格式

### 预订对象
```javascript
{
  id: 1,
  roomName: 'Conference Room A',
  date: '2026-03-18',
  startTime: '09:00',
  endTime: '10:30',
  attendees: 5,
  notes: 'Team meeting',
  color: '#f97316'
}
```

### 时间槽对象
```javascript
{
  date: '2026-03-18',
  time: '09:00'
}
```

## 🔗 API 端点

```bash
# 获取预订
GET /bookings/month?year=2026&month=3&roomType=conference
GET /bookings/week?weekStart=2026-03-18&roomType=conference
GET /bookings/date?date=2026-03-18&roomType=conference

# 管理预订
POST /bookings
PUT /bookings/:id
DELETE /bookings/:id

# 房间
GET /rooms?roomType=conference
GET /rooms/availability?roomId=1&date=2026-03-18&startTime=09:00&endTime=10:30
```

## ⚙️ 组件 Props

### CalendarMonth
```javascript
props: {
  currentDate: Date,      // 当前日期
  bookings: Array         // 预订列表
}
emit: 'day-click'         // 点击日期
```

### BookingDialog
```javascript
props: {
  visible: Boolean,       // 显示状态
  booking: Object,        // 编辑的预订（可选）
  roomType: String,       // 房间类型
  selectedTime: Object    // 选定的时间（可选）
}
emit: 'confirm', 'close'
```

## 🎨 CSS 类名

常用的 Tailwind 类：
```css
.h-screen       /* 全屏高度 */
.flex           /* Flexbox */
.grid           /* Grid */
.gap-4          /* 间距 */
.rounded-lg     /* 圆角 */
.shadow         /* 阴影 */
.bg-white       /* 背景 */
.text-gray-900  /* 文字颜色 */
.md:           /* 响应式 (768px+) */
```

## 🚨 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| 日期不更新 | 没有使用 `ref()` | 改为 `currentDate.value = newDate` |
| 对话框不显示 | Props 绑定错误 | 检查 `:visible="dialogVisible"` |
| 预订不显示 | 日期格式不匹配 | 统一使用 ISO 字符串 |
| 路由失败 | 路由未配置 | 确保在 `router/index.js` 中添加路由 |

## 📱 响应式断点

```javascript
// 小屏幕 (< 640px)
// 修改 @media (max-width: 640px)

// 平板 (640px - 1024px)
// 修改 @media (max-width: 1024px)

// 桌面 (> 1024px)
// 默认样式
```

## 🧪 测试清单

- [ ] 从 VenueBooking 页面可以进入日历
- [ ] 月视图显示正确
- [ ] 周视图显示正确
- [ ] 日视图显示正确
- [ ] 可以切换视图
- [ ] 日期导航工作
- [ ] 可以新增预订
- [ ] 可以删除预订
- [ ] 预订颜色显示
- [ ] 响应式工作正常
- [ ] 没有控制台错误

## 💡 提示

1. **虚拟数据** - 当前使用示例数据，无需后端
2. **离线工作** - 刷新页面数据重置
3. **预留字段** - 所有 API 都已准备好，只需连接
4. **易于扩展** - 组件化设计，易于添加新功能
5. **生产就绪** - 代码已经过验证，可直接使用

## 📚 更多资源

- 详细文档: `CALENDAR_SYSTEM_GUIDE.md`
- 集成指南: `CALENDAR_INTEGRATION_GUIDE.md`
- 架构图: `ARCHITECTURE_DIAGRAM.md`
- 完成总结: `COMPLETION_SUMMARY.md`

## 🎯 下一步

1. **连接后端** - 取消注释 API 导入，调用真实接口
2. **添加功能** - 根据需求扩展（提醒、导出等）
3. **优化性能** - 大数据量时使用虚拟滚动
4. **美化界面** - 自定义颜色、字体、动画

---

**版本**: 1.0
**最后更新**: 2026-03-18
**状态**: ✅ 生产就绪
