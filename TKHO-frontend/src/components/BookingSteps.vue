<template>
  <div class="booking-steps-wrapper w-full bg-white shadow-sm">
    <div class="booking-steps-inner mx-auto">
      <div class="booking-steps-el" role="list" aria-label="Booking steps">
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="step"
          :class="stepClass(index)"
          role="listitem"
        >
          <div class="step-main">
            <span class="step-title">{{ step }}</span>
          </div>

          <!-- 右侧三角形箭头：用 SVG 保证缩放不变形/不偏移 -->
          <svg
            class="step-arrow"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="0,0 100,50 0,100" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: { type: Array, required: true },
  current: { type: Number, required: true }
})

const normalizedCurrent = computed(() => {
  const n = Number(props.current)
  return Number.isFinite(n) ? n : 0
})

function stepClass(index) {
  if (index < normalizedCurrent.value) return 'is-success'
  if (index === normalizedCurrent.value) return 'is-process'
  return 'is-wait'
}
</script>

<style scoped>
.booking-steps-el {
  /* 统一控制步骤块高度与箭头宽度 */
  /* 用可被 150% 缩放整除的高度，避免子像素导致箭头看起来“错位” */
  --step-h: 32px;
  --arrow-w: calc(var(--step-h) / 2);
  --gap: 1.5rem;
}

.booking-steps-wrapper {
  height: clamp(58px, 8vh, 100px);
  display: flex;
  align-items: center;
  padding-block: clamp(2px, 0.8vh, 8px);
}

.booking-steps-inner {
  width: clamp(480px, 55vw, 960px);
  margin-inline: auto;
}

.booking-steps-el {
  display: flex;
  gap: var(--gap);
  width: 100%;
  /* 给最后一个箭头留空间（箭头向右伸出） */
  padding-right: var(--arrow-w);
  box-sizing: border-box;
}

.step {
  flex: 1;
  min-width: 0;
  position: relative;
  display: flex;
  height: var(--step-h);
  overflow: visible;
  padding: 0;
}

.step-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--step-h);
  padding: 0 1rem;
  margin: 0;
  color: #fff;
  text-align: center;
  /* 让块在箭头下方保持整洁 */
  border-radius: 0;
}

.step-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  margin: 0;
  padding: 0;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-arrow {
  position: absolute;
  top: 0;
  left: 100%;
  height: 100%;
  width: var(--arrow-w);
  pointer-events: none;
  z-index: 1;
}

.step-arrow polygon {
  fill: currentColor;
}

.step.is-success {
  color: #22c55e;
}
.step.is-success .step-main {
  background-color: #22c55e;
}

.step.is-process {
  color: #f97316;
}
.step.is-process .step-main {
  background-color: #f97316;
}

.step.is-wait {
  color: #22c55e;
}
.step.is-wait .step-main {
  background-color: #22c55e;
}
</style>
