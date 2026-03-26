<template>
  <div class="page h-screen bg-gradient flex flex-col overflow-hidden pt-[64px]">
    <AppHeader @logout="onLogout" />

    <main class="account-main flex-1 flex items-start justify-center px-2 md:px-3 lg:px-4 py-1 md:py-2 overflow-y-auto">
      <div class="account-container max-w-6xl w-full">
        <div class="account-grid">
          <!-- Profile Section -->
          <section class="profile-section card-style">
            <div class="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <h2 class="section-title">Profile Information</h2>
            </div>

            <div class="form-grid">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name <span class="required">*</span></label>
                  <input type="text" v-model="profile.fullName" class="form-input" placeholder="Enter your full name" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" v-model="profile.email" class="form-input" disabled />
                  <p class="form-hint">Email cannot be changed</p>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Contact Telephone <span class="required">*</span></label>
                  <input type="text" v-model="profile.phone" class="form-input" placeholder="12345678" />
                </div>
                <div class="form-group">
                  <label class="form-label">User No. <span class="required">*</span></label>
                  <input type="text" v-model="profile.employeeNo" class="form-input" placeholder="123456" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group full-width">
                  <label class="form-label">Department <span class="required">*</span></label>
                  <input type="text" v-model="profile.department" class="form-input" placeholder="Enter your department" />
                </div>
              </div>
            </div>

            <div class="form-actions with-border">
              <button class="btn-save" @click="saveProfile">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Profile
              </button>
            </div>
          </section>

          <!-- Change Password Section -->
          <section class="password-section card-style">
            <div class="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <h2 class="section-title">Change Password</h2>
            </div>

            <div class="form-grid">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Current Password <span class="required">*</span></label>
                  <input type="password" v-model="password.current" class="form-input" placeholder="Enter current password" />
                </div>
                <div class="form-group">
                  <label class="form-label">New Password <span class="required">*</span></label>
                  <input type="password" v-model="password.new" class="form-input" placeholder="Enter new password" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Confirm New Password <span class="required">*</span></label>
                  <input type="password" v-model="password.confirm" class="form-input" placeholder="Confirm new password" />
                </div>
              </div>
            </div>

            <div class="form-actions with-border">
              <button class="btn-update" @click="updatePassword">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                </svg>
                Update Password
              </button>
            </div>
          </section>

          <!-- Vehicle License Plates Section -->
          <section class="vehicle-section card-style">
            <div class="section-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="section-icon">
                <path d="M5 17h14v-5H5v5z"></path>
                <path d="M5 12V9l2-3h10l2 3v3"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
              <h2 class="section-title">Vehicle Information</h2>
            </div>

            <div class="vehicle-list">
              <div
                v-for="(vehicle, index) in sortedVehicles"
                :key="index"
                class="vehicle-item"
                :class="{ 'vehicle-default': vehicle.isDefault, 'vehicle-editing': editingVehicleIndex === vehicle.originalIndex }"
                @click="setDefaultVehicle(vehicle.originalIndex)"
              >
                <div class="vehicle-number">{{ index + 1 }}</div>
                <div class="vehicle-info">
                  <div class="vehicle-main">
                    <input
                      v-if="editingVehicleIndex === vehicle.originalIndex"
                      type="text"
                      v-model="vehicle.plate"
                      class="vehicle-plate-input editing"
                      @click.stop
                      placeholder="License Plate"
                    />
                    <div v-else class="vehicle-plate">{{ vehicle.plate }}</div>
                    <div class="vehicle-badge-group">
                      <select
                        v-if="editingVehicleIndex === vehicle.originalIndex"
                        v-model="vehicle.type"
                        class="vehicle-type-select"
                        :class="`vehicle-type-${vehicle.type.toLowerCase()}`"
                        @click.stop
                      >
                        <option value="Personal">Personal</option>
                        <option value="Company">Company</option>
                      </select>
                      <div v-else class="vehicle-type" :class="`vehicle-type-${vehicle.type.toLowerCase()}`">{{ vehicle.type }}</div>
                      <div v-if="vehicle.isDefault" class="vehicle-default-badge">Default</div>
                    </div>
                  </div>
                  <input
                    v-if="editingVehicleIndex === vehicle.originalIndex"
                    type="text"
                    v-model="vehicle.brand"
                    class="vehicle-brand-input"
                    placeholder="Brand"
                    @click.stop
                  />
                  <div v-else class="vehicle-brand">{{ vehicle.brand }}</div>
                </div>
                <div class="vehicle-actions">
                  <button
                    v-if="editingVehicleIndex === vehicle.originalIndex"
                    class="btn-save-vehicle"
                    @click.stop="saveVehicle(vehicle.originalIndex)"
                    title="Save changes"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </button>
                  <button
                    v-if="editingVehicleIndex === vehicle.originalIndex"
                    class="btn-cancel-edit"
                    @click.stop="cancelEdit(vehicle.originalIndex)"
                    title="Cancel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button
                    v-else
                    class="btn-edit"
                    @click.stop="startEditVehicle(vehicle.originalIndex)"
                    title="Edit vehicle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    v-if="editingVehicleIndex !== vehicle.originalIndex"
                    class="btn-remove"
                    @click.stop="removeVehicle(vehicle.originalIndex)"
                    title="Remove vehicle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              <div v-if="vehicles.length === 0" class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
                  <path d="M5 17h14v-5H5v5z"></path>
                  <path d="M5 12V9l2-3h10l2 3v3"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
                <p class="empty-text">No vehicles added yet</p>
              </div>
            </div>

            <div class="add-vehicle-section">
              <button v-if="!showAddForm" class="btn-add-vehicle" @click="showAddForm = true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add License Plate
              </button>

              <div v-if="showAddForm" class="add-vehicle-form">
                <div class="form-row-compact">
                  <input
                    type="text"
                    v-model="newVehicle.plate"
                    class="form-input"
                    placeholder="License Plate"
                    @keyup.enter="addVehicle"
                  />
                  <input
                    type="text"
                    v-model="newVehicle.brand"
                    class="form-input"
                    placeholder="Brand"
                    @keyup.enter="addVehicle"
                  />
                  <select v-model="newVehicle.type" class="form-input">
                    <option value="Personal">Personal</option>
                    <option value="Company">Company</option>
                  </select>
                </div>
                <div class="form-actions-row">
                  <button class="btn-confirm" @click="addVehicle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Confirm
                  </button>
                  <button class="btn-cancel" @click="cancelAddVehicle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
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

