<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">Venue Management</h2>
      <div class="header-actions">
        <el-button v-if="activeMainTab === 'venueList'" type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
        <el-button v-if="activeMainTab === 'venueList'" type="default" class="submit-btn" @click="handleAdd">
          <font-awesome-icon :icon="['fas', 'plus']" /> Add Venue
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeMainTab" class="main-tabs">
        <el-tab-pane label="Venue List" name="venueList">
          <div class="venue-list-pane">
          <el-tabs v-model="activeCategory" class="sub-tabs" @tab-change="handleTabChange">
            <el-tab-pane label="Conference &amp; Discussion" name="conference_discussion" />
            <el-tab-pane label="Other Venues" name="other_venues" />
          </el-tabs>
          <div class="table-card">
          <el-table :data="paginatedData" height="100%" border stripe table-layout="auto" style="width: 100%">
        <el-table-column
          type="index"
          label="#"
          width="70"
          align="center"
          header-align="center"
          fixed="left"
          :index="getRowIndex"
        />
        <el-table-column prop="name" label="Venue Name" min-width="180" />
        <el-table-column prop="type" label="Type" min-width="130">
          <template #default="{ row }">
            <el-tag effect="light" :class="getTypeTagClass(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="color" label="Color" min-width="120">
          <template #default="{ row }">
            <div class="venue-color-cell">
              <span class="venue-color-dot" :style="{ backgroundColor: row.color }"></span>
              <span>{{ row.color }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="Location" min-width="170" />
        <el-table-column label="Images" min-width="120">
          <template #default="{ row }">
            <el-button type="default" size="small" class="check-btn" @click="handleViewImages(row)">
              View ({{ row.images?.length || 0 }})
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Blocked Periods" min-width="170">
          <template #default="{ row }">
            <div class="block-period-cell">
              <el-tag type="info">{{ row.blocks?.length || 0 }} blocked</el-tag>
              <el-button size="small" class="action-btn action-block" @click="handleManageBlocks(row)">Block</el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" min-width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? 'Active' : 'Inactive' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="160" fixed="right" class-name="actions-col">
          <template #default="{ row }">
            <div class="actions-cell">
              <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
              <el-button size="small" class="action-btn action-delete" @click="handleDelete(row)">Delete</el-button>
            </div>
          </template>
        </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <div class="pagination-info">
              Showing {{ filteredTotal === 0 ? 0 : startIndex + 1 }}-{{ endIndex }} of {{ filteredTotal }} records
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">Previous</button>
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="['pagination-btn', 'page-number', { active: page === currentPage }]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">Next</button>
            </div>
            <div class="pagination-size">
              <select v-model.number="pageSize" class="page-size-select" @change="currentPage = 1">
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
        <el-tab-pane label="Booking Date Range" name="bookingWindow">
          <div class="booking-window-card">
            <div class="booking-window-header">
              <h3>Venue Booking Date Range</h3>
              <span class="window-pill">
                <span class="window-pill-label">Current</span>
                <span class="window-pill-range">{{ venueWindow.currentStartDate }} ~ {{ venueWindow.currentEndDate }}</span>
              </span>
            </div>
            <div class="booking-window-form">
              <el-date-picker
                v-model="venueWindowForm.startDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Start date"
                :teleported="false"
              />
              <el-date-picker
                v-model="venueWindowForm.endDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="End date"
                :teleported="false"
              />
              <el-button type="default" class="submit-btn" @click="handlePublishVenueWindow">Publish</el-button>
            </div>
            <div class="booking-window-meta">
              Last published by {{ venueWindow.updatedBy }} at {{ formatDateTime(venueWindow.updatedAt) }}
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <BookingStyleModal
      v-model="showForm"
      :title="formMode === 'add' ? 'Add Venue' : 'Edit Venue'"
      max-width="600px"
    >
      <el-form :model="formData" label-width="120px">
        <el-form-item label="Venue Name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="Type">
          <el-select v-model="formData.type" style="width: 100%" :teleported="false">
            <el-option label="Conference" value="conference" />
            <el-option label="Discussion" value="discussion" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="Color">
          <div class="color-input-group">
            <el-color-picker v-model="formData.color" :teleported="false" />
            <el-input v-model.trim="formData.color" placeholder="#F4E9DA" maxlength="9" />
          </div>
        </el-form-item>
        <el-form-item label="Location">
          <el-input v-model="formData.location" />
        </el-form-item>
        <el-form-item label="Images">
          <el-upload
            v-model:file-list="formData.images"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePreview"
          >
            <font-awesome-icon :icon="['fas', 'plus']" />
          </el-upload>
        </el-form-item>
        <el-form-item label="Status">
          <el-switch v-model="formData.status" active-value="active" inactive-value="inactive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showForm = false">Cancel</el-button>
        <el-button type="default" class="submit-btn" @click="handleSave">Save</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showImagePreview" title="Image Preview" max-width="800px" dialog-width="94%">
      <img :src="previewImageUrl" style="width: 100%" alt="" />
    </BookingStyleModal>

    <BookingStyleModal v-model="showDeleteDialog" title="Confirm Delete" max-width="450px">
      <p>Are you sure you want to delete this venue?</p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showDeleteDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmDelete">Delete</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal
      v-model="showBlockDialog"
      :title="`Manage Block Time - ${blockVenueName}`"
      max-width="980px"
      :dialog-height="blockDialogHeight"
      :max-height="blockDialogMaxHeight"
      :overlay-padding="blockDialogOverlayPadding"
    >
      <div ref="blockModalContentRef" class="block-modal-content">
        <el-form ref="blockFormSectionRef" :model="blockForm" label-width="90px">
          <div class="block-form-row">
            <el-form-item label="Start">
              <el-date-picker
                v-model="blockForm.startAt"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="Start datetime"
                :teleported="false"
                style="width: 220px"
              />
            </el-form-item>
            <el-form-item label="End">
              <el-date-picker
                v-model="blockForm.endAt"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="End datetime"
                :teleported="false"
                style="width: 220px"
              />
            </el-form-item>
          </div>
          <el-form-item label="Reason">
            <el-input
              v-model.trim="blockForm.reason"
              type="textarea"
              :rows="3"
              placeholder="e.g. Maintenance / Cleaning / Event Setup"
            />
          </el-form-item>
        </el-form>
        <div ref="blockToolbarRef" class="block-toolbar">
          <el-button type="default" class="submit-btn" @click="handleAddBlockPeriod">Add Block Period</el-button>
        </div>
        <div class="block-table-wrap">
          <el-table class="block-table" :data="paginatedBlockData" :max-height="blockTableMaxHeight" border stripe table-layout="fixed" style="width: 100%">
            <el-table-column type="index" label="#" width="70" align="center" />
            <el-table-column prop="startAt" label="Start" min-width="130" />
            <el-table-column prop="endAt" label="End" min-width="130" />
            <el-table-column prop="reason" label="Reason" min-width="260" />
            <el-table-column label="Actions" width="120" align="center">
              <template #default="{ row }">
                <el-button size="small" class="action-btn action-delete" @click="handleRemoveBlockPeriod(row.id)">Delete</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div ref="blockPaginationRef" class="pagination-bar block-pagination-bar">
            <div class="pagination-info">
              Showing {{ blockStartIndex + 1 }}-{{ blockEndIndex }} of {{ currentVenueBlocks.length }} records
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="blockCurrentPage === 1" @click="blockCurrentPage--">Previous</button>
              <button
                v-for="page in blockVisiblePages"
                :key="page"
                :class="['pagination-btn', 'page-number', { active: page === blockCurrentPage }]"
                @click="blockCurrentPage = page"
              >
                {{ page }}
              </button>
              <button class="pagination-btn" :disabled="blockCurrentPage === blockTotalPages" @click="blockCurrentPage++">Next</button>
            </div>
            <div class="pagination-size">
              <select v-model.number="blockPageSize" class="page-size-select" @change="blockCurrentPage = 1">
                <option :value="5">5 / page</option>
                <option :value="10">10 / page</option>
                <option :value="20">20 / page</option>
                <option :value="50">50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showBlockDialog = false">Close</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { getMockVenueList, getMockBookingWindow, publishMockBookingWindow } from '@/mocks/mockData'

const venueList = ref(getMockVenueList())
const activeMainTab = ref('venueList')
const activeCategory = ref('conference_discussion')

const currentPage = ref(1)
const pageSize = ref(10)
const venueWindow = ref(getMockBookingWindow('venue'))
const venueWindowForm = ref({
  startDate: venueWindow.value.currentStartDate,
  endDate: venueWindow.value.currentEndDate
})

const filteredVenueList = computed(() =>
  venueList.value.filter(item => (item.tab ?? item.category) === activeCategory.value)
)
const filteredTotal = computed(() => filteredVenueList.value.length)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredVenueList.value.slice(start, end)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTotal.value / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, filteredTotal.value))
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const showForm = ref(false)
const formMode = ref('add')
const formData = ref({
  name: '',
  tab: 'conference_discussion',
  type: 'conference',
  color: '',
  location: '',
  images: [],
  status: 'active'
})

