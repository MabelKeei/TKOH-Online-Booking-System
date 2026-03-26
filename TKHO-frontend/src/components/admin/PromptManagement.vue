<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">System Prompts Management</h2>
      <div class="header-actions">
        <el-button type="default" class="cancel-btn" @click="handleExport">
          <font-awesome-icon :icon="['fas', 'file-excel']" /> Export Excel
        </el-button>
        <el-button v-if="activeTab === 'reject'" type="default" class="submit-btn" @click="handleAdd">
          <font-awesome-icon :icon="['fas', 'plus']" /> Add {{ activeTabLabel }}
        </el-button>
      </div>
    </div>

    <div class="page-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="System Prompts" name="system" />
        <el-tab-pane label="Reject Template" name="reject" />
      </el-tabs>
      <el-tabs v-if="activeTab === 'reject'" v-model="rejectSubTab" class="sub-tabs">
        <el-tab-pane label="Meeting Approval" name="meeting_approval" />
        <el-tab-pane label="Account Application" name="account_application" />
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
        <el-table-column
          prop="name"
          label="Name"
          :width="activeTab === 'reject' ? 360 : undefined"
          :min-width="activeTab === 'reject' ? undefined : 220"
        />
        <el-table-column label="Content" min-width="320">
          <template #default="{ row }">
            <div
              v-if="activeTab === 'system'"
              class="formatted-content"
              v-html="renderFormattedContent(row.content)"
            />
            <span v-else>{{ row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="160" fixed="right" class-name="actions-col">
          <template #default="{ row }">
            <div class="actions-cell">
              <el-button size="small" class="action-btn action-edit" @click="handleEdit(row)">Edit</el-button>
              <el-button
                v-if="activeTab === 'reject'"
                size="small"
                class="action-btn action-delete"
                @click="handleDelete(row)"
              >
                Delete
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ currentList.length }} records
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

    <BookingStyleModal
      v-model="showForm"
      :title="formMode === 'add' ? `Add ${activeTabLabel}` : `Edit ${activeTabLabel}`"
      :max-width="activeTab === 'system' ? '1240px' : '700px'"
      :max-height="formModalMaxHeight"
    >
      <el-form :model="formData" label-width="120px">
        <el-form-item v-if="activeTab === 'reject' && formMode === 'edit'" label="Type">
          <el-input v-model="formData.key" :disabled="activeTab === 'system' || formMode === 'edit'" placeholder="e.g., reject_template_01" />
        </el-form-item>
        <el-form-item v-if="activeTab === 'reject' && formMode === 'add'" label="Template Type">
          <el-select
            v-model="formData.templateType"
            style="width: 100%"
            :teleported="false"
            @change="handleRejectTemplateTypeChange"
          >
            <el-option
              v-for="option in rejectTemplateTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="formData.name" :disabled="activeTab === 'system'" placeholder="Display name" />
        </el-form-item>
        <el-form-item label="Content">
          <template v-if="activeTab === 'system'">
            <div class="rich-editor-wrap">
              <div class="rich-editor-toolbar">
                <el-button size="small" @click="applyTextStyle('bold')"><b>B</b></el-button>
                <el-button size="small" @click="applyTextStyle('underline')"><u>U</u></el-button>
                <label class="color-picker-label">A<input type="color" @click="applyColor($event.target.value)" @input="applyColor($event.target.value)" @change="applyColor($event.target.value)" /></label>
                <label class="color-picker-label">Bg<input type="color" @click="applyBackgroundColor($event.target.value)" @input="applyBackgroundColor($event.target.value)" @change="applyBackgroundColor($event.target.value)" /></label>
                <el-button size="small" @click="insertLineBreak">↵</el-button>
              </div>
              <div
                ref="richEditorRef"
                class="rich-editor"
                contenteditable="true"
                @input="handleRichEditorInput"
                @keydown="handleRichEditorKeydown"
              />
            </div>
          </template>
          <el-input
            v-else
            v-model="formData.content"
            type="textarea"
            :rows="6"
            placeholder="Prompt message content"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showForm = false">Cancel</el-button>
        <el-button type="default" class="submit-btn" @click="handleSave">Save</el-button>
      </template>
    </BookingStyleModal>

    <BookingStyleModal v-model="showDeleteDialog" title="Confirm Delete" max-width="450px">
      <p>Are you sure you want to delete this prompt?</p>
      <template #footer>
        <el-button type="default" class="cancel-btn" @click="showDeleteDialog = false">Cancel</el-button>
        <el-button type="default" class="action-btn action-delete" @click="confirmDelete">Delete</el-button>
      </template>
    </BookingStyleModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import BookingStyleModal from '@/components/BookingStyleModal.vue'