const vehicles = ref([
  { plate: 'AB1234', type: 'Personal', brand: 'Toyota', isDefault: true },
  { plate: 'CD5678', type: 'Company', brand: 'Honda', isDefault: false }
])

const newVehicle = ref({
  plate: '',
  type: 'Personal',
  brand: ''
})

const showAddForm = ref(false)
const editingVehicleIndex = ref(null)
const vehicleBackup = ref(null)

const sortedVehicles = computed(() => {
  return vehicles.value
    .map((v, i) => ({ ...v, originalIndex: i }))
    .sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return 0
    })
})

const onLogout = () => {
  router.push('/login')
}

const saveProfile = () => {
  if (!profile.value.fullName || !profile.value.phone || !profile.value.employeeNo || !profile.value.department) {
    ElMessage.error('Please fill in all required fields')
    return
  }
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

const addVehicle = () => {
  if (!newVehicle.value.plate.trim()) {
    ElMessage.error('Please enter a license plate')
    return
  }

  if (!newVehicle.value.brand.trim()) {
    ElMessage.error('Please enter a brand')
    return
  }

  const plateExists = vehicles.value.some(v => v.plate.toUpperCase() === newVehicle.value.plate.trim().toUpperCase())
  if (plateExists) {
    ElMessage.error('This license plate already exists')
    return
  }

  vehicles.value.push({
    plate: newVehicle.value.plate.trim().toUpperCase(),
    type: newVehicle.value.type,
    brand: newVehicle.value.brand.trim(),
    isDefault: vehicles.value.length === 0
  })

  newVehicle.value = { plate: '', type: 'Personal', brand: '' }
  showAddForm.value = false
  ElMessage.success('Vehicle added successfully!')
}

const cancelAddVehicle = () => {
  newVehicle.value = { plate: '', type: 'Personal', brand: '' }
  showAddForm.value = false
}

const removeVehicle = (index) => {
  const wasDefault = vehicles.value[index].isDefault
  vehicles.value.splice(index, 1)

  if (wasDefault && vehicles.value.length > 0) {
    vehicles.value[0].isDefault = true
  }

  ElMessage.success('Vehicle removed successfully!')
}

const setDefaultVehicle = (index) => {
  if (editingVehicleIndex.value === index) return

  vehicles.value.forEach((v, i) => {
    v.isDefault = i === index
  })
  ElMessage.success('Default vehicle updated!')
}

const startEditVehicle = (index) => {
  const vehicle = vehicles.value[index]
  vehicleBackup.value = {
    plate: vehicle.plate,
    brand: vehicle.brand,
    type: vehicle.type
  }
  editingVehicleIndex.value = index
}

const saveVehicle = (index) => {
  const vehicle = vehicles.value[index]
  const trimmedPlate = vehicle.plate.trim().toUpperCase()
  const trimmedBrand = vehicle.brand.trim()

  if (!trimmedPlate) {
    ElMessage.error('License plate cannot be empty')
    return
  }

  if (!trimmedBrand) {
    ElMessage.error('Brand cannot be empty')
    return
  }

  const plateExists = vehicles.value.some((v, i) => i !== index && v.plate.toUpperCase() === trimmedPlate)
  if (plateExists) {
    ElMessage.error('This license plate already exists')
    return
  }

  vehicle.plate = trimmedPlate
  vehicle.brand = trimmedBrand
  editingVehicleIndex.value = null
  vehicleBackup.value = null
  ElMessage.success('Vehicle updated!')
}

const cancelEdit = (index) => {
  if (vehicleBackup.value) {
    const vehicle = vehicles.value[index]
    vehicle.plate = vehicleBackup.value.plate
    vehicle.brand = vehicleBackup.value.brand
    vehicle.type = vehicleBackup.value.type
  }
  editingVehicleIndex.value = null
  vehicleBackup.value = null
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
.bg-gradient {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.account-main {
  min-height: 0;
  overflow-y: auto;
}

.account-container {
  width: 100%;
}

.account-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.card-style {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #00723a;
  flex-shrink: 0;
}

.section-icon {
  color: #00723a;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #00723a;
  margin: 0;
}

.required {
  color: #dc2626;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

.form-input {
  padding: 0.4375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: #111827;
  transition: all 0.2s;
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
  font-size: 0.7rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
  flex-shrink: 0;
}

.form-actions.with-border {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.btn-save,
.btn-update,
.btn-add {
  background-color: #00723a;
  color: white;
  padding: 0.4375rem 1.25rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-save:hover,
.btn-update:hover,
.btn-add:hover {
  background-color: #005a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 114, 58, 0.2);
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.vehicle-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}

.vehicle-item:hover {
  background: #f0fdf4;
  border-color: #00723a;
}

.vehicle-item.vehicle-default {
  background: #f0fdf4;
  border-color: #00723a;
  box-shadow: 0 0 0 2px rgba(0, 114, 58, 0.1);
}

.vehicle-item.vehicle-editing {
  background: #fffbeb;
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
}

.vehicle-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: #00723a;
  color: white;
  border-radius: 50%;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.vehicle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.vehicle-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.vehicle-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.vehicle-plate {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #00723a;
  letter-spacing: 0.05em;
}

.vehicle-plate-input {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #00723a;
  letter-spacing: 0.05em;
  background: transparent;
  border: none;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
  min-width: 0;
  flex: 0 1 auto;
}

.vehicle-plate-input.editing {
  background: white;
  border: 1px solid #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
}

.vehicle-plate-input:focus {
  outline: none;
  background: white;
  border: 1px solid #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
}

.vehicle-badge-group {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.vehicle-type {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  font-weight: 600;
}

.vehicle-type-personal {
  color: #1d4ed8;
  background: #dbeafe;
  border-color: #93c5fd;
}

.vehicle-type-company {
  color: #b45309;
  background: #fef3c7;
  border-color: #fcd34d;
}

.vehicle-default-badge {
  font-size: 0.7rem;
  color: white;
  background: #00723a;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.vehicle-brand {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.vehicle-brand-input {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  background: white;
  border: 1px solid #d1d5db;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.vehicle-brand-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
}

.vehicle-type-select {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  font-weight: 600;
  cursor: pointer;
  background: white;
}

.vehicle-type-select.vehicle-type-personal {
  color: #1d4ed8;
  background: #dbeafe;
  border-color: #93c5fd;
}

.vehicle-type-select.vehicle-type-company {
  color: #b45309;
  background: #fef3c7;
  border-color: #fcd34d;
}

.vehicle-type-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.1);
}

.btn-remove {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #b91c1c;
  transform: scale(1.1);
}

.btn-edit {
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-edit:hover {
  background: #d97706;
  transform: scale(1.1);
}

.btn-save-vehicle {
  background: #00723a;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-save-vehicle:hover {
  background: #005a2e;
  transform: scale(1.1);
}

.btn-cancel-edit {
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-cancel-edit:hover {
  background: #4b5563;
  transform: scale(1.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  color: #9ca3af;
}

.empty-icon {
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.8125rem;
  margin: 0;
}

.add-vehicle-section {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn-add-vehicle {
  width: 100%;
  background-color: #00723a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-vehicle:hover {
  background-color: #005a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 114, 58, 0.2);
}

.add-vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-actions-row {
  display: flex;
  gap: 0.5rem;
}

.btn-confirm,
.btn-cancel {
  flex: 1;
  padding: 0.4375rem 1rem;
  border-radius: 0.375rem;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-confirm {
  background-color: #00723a;
  color: white;
}

.btn-confirm:hover {
  background-color: #005a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 114, 58, 0.2);
}

.btn-cancel {
  background-color: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background-color: #4b5563;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(107, 114, 128, 0.2);
}

.form-row-compact {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr;
  gap: 0.5rem;
  align-items: center;
}

.btn-add-compact {
  background-color: #00723a;
  color: white;
  padding: 0.4375rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-add-compact:hover {
  background-color: #005a2e;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 114, 58, 0.2);
}

/* Landscape: 3-column layout with fixed height */
@media (orientation: landscape) and (min-width: 769px) {
  .account-main {
    align-items: stretch;
    padding: 0.75rem;
    overflow-y: hidden;
  }

  .account-container {
    height: 100%;
    width: 100%;
    display: flex;
    flex: 1;
    align-self: stretch;
    min-height: 0;
  }

  .account-grid {
    grid-template-columns: repeat(3, 1fr);
    height: 100%;
    width: 100%;
    flex: 1;
    min-height: 0;
    gap: 0.75rem;
  }

  .profile-section,
  .vehicle-section,
  .password-section {
    height: 100%;
    min-height: 0;
  }

  .card-style {
    padding: 0.875rem;
  }

  .section-header {
    margin-bottom: 0.625rem;
    padding-bottom: 0.5rem;
  }

  .section-title {
    font-size: 0.9375rem;
  }

  .form-grid {
    gap: 0.625rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }

  .form-label {
    font-size: 0.75rem;
    margin-bottom: 0.3125rem;
  }

  .form-input {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .form-hint {
    font-size: 0.6875rem;
  }

  .btn-save,
  .btn-update,
  .btn-add {
    font-size: 0.75rem;
    padding: 0.375rem 1rem;
  }

  .vehicle-item {
    padding: 0.5rem 0.625rem;
  }

  .vehicle-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  .vehicle-plate-input {
    font-size: 0.8125rem;
  }

  .vehicle-brand {
    font-size: 0.6875rem;
  }

  .vehicle-type,
  .vehicle-default-badge {
    font-size: 0.6875rem;
    padding: 0.125rem 0.375rem;
  }

  .password-section .form-row {
    grid-template-columns: 1fr;
  }

  .form-row-compact {
    grid-template-columns: 1fr;
  }

  .btn-add-vehicle {
    font-size: 0.75rem;
    padding: 0.4375rem 0.875rem;
  }

  .btn-confirm,
  .btn-cancel {
    font-size: 0.75rem;
    padding: 0.375rem 0.875rem;
  }
}

/* Landscape: smaller screens adjustments */
@media (orientation: landscape) and (min-width: 769px) and (max-width: 1024px) {
  .account-main {
    padding: 0.625rem;
  }

  .account-grid {
    gap: 0.625rem;
  }

  .card-style {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 0.875rem;
  }

  .section-icon {
    width: 18px;
    height: 18px;
  }

  .form-label {
    font-size: 0.7rem;
  }

  .form-input {
    font-size: 0.7rem;
    padding: 0.34375rem 0.46875rem;
  }

  .vehicle-number {
    width: 1.375rem;
    height: 1.375rem;
    font-size: 0.7rem;
  }

  .vehicle-plate-input {
    font-size: 0.75rem;
  }

  .vehicle-brand {
    font-size: 0.625rem;
  }

  .vehicle-type,
  .vehicle-default-badge {
    font-size: 0.625rem;
  }
}

/* Portrait: vertical stacked layout */
@media (orientation: portrait) and (min-width: 769px) {
  .account-main {
    padding: 1rem;
    overflow-y: auto;
  }

  .account-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .card-style {
    padding: 1rem;
  }

  .section-header {
    margin-bottom: 0.75rem;
  }

  .section-title {
    font-size: 1rem;
  }

  .form-grid {
    gap: 0.75rem;
  }

  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
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
  .btn-update,
  .btn-add {
    font-size: 0.8125rem;
    padding: 0.4375rem 1.25rem;
  }

  .vehicle-item {
    padding: 0.625rem 0.75rem;
  }

  .vehicle-number {
    width: 1.625rem;
    height: 1.625rem;
    font-size: 0.8125rem;
  }

  .vehicle-plate-input {
    font-size: 0.9375rem;
  }

  .vehicle-brand {
    font-size: 0.75rem;
  }

  .vehicle-type,
  .vehicle-default-badge {
    font-size: 0.7rem;
  }

  .form-row-compact {
    grid-template-columns: 1.5fr 1.5fr 1fr;
    gap: 0.5rem;
  }

  .btn-add-vehicle {
    font-size: 0.8125rem;
    padding: 0.4375rem 1rem;
  }

  .btn-confirm,
  .btn-cancel {
    font-size: 0.8125rem;
    padding: 0.4375rem 1rem;
  }
}

/* Mobile adjustments */
@media (max-width: 389px), (min-width: 390px) and (max-width: 767px) {
  .account-main {
    padding: 0.5rem;
  }

  .account-grid {
    gap: 0.75rem;
  }

  .card-style {
    padding: 0.75rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.625rem;
  }

  .section-title {
    font-size: 0.875rem;
  }

  .section-header {
    margin-bottom: 0.625rem;
  }

  .form-label {
    font-size: 0.7rem;
  }

  .form-input {
    font-size: 0.7rem;
    padding: 0.375rem 0.5rem;
  }

  .form-hint {
    font-size: 0.65rem;
  }

  .btn-save,
  .btn-update,
  .btn-add {
    width: 100%;
    font-size: 0.75rem;
    padding: 0.4375rem 0.875rem;
  }

  .vehicle-item {
    padding: 0.5rem 0.625rem;
  }

  .vehicle-number {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  .vehicle-plate-input {
    font-size: 0.8125rem;
  }

  .vehicle-brand {
    font-size: 0.6875rem;
  }

  .vehicle-type,
  .vehicle-default-badge {
    font-size: 0.65rem;
  }

  .form-row-compact {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .btn-add-vehicle {
    width: 100%;
    font-size: 0.75rem;
    padding: 0.4375rem 0.875rem;
  }

  .btn-confirm,
  .btn-cancel {
    font-size: 0.75rem;
    padding: 0.4375rem 0.875rem;
  }
}

/* Small mobile adjustments */
@media (min-width: 390px) and (max-width: 767px) {
  .section-title {
    font-size: 0.8125rem;
  }

  .form-grid {
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.6875rem;
  }

  .form-input {
    font-size: 0.6875rem;
    padding: 0.34375rem 0.46875rem;
  }

  .form-hint {
    font-size: 0.625rem;
  }

  .btn-save,
  .btn-update,
  .btn-add {
    font-size: 0.7rem;
    padding: 0.40625rem 0.75rem;
  }

  .vehicle-plate {
    font-size: 0.75rem;
  }

  .vehicle-brand {
    font-size: 0.65rem;
  }
}

/* Extra small mobile adjustments */
@media (max-width: 389px) {
  .card-style {
    padding: 0.625rem;
  }

  .section-title {
    font-size: 0.75rem;
  }

  .section-icon {
    width: 16px;
    height: 16px;
  }

  .form-label {
    font-size: 0.65rem;
  }

  .form-input {
    font-size: 0.65rem;
    padding: 0.3125rem 0.4375rem;
  }

  .form-hint {
    font-size: 0.6rem;
  }

  .vehicle-plate {
    font-size: 0.7rem;
  }

  .vehicle-brand {
    font-size: 0.625rem;
  }

  .vehicle-type,
  .vehicle-default-badge {
    font-size: 0.625rem;
  }
}
</style>