const showImagePreview = ref(false)
const previewImageUrl = ref('')
const showDeleteDialog = ref(false)
const currentRow = ref(null)
const showBlockDialog = ref(false)
const currentBlockVenue = ref(null)
const blockForm = ref({
  startAt: '',
  endAt: '',
  reason: ''
})
const blockModalContentRef = ref(null)
const blockFormSectionRef = ref(null)
const blockToolbarRef = ref(null)
const blockPaginationRef = ref(null)
const blockCurrentPage = ref(1)
const blockPageSize = ref(10)

const getRowIndex = (index) => (currentPage.value - 1) * pageSize.value + index + 1

const getTypeLabel = (type) => {
  if (type === 'conference') return 'Conference'
  if (type === 'discussion') return 'Discussion'
  return 'Other'
}

const getTypeTagClass = (type) => {
  if (type === 'conference') return 'type-tag type-tag-conference'
  if (type === 'discussion') return 'type-tag type-tag-discussion'
  return 'type-tag type-tag-other'
}

const isValidHexColor = (value) => /^#[0-9A-Za-z]{6,8}$/.test(value)
const blockVenueName = computed(() => currentBlockVenue.value?.name || 'Venue')
const currentVenueBlocks = computed(() => currentBlockVenue.value?.blocks || [])
/** 14" 断点实现参考 MeetingApproval 的 matchMedia 方式 */
const BLOCK_MODAL_MQ = '(min-width: 1100px) and (max-width: 1599px)'
const blockDialogMaxHeight = ref('90vh')
const blockDialogHeight = ref('84vh')
const blockDialogOverlayPadding = ref('20px 0')
const blockTableMaxHeight = ref('42vh')

