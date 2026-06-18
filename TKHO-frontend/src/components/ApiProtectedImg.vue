<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import { loadProtectedAssetUrl, normalizeUploadAssetPath, revokeProtectedAssetUrl } from '@/utils/apiAsset'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' }
})

const displaySrc = ref('')
let cachedPath = ''

watch(
  () => props.src,
  async (raw) => {
    if (cachedPath) {
      revokeProtectedAssetUrl(cachedPath)
      cachedPath = ''
    }
    displaySrc.value = ''
    if (!raw) return
    const url = await loadProtectedAssetUrl(raw)
    displaySrc.value = url
    cachedPath = normalizeUploadAssetPath(raw)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (cachedPath) revokeProtectedAssetUrl(cachedPath)
})
</script>

<template>
  <img
    v-if="displaySrc"
    :src="displaySrc"
    :alt="alt"
    loading="lazy"
    decoding="async"
    v-bind="$attrs"
  />
</template>
