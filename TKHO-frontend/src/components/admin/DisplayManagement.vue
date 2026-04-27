<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Display Management</h2>
      <div class="header-actions">
        <el-button type="default" class="submit-btn" @click="handleSaveConfig">Save Configuration</el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab" class="main-tabs">
        <el-tab-pane label="Display Rules" name="rules" class="rules-tab-pane">
          <div class="rules-pane">
            <div class="table-card display-rules-card">
              <el-table :data="paginatedVenueRules" height="100%" border stripe table-layout="auto" style="width: 100%">
                <el-table-column type="index" label="#" width="70" align="center" />
                <el-table-column prop="venueName" label="Venue" min-width="180" />
                <el-table-column label="Display Type" min-width="180">
                  <template #default="{ row }">
                    <div class="display-type-buttons">
                      <button
                        :class="['type-btn', 'type-btn-single', { active: row.displayType === 'single' }]"
                        @click="row.displayType = 'single'"
                      >
                        Single
                      </button>
                      <button
                        :class="['type-btn', 'type-btn-merge', { active: row.displayType === 'merge' }]"
                        @click="row.displayType = 'merge'"
                      >
                        Merge
                      </button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="Display Name" min-width="160">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.displayName"
                      placeholder="e.g. CR1"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="Arrow Direction" min-width="170">
                  <template #default="{ row }">
                    <el-select v-model="row.arrowDirection" placeholder="Direction" style="width: 100%">
                      <el-option
                        v-for="option in arrowDirectionOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
              </el-table>

              <div v-if="rulesTotalPages > 1" class="pagination-bar">
                <div class="pagination-info">
                  Showing {{ rulesTotal === 0 ? 0 : rulesStartIndex + 1 }}-{{ rulesEndIndex }} of {{ rulesTotal }} records
                </div>
                <div class="pagination-controls">
                  <button class="pagination-btn" :disabled="rulesCurrentPage === 1" @click="rulesCurrentPage--">Previous</button>
                  <button
                    v-for="page in rulesVisiblePages"
                    :key="`rules-page-${page}`"
                    :class="['pagination-btn', 'page-number', { active: page === rulesCurrentPage }]"
                    @click="rulesCurrentPage = page"
                  >
                    {{ page }}
                  </button>
                  <button class="pagination-btn" :disabled="rulesCurrentPage === rulesTotalPages" @click="rulesCurrentPage++">Next</button>
                </div>
                <div class="pagination-size">
                  <select v-model.number="rulesPageSize" class="page-size-select" @change="rulesCurrentPage = 1">
                    <option :value="10">10 / page</option>
                    <option :value="20">20 / page</option>
                    <option :value="50">50 / page</option>
                    <option :value="100">100 / page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </el-tab-pane>

        <el-tab-pane label="Preview Links" name="preview">
          <el-tabs v-model="previewSubTab" class="preview-sub-tabs">
            <el-tab-pane label="Single" name="single">
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
                <div class="card-title">Tea Service Display</div>
                <div class="link-list">
                  <div class="link-row">
                    <span class="link-label">Tea Service Board Preview</span>
                    <a :href="teaServicePreviewLink.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ teaServicePreviewLink.url }}</a>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="Merge" name="merge">
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
                <div class="card-title">Merge Display Customization</div>
                <div class="merge-config-grid">
                  <div class="merge-config-form">
                    <el-form label-width="150px">
                      <el-form-item label="Name &amp; Location">
                        <el-input
                          v-model="form.mergeDisplaySettings.panelTitleText"
                          type="textarea"
                          :rows="4"
                          :placeholder="mergePanelTitlePlaceholder"
                        />
                      </el-form-item>
                      <el-form-item label="Footer Ticker Text">
                        <el-input
                          v-model.trim="form.mergeDisplaySettings.footerTickerText"
                          type="textarea"
                          :rows="3"
                          placeholder="e.g. 請在會議期間佩戴外科口罩並保持安靜。For enquiries regarding Conference Rooms, please contact General Office."
                        />
                      </el-form-item>
                      <el-form-item label="QR Code Image">
                        <div class="qr-config-actions">
                          <el-upload
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleQrImageChange"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                          >
                            <el-button type="default">Upload QR Image</el-button>
                          </el-upload>
                          <el-button
                            type="default"
                            class="danger-light-btn"
                            :disabled="!form.mergeDisplaySettings.qrCodeImage"
                            @click="handleClearQrImage"
                          >
                            Clear Image
                          </el-button>
                        </div>
                      </el-form-item>
                    </el-form>
                  </div>

                  <div class="merge-preview-card">
                    <div class="preview-title">Merge Screen Preview</div>
                    <div class="preview-top">
                      <div class="preview-header-text merge-preview-title">{{ form.mergeDisplaySettings.panelTitleText || 'Name & location preview' }}</div>
                      <img
                        :src="mergePreviewQrImage"
                        alt="QR Code Preview"
                        class="preview-qr"
                      />
                    </div>
                    <div class="preview-footer">
                      <div class="preview-footer-ticker">
                        <div class="preview-footer-track">
                          <span class="preview-footer-text">{{ form.mergeDisplaySettings.footerTickerText || 'Footer ticker text preview' }}</span>
                          <span class="preview-footer-text" aria-hidden="true">{{ form.mergeDisplaySettings.footerTickerText || 'Footer ticker text preview' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getMockVenueList, getMockDisplayConfig, saveMockDisplayConfig } from '@/mocks/mockData'

const activeTab = ref('rules')
const previewSubTab = ref('single')
const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
const defaultMergeQrSrc = `${import.meta.env.BASE_URL}displayQRCode.png`
const mergePanelTitlePlaceholder = 'Conference Room | 8/F Ambulatory Care Block\n會議室 | 日間醫療大樓8樓'
const rulesCurrentPage = ref(1)
const rulesPageSize = ref(20)
const arrowDirectionOptions = [
  { label: 'Up', value: 'up' },
  { label: 'Up Right', value: 'up-right' },
  { label: 'Right', value: 'right' },
  { label: 'Down Right', value: 'down-right' },
  { label: 'Down', value: 'down' },
  { label: 'Down Left', value: 'down-left' },
  { label: 'Left', value: 'left' },
  { label: 'Up Left', value: 'up-left' }
]

const venueList = getMockVenueList()
const config = ref(getMockDisplayConfig())

const form = ref({
  evDisplayMode: config.value.evDisplayMode,
  mergeDisplaySettings: {
    panelTitleText: config.value.mergeDisplaySettings?.panelTitleText || '',
    footerTickerText: config.value.mergeDisplaySettings?.footerTickerText || '',
    qrCodeImage: config.value.mergeDisplaySettings?.qrCodeImage || ''
  },
  venueRules: venueList.map((venue) => {
    const matched = config.value.venueRules.find(item => item.venueId === venue.id)
    return {
      venueId: venue.id,
      venueName: venue.name,
      displayType: matched?.displayType || 'single',
      mergeGroup: matched?.mergeGroup ?? '',
      displayName: matched?.displayName ?? '',
      arrowDirection: matched?.arrowDirection ?? 'right'
    }
  })
})

const independentPreviewLinks = computed(() =>
  form.value.venueRules
    .filter(item => item.displayType === 'single')
    .map(item => ({
      key: `single-${item.venueId}`,
      label: item.venueName,
      url: `${baseUrl}/VenueBooking/Display?displayType=single&venueId=${item.venueId}`
    }))
)

const mergedPreviewLinks = computed(() => {
  const mergedVenues = form.value.venueRules
    .filter(item => item.displayType === 'merge')
    .map(item => item.venueName)

  if (mergedVenues.length === 0) return []

  return [{
    key: 'merge-all',
    title: 'Merge Display Preview',
    detail: `(${mergedVenues.length} venues): ${mergedVenues.join(', ')}`,
    url: `${baseUrl}/VenueBooking/Display/Merge`
  }]
})

const rulesTotal = computed(() => form.value.venueRules.length)
const rulesTotalPages = computed(() => Math.max(1, Math.ceil(rulesTotal.value / rulesPageSize.value)))
const rulesStartIndex = computed(() => (rulesCurrentPage.value - 1) * rulesPageSize.value)
const rulesEndIndex = computed(() => Math.min(rulesStartIndex.value + rulesPageSize.value, rulesTotal.value))
const paginatedVenueRules = computed(() =>
  form.value.venueRules.slice(rulesStartIndex.value, rulesStartIndex.value + rulesPageSize.value)
)
const rulesVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, rulesCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(rulesTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch([rulesTotal, rulesPageSize], () => {
  if (rulesCurrentPage.value > rulesTotalPages.value) {
    rulesCurrentPage.value = rulesTotalPages.value
  }
})

const teaServicePreviewLink = computed(() => ({
  url: `${baseUrl}/VenueBooking/Display/TeaService`
}))

const mergePreviewQrImage = computed(() => {
  const raw = form.value.mergeDisplaySettings.qrCodeImage
  return raw && String(raw).trim() ? raw : defaultMergeQrSrc
})

const handleSaveConfig = () => {
  const hasSingle = form.value.venueRules.some(item => item.displayType === 'single')
  const hasMerge = form.value.venueRules.some(item => item.displayType === 'merge')
  const venueDisplayMode = hasSingle && hasMerge ? 'mixed' : hasMerge ? 'merge' : 'single'

  config.value = saveMockDisplayConfig({
    venueDisplayMode,
    evDisplayMode: form.value.evDisplayMode,
    mergeDisplaySettings: {
      panelTitleText: form.value.mergeDisplaySettings.panelTitleText,
      footerTickerText: form.value.mergeDisplaySettings.footerTickerText,
      qrCodeImage: form.value.mergeDisplaySettings.qrCodeImage
    },
    venueRules: form.value.venueRules.map(item => ({
      venueId: item.venueId,
      displayType: item.displayType,
      mergeGroup: item.mergeGroup ?? '',
      displayName: (item.displayName ?? '').trim(),
      arrowDirection: item.arrowDirection ?? 'right'
    }))
  }, 'Display Admin')

  ElMessage.success('Display configuration saved')
}

const handleQrImageChange = (uploadFile) => {
  const rawFile = uploadFile?.raw
  if (!rawFile) return
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.warning('Please upload an image file')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    form.value.mergeDisplaySettings.qrCodeImage = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(rawFile)
}

const handleClearQrImage = () => {
  form.value.mergeDisplaySettings.qrCodeImage = ''
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
  margin: 0.5rem 0.75rem 0.3rem;
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
  padding: 0.3rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.main-tabs) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.35rem;
}

.page-content :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.page-content :deep(.main-tabs > .el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.page-content :deep(.main-tabs > .el-tabs__content > .el-tab-pane) {
  height: 100%;
  min-height: 0;
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

.rules-pane {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.display-rules-card {
  padding: 0.3rem;
  height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
}

.display-rules-card :deep(.el-table) {
  flex: 1;
  min-height: 0;
}

.merge-config-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 0.9rem;
  align-items: stretch;
}

.merge-config-form {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 0.75rem 0.25rem;
  background: #fafafa;
}

.qr-config-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.danger-light-btn {
  border-color: #fecaca !important;
  color: #b91c1c !important;
}

.merge-preview-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-title {
  padding: 0.55rem 0.75rem;
  background: #f3f4f6;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #374151;
}

.preview-top {
  min-height: 130px;
  flex: 1;
  padding: 0.75rem;
  background: linear-gradient(180deg, #f7b75a 0%, #f29b3a 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.preview-header-text {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
  min-width: 0;
}

.merge-preview-title {
  white-space: pre-line;
}

.preview-qr {
  width: 84px;
  height: 84px;
  border-radius: 4px;
  background: #ffffff;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.16);
  flex-shrink: 0;
}

.preview-qr-placeholder {
  width: 84px;
  height: 84px;
  border-radius: 4px;
  border: 1px dashed rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 600;
}

.preview-footer {
  padding: 0.65rem 0.75rem;
  background: rgba(90, 170, 220, 0.9);
  color: #111827;
  font-size: 0.8125rem;
  line-height: 1.35;
  overflow: hidden;
}

.preview-footer-ticker {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
}

.preview-footer-track {
  display: inline-flex;
  width: max-content;
  align-items: center;
  animation: previewTickerScroll 18s linear infinite;
}

.preview-footer-text {
  display: inline-block;
  padding-right: 2.5rem;
  white-space: nowrap;
}

@media (max-width: 1100px) {
  .merge-config-grid {
    grid-template-columns: 1fr;
  }
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

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding: 0.475rem 0.5rem 0.375rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
  margin-top: auto;
}

.pagination-info {
  font-size: 0.8125rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  gap: 0.375rem;
  align-items: center;
}

.pagination-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.page-number {
  min-width: 36px;
  text-align: center;
}

.pagination-btn.page-number.active {
  background-color: #00723a;
  border-color: #00723a;
  color: white;
}

.pagination-size {
  display: flex;
  align-items: center;
}

.page-size-select {
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #374151;
  font-size: 0.8125rem;
  cursor: pointer;
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

.display-type-buttons {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

.type-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  min-width: 70px;
}

.type-btn:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.type-btn-single.active {
  border-color: #16a34a;
  background: #dcfce7;
  color: #16a34a;
}

.type-btn-merge.active {
  border-color: #2563eb;
  background: #dbeafe;
  color: #2563eb;
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

@keyframes previewTickerScroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