const blockTotalPages = computed(() => Math.max(1, Math.ceil(currentVenueBlocks.value.length / blockPageSize.value)))
const blockStartIndex = computed(() => {
  if (currentVenueBlocks.value.length === 0) return 0
  return (blockCurrentPage.value - 1) * blockPageSize.value
})
const blockEndIndex = computed(() => {
  if (currentVenueBlocks.value.length === 0) return 0
  return Math.min(blockStartIndex.value + blockPageSize.value, currentVenueBlocks.value.length)
})
const blockVisiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, blockCurrentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(blockTotalPages.value, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
const paginatedBlockData = computed(() => {
  const start = blockStartIndex.value
  const end = start + blockPageSize.value
  return currentVenueBlocks.value.slice(start, end)
})

function updateBlockDialogModalSize () {
  if (typeof window === 'undefined') return
  const is14Inch = window.matchMedia(BLOCK_MODAL_MQ).matches
  blockDialogMaxHeight.value = is14Inch ? '120vh' : '90vh'
  blockDialogHeight.value = is14Inch ? '116vh' : '84vh'
  blockDialogOverlayPadding.value = is14Inch ? '1px 0' : '20px 0'
  updateBlockTableMaxHeight()
}

let blockDialogMq = null

const handleTabChange = () => {
  currentPage.value = 1
}

watch(filteredTotal, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})

watch([() => currentVenueBlocks.value.length, blockPageSize], () => {
  if (blockCurrentPage.value > blockTotalPages.value) {
    blockCurrentPage.value = blockTotalPages.value
  }
  updateBlockTableMaxHeight()
})

watch(showBlockDialog, (val) => {
  if (val) updateBlockTableMaxHeight()
})

onMounted(() => {
  updateBlockDialogModalSize()
  blockDialogMq = window.matchMedia(BLOCK_MODAL_MQ)
  blockDialogMq.addEventListener('change', updateBlockDialogModalSize)
})

onUnmounted(() => {
  if (blockDialogMq) {
    blockDialogMq.removeEventListener('change', updateBlockDialogModalSize)
  }
})