import { getMockPromptList } from '@/mocks/mockData'

const promptList = ref(getMockPromptList())
const rejectTemplateTypeOptions = [
  { value: 'meeting_approval', label: 'Meeting Approval Reject Template' },
  { value: 'account_application', label: 'Account Application Reject Template' }
]
const rejectTemplateDefaults = {
  meeting_approval: {
    key: 'meeting_approval_reject_template',
    name: 'Meeting Approval Reject Template',
    content: 'Your meeting booking request is rejected. Reason: {reason}'
  },
  account_application: {
    key: 'account_application_reject_template',
    name: 'Account Application Reject Template',
    content: 'Your account application is rejected. Reason: {reason}'
  }
}
const activeTab = ref('system')
const rejectSubTab = ref('meeting_approval')
const activeTabLabel = computed(() => (activeTab.value === 'system' ? 'System Prompt' : 'Reject Template'))
const currentList = computed(() => {
  if (activeTab.value === 'system') {
    return promptList.value.filter(item => item.category === 'system_fixed')
  }
  return promptList.value.filter(
    item => item.category === 'reject_template' && item.templateType === rejectSubTab.value
  )
})

const currentPage = ref(1)
const pageSize = ref(10)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return currentList.value.slice(start, end)
})

const totalPages = computed(() => Math.max(1, Math.ceil(currentList.value.length / pageSize.value)))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, currentList.value.length))
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

watch(activeTab, () => {
  currentPage.value = 1
})
watch(rejectSubTab, () => {
  currentPage.value = 1
})

const showForm = ref(false)
const formMode = ref('add')
const formData = ref({
  key: '',
  name: '',
  content: '',
  category: 'reject_template',
  canAdd: true,
  templateType: 'meeting_approval'
})

const showDeleteDialog = ref(false)
const currentRow = ref(null)
const richEditorRef = ref(null)
const SYSTEM_PROMPT_MODAL_MQ = '(min-width: 1100px) and (max-width: 1599px)'
const systemPromptEditModalMaxHeight = ref('94vh')
const formModalMaxHeight = computed(() => {
  if (activeTab.value === 'system' && formMode.value === 'edit') {
    return systemPromptEditModalMaxHeight.value
  }
  return '94vh'
})
let systemPromptModalMq = null

function updateSystemPromptEditModalMaxHeight () {
  if (typeof window === 'undefined') return
  systemPromptEditModalMaxHeight.value = window.matchMedia(SYSTEM_PROMPT_MODAL_MQ).matches ? '120vh' : '94vh'
}

onMounted(() => {
  updateSystemPromptEditModalMaxHeight()
  systemPromptModalMq = window.matchMedia(SYSTEM_PROMPT_MODAL_MQ)
  systemPromptModalMq.addEventListener('change', updateSystemPromptEditModalMaxHeight)
})

onUnmounted(() => {
  if (systemPromptModalMq) {
    systemPromptModalMq.removeEventListener('change', updateSystemPromptEditModalMaxHeight)
  }
})
watch(showForm, async (opened) => {
  if (!opened || activeTab.value !== 'system') return
  await nextTick()
  if (richEditorRef.value) {
    richEditorRef.value.innerHTML = sanitizeHtml(formData.value.content || '')
  }
})

const getRowIndex = (index) => (currentPage.value - 1) * pageSize.value + index + 1

