<template>
  <div class="venue-card-images">
    <div v-if="loading" class="venue-card-images__loading">Loading...</div>
    <template v-else-if="pages.length">
      <div class="venue-card-images__viewport">
        <div class="venue-card__grid">
          <div
            v-for="(item, idx) in currentPage"
            :key="`${pageIndex}-${item.src}-${idx}`"
            class="venue-card__image"
          >
            <ApiProtectedImg :src="item.src" :alt="item.alt" />
            <div class="venue-card__overlay"></div>
          </div>
        </div>

        <button
          v-if="pages.length > 1"
          type="button"
          class="venue-card-images__nav venue-card-images__nav--prev"
          :disabled="pageIndex === 0"
          aria-label="Previous images"
          @click="goPrev"
        >
          ‹
        </button>
        <button
          v-if="pages.length > 1"
          type="button"
          class="venue-card-images__nav venue-card-images__nav--next"
          :disabled="pageIndex >= pages.length - 1"
          aria-label="Next images"
          @click="goNext"
        >
          ›
        </button>

        <div
          class="venue-card-images__pager"
          :class="{ 'venue-card-images__pager--hidden': pages.length <= 1 }"
          role="tablist"
          :aria-label="pages.length > 1 ? 'Image pages' : undefined"
          :aria-hidden="pages.length <= 1"
        >
          <template v-if="pages.length > 1">
            <button
              v-for="(_, i) in pages"
              :key="i"
              type="button"
              class="venue-card-images__dot"
              :class="{ 'venue-card-images__dot--active': i === pageIndex }"
              :aria-label="`Page ${i + 1} of ${pages.length}`"
              :aria-selected="i === pageIndex"
              @click="pageIndex = i"
            />
          </template>
        </div>
      </div>
    </template>
    <div v-else class="venue-card-images__empty">No images available</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import ApiProtectedImg from '@/components/ApiProtectedImg.vue'
import { chunkVenueImages } from '@/utils/venueImagePages'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const pageIndex = ref(0)

const pages = computed(() => chunkVenueImages(props.items))

const currentPage = computed(() => pages.value[pageIndex.value] || [])

watch(
  () => props.items,
  () => {
    pageIndex.value = 0
  }
)

watch(pages, (next) => {
  if (pageIndex.value > next.length - 1) {
    pageIndex.value = Math.max(0, next.length - 1)
  }
})

function goPrev () {
  if (pageIndex.value > 0) pageIndex.value -= 1
}

function goNext () {
  if (pageIndex.value < pages.value.length - 1) pageIndex.value += 1
}
</script>

<style scoped>
.venue-card-images {
  --venue-pager-slot: 0.45rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: clamp(8px, 1vh, 10px);
}

.venue-card-images__viewport {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.venue-card-images__nav {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 1.75rem;
  height: 2.5rem;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  background: rgba(236, 253, 243, 0.92);
  color: #166534;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.venue-card-images__nav--prev {
  left: 0.35rem;
}

.venue-card-images__nav--next {
  right: 0.35rem;
}

.venue-card-images__nav:hover:not(:disabled) {
  background: #dcfce7;
}

.venue-card-images__nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.venue-card__grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: clamp(8px, 1vh, 10px);
  column-gap: clamp(8px, 1vh, 10px);
  align-content: start;
  padding-top: clamp(6px, 0.65vh, 10px);
  flex-shrink: 0;
}

.venue-card__image {
  aspect-ratio: 4 / 3;
  border-radius: clamp(0.4rem, 0.8vh, 0.6rem);
  overflow: hidden;
  position: relative;
  background: #f3f4f6;
}

.venue-card__image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.venue-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.3));
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.venue-card__image:hover .venue-card__overlay {
  opacity: 1;
}

/* 固定占位：贴底、高度尽量小；无圆点时仍占位以保持左右卡片等高 */
.venue-card-images__pager {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.1rem;
  min-height: var(--venue-pager-slot);
  box-sizing: border-box;
}

.venue-card-images__pager--hidden {
  visibility: hidden;
  pointer-events: none;
}

.venue-card-images__dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: none;
  border-radius: 9999px;
  background: #d1d5db;
  cursor: pointer;
}

.venue-card-images__dot--active {
  background: #00723a;
}

.venue-card-images__loading,
.venue-card-images__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
  min-height: 8rem;
}

.venue-card-images__loading::after,
.venue-card-images__empty::after {
  content: '';
  display: block;
  flex-shrink: 0;
  width: 100%;
  margin-top: auto;
  height: var(--venue-pager-slot);
}
</style>
