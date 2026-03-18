<template>
  <!-- 步骤条容器：自适应高度 + 居中对齐 -->
  <div class="booking-steps-wrapper w-full bg-white shadow-sm">
    <div 
      class="booking-steps-inner mx-auto flex justify-center gap-4 md:gap-6"
    >
      <!-- 循环渲染步骤项 -->
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{
          'step-item--done': index < current,
          'step-item--active': index === current,
          'step-item--pending': index > current
        }"
      >
        {{ step }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// 定义组件属性：步骤数组 + 当前步骤索引
// 注意：在 <script setup> 中，defineProps 内部不能引用 props 本身，因此这里不做跨字段校验，只做基本类型约束
const props = defineProps({
  // 步骤名称数组，如 ['Log in', 'Booking', 'Submission', 'Confirmation']
  steps: {
    type: Array,
    required: true
  },
  // 当前激活的步骤索引（从 0 开始）
  current: {
    type: Number,
    required: true
  }
})
</script>

<style scoped>
.booking-steps-wrapper {
  /* 步骤条容器高度自适应，内容垂直居中 */
  height: clamp(58px, 8vh, 100px);
  display: flex;
  align-items: center;
  padding-block: clamp(2px, 0.8vh, 8px);
}

/* 进度条整体长度：最短 480px，中间按 55vw，最长 960px */
.booking-steps-inner {
  width: clamp(480px, 55vw, 960px);
}

/* 基础步骤项样式 */
.step-item {
  @apply px-4 md:px-6 text-xs md:text-sm font-semibold text-white;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: clamp(34px, 4vh, 40px);
  background-color: #22c55e; /* 默认绿色（未完成/已完成） */
  z-index: 1; /* 保证箭头层级正确 */
  flex: 1; /* 在父级 flex 中平均分配宽度，保证所有步骤等长 */
}

/* 已完成步骤：绿色 */
.step-item--done {
  background-color: #22c55e;
}

/* 当前激活步骤：橙色 */
.step-item--active {
  background-color: #f97316;
  z-index: 2; /* 避免被后续箭头覆盖 */
}

/* 未完成步骤：绿色（和已完成一致） */
.step-item--pending {
  background-color: #22c55e;
}

/* 右侧箭头样式：继承父元素颜色 */
.step-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: -17px; /* 精准贴合，无间隙 */
  width: 0;
  height: 0;
  /* 箭头高度与步骤项完全匹配 */
  border-top: calc(clamp(34px, 4vh, 40px) / 2) solid transparent;
  border-bottom: calc(clamp(34px, 4vh, 40px) / 2) solid transparent;
  border-left: 17px solid currentColor;
  color: inherit;
  /* 小屏优化：防止箭头超出容器 */
  pointer-events: none;
}

/* 不同状态箭头颜色匹配 */
.step-item--done::after {
  color: #22c55e;
}
.step-item--active::after {
  color: #f97316;
}
.step-item--pending::after {
  color: #22c55e;
}

/* 最右侧步骤保留箭头，不再隐藏 */

/* 小屏适配：避免文字换行/溢出 */
@media (max-width: 640px) {
  .step-item {
    padding-inline: 8px;
    font-size: 10px;
  }
  .step-item::after {
    right: -12px;
    border-left-width: 12px;
    border-top-width: calc(clamp(28px, 4vh, 32px) / 2);
    border-bottom-width: calc(clamp(28px, 4vh, 32px) / 2);
  }
}

/* 中等屏幕微调 */
@media (max-width: 768px) {
  .step-item {
    padding-inline: 10px;
  }
}
</style>