const handleExport = () => {
  const exportData = currentList.value.map(item => ({
    'Type': item.key,
    'Name': item.name,
    'Content': item.content,
    'Template Rule': item.canAdd ? 'Customizable' : 'Fixed'
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  const sheetName = activeTab.value === 'system' ? 'System Prompts' : 'Reject Template'
  const filePrefix = activeTab.value === 'system' ? 'System_Prompts' : 'Reject_Template'
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filePrefix}_${new Date().toISOString().split('T')[0]}.xlsx`)
  ElMessage.success('Excel file exported successfully')
}

const handleAdd = () => {
  if (activeTab.value === 'system') return
  const defaultType = rejectSubTab.value === 'account_application' ? 'account_application' : 'meeting_approval'
  const defaultPreset = rejectTemplateDefaults[defaultType]
  formMode.value = 'add'
  formData.value = {
    key: defaultPreset.key,
    name: defaultPreset.name,
    content: defaultPreset.content,
    category: 'reject_template',
    canAdd: true,
    templateType: defaultType
  }
  showForm.value = true
}

const handleRejectTemplateTypeChange = (templateType) => {
  const preset = rejectTemplateDefaults[templateType]
  if (!preset) return
  formData.value.key = preset.key
  formData.value.name = preset.name
  formData.value.content = preset.content
}

const handleEdit = (row) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  showForm.value = true
}

function sanitizeHtml (html) {
  const container = document.createElement('div')
  container.innerHTML = html || ''
  container.querySelectorAll('script, iframe, object, embed, style, link').forEach((node) => node.remove())
  container.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase()
      const value = String(attr.value || '')
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        continue
      }
      if ((name === 'href' || name === 'src') && value.trim().toLowerCase().startsWith('javascript:')) {
        el.removeAttribute(attr.name)
      }
      if (name === 'style') {
        const safe = value
          .split(';')
          .map(s => s.trim())
          .filter(Boolean)
          .filter(rule => /^(color|background-color|font-weight|text-decoration)\s*:/i.test(rule))
          .join('; ')
        if (safe) {
          el.setAttribute('style', safe)
        } else {
          el.removeAttribute('style')
        }
      }
    }
  })
  return container.innerHTML
}

const renderFormattedContent = (content) => sanitizeHtml(content)

const handleRichEditorInput = () => {
  formData.value.content = sanitizeHtml(richEditorRef.value?.innerHTML || '')
}

function applyTextStyle (command) {
  document.execCommand(command)
  handleRichEditorInput()
}

function applyColor (color) {
  document.execCommand('foreColor', false, color)
  handleRichEditorInput()
}

function applyBackgroundColor (color) {
  document.execCommand('hiliteColor', false, color)
  handleRichEditorInput()
}

function insertLineBreak () {
  document.execCommand('insertLineBreak')
  handleRichEditorInput()
}

function handleRichEditorKeydown (event) {
  if (event.key !== 'Tab') return
  event.preventDefault()
  document.execCommand('insertText', false, '    ')
  handleRichEditorInput()
}

const handleSave = () => {
  if (activeTab.value === 'system') {
    formData.value.content = sanitizeHtml(formData.value.content || '')
  }
  if (!formData.value.key || !formData.value.name || !formData.value.content) {
    ElMessage.warning('Please fill in all required fields')
    return
  }

  if (formMode.value === 'add') {
    promptList.value.push({ ...formData.value, id: Date.now() })
    ElMessage.success(`${activeTabLabel.value} added successfully`)
  } else {
    const index = promptList.value.findIndex(item => item.id === formData.value.id)
    if (index !== -1) {
      promptList.value[index] = { ...formData.value }
      ElMessage.success(`${activeTabLabel.value} updated successfully`)
    }
  }
  showForm.value = false
}

const handleDelete = (row) => {
  currentRow.value = row
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (activeTab.value === 'reject') {
    const index = promptList.value.findIndex(item => item.id === currentRow.value.id)
    if (index !== -1) {
      promptList.value.splice(index, 1)
      ElMessage.success('Deleted successfully')
    }
  }
  showDeleteDialog.value = false
  currentRow.value = null
}
</script>

<style scoped>
.page-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
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

.page-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.5rem 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
}

.page-content :deep(.el-tabs__header) {
  margin-bottom: 0.5rem;
}

.page-content :deep(.el-tabs) {
  flex: 0 0 auto;
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

.sub-tabs :deep(.el-tabs__header) {
  margin-bottom: 0.5rem;
}

.sub-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}

.sub-tabs :deep(.el-tabs__item.is-active) {
  color: #00723a;
  font-weight: 600;
}

.sub-tabs :deep(.el-tabs__active-bar) {
  background-color: #00723a;
  height: 2px;
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
  white-space: nowrap;
}

.page-content :deep(.el-table th .cell) {
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
}

.page-content :deep(.el-table td) {
  padding: 0.5rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-content :deep(.el-table__row:hover) {
  background: #f9fafb;
}

.page-content :deep(.el-button--small) {
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.page-content :deep(.el-button--small:hover) {
  transform: none;
  box-shadow: none;
}

.page-content :deep(.el-tag) {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
}

.rich-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;
  box-sizing: border-box;
}

.rich-editor-wrap {
  display: block;
  width: 100%;
  min-width: 100%;
  max-width: 100%;
}

.color-picker-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #4b5563;
}

.color-picker-label input[type='color'] {
  width: 28px;
  height: 24px;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 4px;
  padding: 0;
}

.rich-editor {
  display: block;
  width: 100%;
  max-width: 100%;
  min-width: 100%;
  min-height: 150px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 10px 12px;
  box-sizing: border-box;
  line-height: 1.5;
  outline: none;
  white-space: pre-wrap;
  overflow-y: auto;
}

.rich-editor:focus {
  border-color: #00723a;
}

.formatted-content {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Keep system prompt content editor width stable inside el-form flex layout */
:deep(.el-form-item__content) .rich-editor-wrap {
  flex: 1 1 100%;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
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
</style>
