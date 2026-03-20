<template>
  <div class="page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden">
    <AppHeader @logout="onLogout" />

    <main
      class="account-main account-scroll flex-1 flex items-start justify-center px-2 md:px-3 lg:px-4 py-3 md:py-4 overflow-x-hidden"
    >
      <div class="account-container max-w-5xl w-full">
        <div class="account-grid">
          <!-- Profile Section -->
          <section class="profile-section bg-white rounded-lg shadow-sm p-5 md:p-6">
            <h2 class="section-title">Profile</h2>

            <div class="form-grid">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" v-model="profile.fullName" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" v-model="profile.email" class="form-input" disabled />
                  <p class="form-hint">(Email cannot be changed)</p>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Contact Telephone No.</label>
                  <input type="text" v-model="profile.phone" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Employee No.</label>
                  <input type="text" v-model="profile.employeeNo" class="form-input" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label class="form-label">Department</label>
                  <input type="text" v-model="profile.department" class="form-input" />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-save" @click="saveProfile">Save Profile</button>
            </div>
          </section>

          <!-- Change Password Section -->
          <section class="password-section bg-white rounded-lg shadow-sm p-5 md:p-6">
            <h2 class="section-title">Change Password</h2>

            <div class="form-grid">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Current Password</label>
                  <input type="password" v-model="password.current" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <input type="password" v-model="password.new" class="form-input" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <input type="password" v-model="password.confirm" class="form-input" />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-update" @click="updatePassword">Update Password</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()

const profile = ref({
  fullName: 'Karen SHEN',
  email: 'karenshen@ha.org.hk',
  phone: '12345678',
  employeeNo: '123456',
  department: 'Administration'
})

const password = ref({
  current: '',
  new: '',
  confirm: ''
})

const onLogout = () => {
  router.push('/login')
}

const saveProfile = () => {
  ElMessage.success('Profile saved successfully!')
}

const updatePassword = () => {
  if (!password.value.current || !password.value.new || !password.value.confirm) {
    ElMessage.error('Please fill in all password fields')
    return
  }

  if (password.value.new !== password.value.confirm) {
    ElMessage.error('New passwords do not match')
    return
  }

  ElMessage.success('Password updated successfully!')
  password.value = { current: '', new: '', confirm: '' }
}

let __accountResizeTimer = null
const __accountLogPx = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const pick = (selector) => document.querySelector(selector)
  const px = (el, prop) => {
    if (!el) return null
    const v = window.getComputedStyle(el).getPropertyValue(prop)
    const n = Number.parseFloat(v)
    return Number.isFinite(n) ? `${n}px` : v
  }

  const title = pick('.section-title')
  const label = pick('.form-label')
  const input = pick('.form-input')
  const card = pick('.profile-section')

  console.log('[Account] viewport(px):', { w: window.innerWidth, h: window.innerHeight })
  console.log('[Account] computed(px):', {
    sectionTitleFontSize: px(title, 'font-size'),
    formLabelFontSize: px(label, 'font-size'),
    formInputFontSize: px(input, 'font-size'),
    formInputPaddingTop: px(input, 'padding-top'),
    formInputPaddingRight: px(input, 'padding-right'),
    cardPaddingTop: px(card, 'padding-top'),
    cardPaddingRight: px(card, 'padding-right')
  })
}

const __accountOnResize = () => {
  if (__accountResizeTimer) window.clearTimeout(__accountResizeTimer)
  __accountResizeTimer = window.setTimeout(__accountLogPx, 80)
}

onMounted(() => {
  __accountLogPx()
  window.addEventListener('resize', __accountOnResize, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', __accountOnResize)
  if (__accountResizeTimer) window.clearTimeout(__accountResizeTimer)
  __accountResizeTimer = null
})
</script>

<style scoped>
.account-main {
  min-height: 0;
}

.account-container {
  width: 100%;
}

.account-scroll {
  overflow-y: auto;
  padding-top: calc(52px + 24px);
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.1875rem;
  font-weight: 600;
  color: #00723a;
  margin: 0 0 1.25rem 0;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #00723a;
  box-shadow: 0 0 0 3px rgba(0, 114, 58, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.btn-save,
.btn-update {
  background-color: #00723a;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-save:hover,
.btn-update:hover {
  background-color: #005a2e;
}

/* 笔记本：左右排列，尽量一屏显示 */
@media (min-width: 769px) and (max-width: 1366px) {
  .account-main {
    align-items: stretch;
  }

  .account-container {
    height: 100%;
    display: flex;
    flex: 1;
    align-self: stretch;
    min-height: 0;
  }

  .account-grid {
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
    height: 100%;
    flex: 1;
    min-height: 0;
    grid-auto-rows: 1fr;
    grid-template-rows: 1fr;
    align-content: stretch;
  }

  .profile-section,
  .password-section {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .profile-section .form-grid,
  .password-section .form-grid {
    flex: 1;
    min-height: 0;
  }

  .form-actions {
    margin-top: auto;
  }

  /* 左右两列时：Change Password 每行只显示一个输入框 */
  .password-section .form-row {
    grid-template-columns: 1fr;
  }

  .account-scroll {
    padding-bottom: 12px;
  }
}

/* 24寸/更大：回到上下排列 */
@media (min-width: 1367px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .profile-section,
  .password-section {
    padding: 1.125rem;
  }

  .section-title {
    font-size: 1rem;
    margin-bottom: 1rem;
  }

  .form-row {
    gap: 0.875rem;
  }

  .form-label {
    font-size: 0.8125rem;
  }

  .form-input {
    font-size: 0.8125rem;
    padding: 0.4375rem 0.625rem;
  }

  .form-hint {
    font-size: 0.7rem;
  }

  .btn-save,
  .btn-update {
    font-size: 0.875rem;
    padding: 0.5rem 1.25rem;
  }
}

@media (max-width: 768px) {
  .profile-section,
  .password-section {
    padding: 0.875rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .section-title {
    font-size: 0.9rem;
    margin-bottom: 0.875rem;
  }

  .form-label {
    font-size: 0.75rem;
  }

  .form-input {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
  }

  .form-hint {
    font-size: 0.6875rem;
  }

  .btn-save,
  .btn-update {
    width: 100%;
    font-size: 0.8125rem;
    padding: 0.5rem 0.875rem;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 0.9375rem;
    margin-bottom: 0.875rem;
  }

  .form-grid {
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.75rem;
  }

  .form-input {
    font-size: 0.75rem;
    padding: 0.375rem 0.55rem;
  }

  .form-hint {
    font-size: 0.625rem;
  }

  .btn-save,
  .btn-update {
    font-size: 0.8125rem;
    padding: 0.46875rem 0.8125rem;
  }
}

@media (max-width: 360px) {
  .profile-section,
  .password-section {
    padding: 0.875rem;
  }

  .section-title {
    font-size: 0.875rem;
  }

  .form-label {
    font-size: 0.6875rem;
  }

  .form-input {
    font-size: 0.6875rem;
    padding: 0.34375rem 0.5rem;
  }

  .form-hint {
    font-size: 0.6rem;
  }
}
</style>
