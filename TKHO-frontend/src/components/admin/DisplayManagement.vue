<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Display Management</h2>
      <div class="header-actions">
        <el-button type="default" class="submit-btn" @click="handleSaveConfig">Save Configuration</el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="Display Rules" name="rules">
          <div class="table-card">
            <div class="card-title">Venue Display Assignment</div>
            <el-table :data="form.venueRules" border stripe table-layout="auto" style="width: 100%">
              <el-table-column type="index" label="#" width="70" align="center" />
              <el-table-column prop="venueName" label="Venue" min-width="180" />
              <el-table-column label="Display Type" min-width="180">
                <template #default="{ row }">
                  <el-radio-group v-model="row.displayType">
                    <el-radio label="independent">Single</el-radio>
                    <el-radio label="merge">Merge</el-radio>
                  </el-radio-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="Preview Links" name="preview">
          <div class="table-card">
            <div class="card-title">Venue Independent Display</div>
            <div class="link-list">
              <div v-for="item in independentPreviewLinks" :key="item.key" class="link-row">
                <span class="link-label">{{ item.label }}</span>
                <a :href="item.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ item.url }}</a>
              </div>
            </div>
          </div>

          <div class="table-card">
            <div class="card-title">Venue Merge Display</div>
            <div class="link-list">
              <div v-for="item in mergedPreviewLinks" :key="item.key" class="link-row merge-link-row">
                <span class="link-label">{{ item.title }}</span>
                <span class="link-detail">{{ item.detail }}</span>
                <a :href="item.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ item.url }}</a>
              </div>
              <div v-if="mergedPreviewLinks.length === 0" class="empty-text">No venue is set to merge display</div>
            </div>
          </div>

          <div class="table-card">
            <div class="card-title">EV Display</div>
            <div class="link-list">
              <div class="link-row">
                <span class="link-label">EV Display Preview</span>
                <a :href="evPreviewLink.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ evPreviewLink.url }}</a>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMockVenueList, getMockDisplayConfig, saveMockDisplayConfig } from '@/mocks/mockData'

const activeTab = ref('rules')
const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

const venueList = getMockVenueList()
const config = ref(getMockDisplayConfig())

const form = ref({
  evDisplayMode: config.value.evDisplayMode,
  venueRules: venueList.map((venue) => {
    const matched = config.value.venueRules.find(item => item.venueId === venue.id)
    return {
      venueId: venue.id,
      venueName: venue.name,
      displayType: matched?.displayType || 'independent'
    }
  })
})

const independentPreviewLinks = computed(() =>
  form.value.venueRules
    .filter(item => item.displayType === 'independent')
    .map(item => ({
      key: `independent-${item.venueId}`,
      label: item.venueName,
      url: `${baseUrl}/VenueBooking/Calendar?displayType=independent&venueId=${item.venueId}`
    }))
)

const mergedPreviewLinks = computed(() => {
  const mergedVenues = form.value.venueRules
    .filter(item => item.displayType === 'merge')
    .map(item => item.venueName)

  if (mergedVenues.length === 0) return []

  return [{
    key: 'merge-all',
    // title: 'Venue Merge Display',
    detail: `(${mergedVenues.length} venues): ${mergedVenues.join(', ')}`,
    url: `${baseUrl}/VenueBooking/Calendar?displayType=merge`
  }]
})

const evPreviewLink = computed(() => ({
  url: `${baseUrl}/evBooking/Calendar?displayType=${form.value.evDisplayMode}`
}))

const handleSaveConfig = () => {
  const hasIndependent = form.value.venueRules.some(item => item.displayType === 'independent')
  const hasMerge = form.value.venueRules.some(item => item.displayType === 'merge')
  const venueDisplayMode = hasIndependent && hasMerge ? 'mixed' : hasMerge ? 'merge' : 'independent'

  config.value = saveMockDisplayConfig({
    venueDisplayMode,
    evDisplayMode: form.value.evDisplayMode,
    venueRules: form.value.venueRules.map(item => ({
      venueId: item.venueId,
      displayType: item.displayType,
      mergeGroup: ''
    }))
  }, 'Display Admin')

  ElMessage.success('Display configuration saved')
}
</script>

<style scoped>
.page-container {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.4s ease;
}

.page-header {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  color: #111827;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin: 0.5rem 0.75rem 0.5rem;
}

.page-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

.page-header :deep(.el-button) {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  box-shadow: none;
  transition: all 0.2s ease;
}

.page-header :deep(.el-button:hover) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.5rem;
}

.page-content :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.page-content :deep(.el-tab-pane) {
  min-height: 0;
}

.page-content :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  padding: 0 24px;
  height: 44px;
  line-height: 44px;
}

.page-content :deep(.el-tabs__item.is-active) {
  color: #00723a;
  font-weight: 600;
}

.page-content :deep(.el-tabs__active-bar) {
  background-color: #00723a;
  height: 3px;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin-bottom: 0.6rem;
}

.page-content :deep(.el-table) {
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  font-size: 0.8125rem;
}

.page-content :deep(.el-table th) {
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.5rem;
  border-bottom: 2px solid #d1d5db;
}

.page-content :deep(.el-table td) {
  padding: 0.5rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-content :deep(.el-table__row:hover) {
  background: #f9fafb;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.6rem;
}

.link-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.link-label {
  min-width: 180px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.link-url {
  color: #2563eb;
  text-decoration: underline;
  word-break: break-all;
  font-size: 0.8125rem;
}

.link-detail {
  color: #374151;
  font-size: 0.8125rem;
  line-height: 1.35;
}

.merge-link-row {
  flex-direction: column;
  align-items: flex-start;
}

.empty-text {
  font-size: 0.8125rem;
  color: #6b7280;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