const handleExport = () => {
  const exportData = filteredVenueList.value.map(item => {
    const base = {
      'Venue Name': item.name,
      'Color': item.color,
      'Location': item.location,
      'Status': item.status === 'active' ? 'Active' : 'Inactive'
    }

    if (activeCategory.value === 'conference_discussion') {
      return {
        ...base,
        'Type': getTypeLabel(item.type)
      }
    }

    return base
  })

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Venues')
  XLSX.writeFile(wb, `Venue_Management_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('Excel file exported successfully')
}

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-US', { hour12: false })
}

const handlePublishVenueWindow = () => {
  if (!venueWindowForm.value.startDate || !venueWindowForm.value.endDate) {
    ElMessage.warning('Please select start and end date')
    return
  }
  if (venueWindowForm.value.endDate < venueWindowForm.value.startDate) {
    ElMessage.warning('End date must be later than start date')
    return
  }

  venueWindow.value = publishMockBookingWindow({
    resourceType: 'venue',
    startDate: venueWindowForm.value.startDate,
    endDate: venueWindowForm.value.endDate,
    publishedBy: 'Venue Admin'
  })
  ElMessage.success('Venue booking date range published')
}

const handleAdd = () => {
  formMode.value = 'add'
  formData.value = {
    name: '',
    tab: activeCategory.value,
    type: activeCategory.value === 'conference_discussion' ? 'conference' : 'other',
    color: '',
    location: '',
    images: [],
    blocks: [],
    status: 'active'
  }
  showForm.value = true
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  if (!Array.isArray(row.blocks)) row.blocks = []
  formData.value = {
    ...row,
    tab: row.tab ?? row.category ?? activeCategory.value,
    type: row.type ?? ((row.tab ?? row.category) === 'conference_discussion' ? 'conference' : 'other'),
    blocks: Array.isArray(row.blocks) ? row.blocks : []
  }
  showForm.value = true
}

const handleSave = () => {
  if (!formData.value.color) {
    ElMessage.warning('Please select a color for calendar display')
    return
  }

  if (!isValidHexColor(formData.value.color)) {
    ElMessage.warning('Please enter a valid HEX color value, e.g. #F4E9DA')
    return
  }

  if (!formData.value.type) {
    ElMessage.warning('Please select a type')
    return
  }

  const normalizedFormData = {
    ...formData.value,
    tab: activeCategory.value,
    type: formData.value.type
  }

  if (formMode.value === 'add') {
    venueList.value.push({ ...normalizedFormData, id: Date.now() })
    ElMessage.success('Venue added successfully')
  } else {
    const index = venueList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      venueList.value[index] = { ...normalizedFormData }
      ElMessage.success('Venue updated successfully')
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  currentRow.value = row
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  const index = venueList.value.findIndex(item => item.id === currentRow.value.id)
  if (index !== -1) {
    venueList.value.splice(index, 1)
    ElMessage.success('Deleted successfully')
  }
  showDeleteDialog.value = false
  currentRow.value = null
}

const handleViewImages = (row) => {
  ElMessage.info(`Viewing images for ${row.name}`)
}

const resetBlockForm = () => {
  blockForm.value = {
    startAt: '',
    endAt: '',
    reason: ''
  }
}

const handleManageBlocks = (row) => {
  if (!Array.isArray(row.blocks)) row.blocks = []
  currentBlockVenue.value = row
  blockCurrentPage.value = 1
  resetBlockForm()
  showBlockDialog.value = true
  updateBlockTableMaxHeight()
}

const handleAddBlockPeriod = () => {
  if (!currentBlockVenue.value) return
  if (!blockForm.value.startAt || !blockForm.value.endAt || !blockForm.value.reason) {
    ElMessage.warning('Please fill in Start, End and Reason')
    return
  }
  const startAtDate = new Date(blockForm.value.startAt.replace(' ', 'T'))
  const endAtDate = new Date(blockForm.value.endAt.replace(' ', 'T'))
  if (Number.isNaN(startAtDate.getTime()) || Number.isNaN(endAtDate.getTime())) {
    ElMessage.warning('Invalid date time format')
    return
  }
  if (endAtDate <= startAtDate) {
    ElMessage.warning('End datetime must be later than start datetime')
    return
  }
  currentBlockVenue.value.blocks.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    startAt: blockForm.value.startAt,
    endAt: blockForm.value.endAt,
    reason: blockForm.value.reason
  })
  blockCurrentPage.value = Math.max(1, Math.ceil(currentBlockVenue.value.blocks.length / blockPageSize.value))
  resetBlockForm()
  updateBlockTableMaxHeight()
  ElMessage.success('Blocked period added')
}

const handleRemoveBlockPeriod = (blockId) => {
  if (!currentBlockVenue.value) return
  const index = currentBlockVenue.value.blocks.findIndex(item => item.id === blockId)
  if (index !== -1) {
    currentBlockVenue.value.blocks.splice(index, 1)
    updateBlockTableMaxHeight()
    ElMessage.success('Blocked period removed')
  }
}

function updateBlockTableMaxHeight () {
  nextTick(() => {
    const contentEl = blockModalContentRef.value
    const formEl = blockFormSectionRef.value?.$el || blockFormSectionRef.value
    const toolbarEl = blockToolbarRef.value
    const paginationEl = blockPaginationRef.value
    if (!contentEl || !formEl || !toolbarEl || !paginationEl) return
    const contentHeight = contentEl.clientHeight
    const reservedHeight = formEl.offsetHeight + toolbarEl.offsetHeight + paginationEl.offsetHeight + 18
    // 回收分页栏下方压缩出来的空间，优先给表格显示更多行
    const available = Math.max(180, contentHeight - reservedHeight + 16)
    blockTableMaxHeight.value = `${available}px`
  })
}

const handlePreview = (file) => {
  previewImageUrl.value = file.url
  showImagePreview.value = true
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

.page-header::before {
  content: none;
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
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
  min-height: 56px;
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
  position: relative;
  z-index: 1;
}

.page-header :deep(.el-button:hover) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-header :deep(.el-button:active) {
  transform: translateY(0);
}

.page-content :deep(.el-table) {
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  font-size: 0.8125rem;
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

.page-content :deep(.main-tabs > .el-tabs__content) {
  flex: 1;
  min-height: 0;
}

.page-content :deep(.main-tabs > .el-tabs__content > .el-tab-pane) {
  height: 100%;
  min-height: 0;
}

.page-content :deep(.sub-tabs) {
  flex: none;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.5rem;
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

.page-content :deep(.el-table th) {
  background: #f3f4f6;
  color: #374151;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.5rem;
  border-bottom: 2px solid #d1d5db;
  white-space: nowrap;
}

.page-content :deep(.el-table th .cell) {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

.page-content :deep(.el-table__row:hover) {
  background: #f9fafb;
}

.page-content :deep(.el-table td) {
  padding: 0.5rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-content :deep(.el-button--small) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-content :deep(.el-button--small:hover) {
  transform: none;
  box-shadow: none;
}

.page-content :deep(.el-tag) {
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

.page-content :deep(.type-tag) {
  border-radius: 999px;
  font-weight: 600;
  padding: 0 10px;
}

.page-content :deep(.type-tag-conference) {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.page-content :deep(.type-tag-discussion) {
  background-color: #fef3c7;
  color: #92400e;
}

.page-content :deep(.type-tag-other) {
  background-color: #dcfce7;
  color: #166534;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  min-height: 32px;
  align-items: center;
}

.block-period-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.block-modal-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: -8px;
}

.block-form-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.block-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
  margin-bottom: 0.6rem;
}

.block-table-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.block-table-wrap :deep(.el-table) {
  width: 100% !important;
  max-width: 100%;
}

.block-pagination-bar {
  margin-top: auto;
  margin-bottom: 0;
  padding-bottom: 0;
}

.block-modal-content :deep(.el-textarea__inner) {
  overflow-y: auto;
  resize: none;
}

.venue-color-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.venue-color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  display: inline-block;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.color-input-group :deep(.el-color-picker) {
  flex: 0 0 auto;
}

.color-input-group :deep(.el-input) {
  flex: 1;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding: 0.475rem 0.5rem 0.375rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
  flex-shrink: 0;
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

.pagination-btn.page-number.active:hover {
  background-color: #005a2e;
  border-color: #005a2e;
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

.page-size-select:focus {
  outline: none;
  border-color: #00723a;
}

.table-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.3rem;
  height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.venue-list-pane {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.booking-window-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.booking-window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.booking-window-header h3 {
  margin: 0;
  font-size: 0.95rem;
}

.window-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #86efac;
  box-shadow: 0 2px 6px rgba(22, 101, 52, 0.12);
}

.window-pill-label {
  background: #166534;
  color: #ffffff;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.window-pill-range {
  color: #14532d;
  font-size: 0.8125rem;
  font-weight: 700;
}

.booking-window-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.booking-window-meta {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.table-card :deep(.el-table) {
  flex: 1;
  min-height: 0;
}

.actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 6px;
}

.actions-cell :deep(.el-button) {
  margin-left: 0 !important;
  white-space: nowrap;
}

.action-btn {
  border: none !important;
  padding: 0.25rem 0.5rem !important;
  border-radius: 0.25rem !important;
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
  color: #ffffff !important;
  transition: all 0.2s !important;
}

.action-edit {
  background-color: #f97316 !important;
}

.action-edit:hover {
  background-color: #ea580c !important;
}

.action-delete {
  background-color: #ef4444 !important;
}

.action-delete:hover {
  background-color: #dc2626 !important;
}

.action-block {
  background-color: #3b82f6 !important;
}

.action-block:hover {
  background-color: #2563eb !important;
}
</style>
