<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">System Settings</h2>
      <div class="header-actions">
        <el-button
          type="default"
          class="submit-btn"
          :loading="saving"
          :disabled="loading"
          @click="handleSave"
        >
          <font-awesome-icon :icon="['fas', 'floppy-disk']" class="btn-icon" />
          Save Settings
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="page-content">

      <div class="settings-grid">
        <section class="setting-card">
          <div class="setting-card-header">
            <div class="setting-card-title-row">
              <div class="setting-icon setting-icon--user">
                <font-awesome-icon :icon="['fas', 'user-clock']" />
              </div>
              <div class="setting-card-titles">
                <h3 class="setting-title">User Inactivity</h3>
                <p class="setting-subtitle">Automatic status change policy</p>
              </div>
            </div>
            <span class="value-pill value-pill--green">
              <span class="value-pill-label">Current</span>
              <span class="value-pill-text">{{ form.userInactiveAfterMonths }} month{{ form.userInactiveAfterMonths === 1 ? '' : 's' }}</span>
            </span>
          </div>

          <div class="setting-card-body">
            <label class="field-label" for="inactive-months">Inactive after (months)</label>
            <el-input-number
              id="inactive-months"
              v-model="form.userInactiveAfterMonths"
              :min="1"
              :max="120"
              :step="1"
              controls-position="right"
              class="field-control"
            />
            <p class="field-hint">
              Active users with no login (or account created) for this many months are automatically set to Inactive.
              The Admin account is excluded.
            </p>
          </div>
        </section>

        <section class="setting-card">
          <div class="setting-card-header">
            <div class="setting-card-title-row">
              <div class="setting-icon setting-icon--calendar">
                <font-awesome-icon :icon="['fas', 'calendar-days']" />
              </div>
              <div class="setting-card-titles">
                <h3 class="setting-title">Hong Kong Public Holidays</h3>
                <p class="setting-subtitle">External reference link</p>
              </div>
            </div>
            <span class="header-action-spacer value-pill value-pill--green" aria-hidden="true">
              <span class="value-pill-label">Current</span>
              <span class="value-pill-text">{{ form.userInactiveAfterMonths }} month{{ form.userInactiveAfterMonths === 1 ? '' : 's' }}</span>
            </span>
          </div>

          <div class="setting-card-body">
            <label class="field-label" for="hk-holidays-url">Public holidays URL</label>
            <el-input
              id="hk-holidays-url"
              v-model.trim="form.hkPublicHolidaysUrl"
              placeholder="https://www.1823.gov.hk/common/ical/en.json"
              clearable
              class="field-control field-control--full"
            />
            <p class="field-hint">
              Reference link for Hong Kong public holidays.
            </p>
            <a
              v-if="form.hkPublicHolidaysUrl"
              :href="form.hkPublicHolidaysUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="url-preview"
            >
              <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="url-preview-icon" />
              Open link in new tab
            </a>
          </div>
        </section>

        <section class="setting-card">
          <div class="setting-card-header">
            <div class="setting-card-title-row">
              <div class="setting-icon setting-icon--ev">
                <font-awesome-icon :icon="['fas', 'car']" />
              </div>
              <div class="setting-card-titles">
                <h3 class="setting-title">EV Booking Calendar</h3>
                <p class="setting-subtitle">Daily date roll-forward time</p>
              </div>
            </div>
            <span class="value-pill value-pill--green">
              <span class="value-pill-label">Current</span>
              <span class="value-pill-text">{{ form.evDateUpdateTime }}</span>
            </span>
          </div>

          <div class="setting-card-body">
            <label class="field-label" for="ev-date-update-time">EV date update time (HH:mm)</label>
            <el-input
              id="ev-date-update-time"
              v-model.trim="form.evDateUpdateTime"
              placeholder="13:00"
              maxlength="5"
              class="field-control field-control--time"
            />
            <p class="field-hint">
              Hong Kong time when the EV calendar releases the next day quota.
              Before this time, users see the next 14 days starting tomorrow; after this time, the window rolls forward by one day.
            </p>

            <label class="field-label field-label--spaced" for="ev-weekly-booking-limit">Weekly booking limit per user</label>
            <el-input-number
              id="ev-weekly-booking-limit"
              v-model="form.evWeeklyBookingLimit"
              :min="1"
              :max="7"
              :step="1"
              controls-position="right"
              class="field-control"
            />
            <p class="field-hint">
              Maximum active EV bookings per non-admin user per week (Monday to Sunday).
              Cancelled bookings do not count. Administrators booking on behalf of others are not limited by this rule.
            </p>
          </div>
        </section>

        <section class="setting-card">
          <div class="setting-card-header">
            <div class="setting-card-title-row">
              <div class="setting-icon setting-icon--venue">
                <font-awesome-icon :icon="['fas', 'door-open']" />
              </div>
              <div class="setting-card-titles">
                <h3 class="setting-title">Venue Booking Gap</h3>
                <p class="setting-subtitle">Minimum turnaround between bookings</p>
              </div>
            </div>
            <span class="value-pill value-pill--green">
              <span class="value-pill-label">Current</span>
              <span class="value-pill-text">{{ form.venueBookingMinGapMinutes }} min</span>
            </span>
          </div>

          <div class="setting-card-body">
            <label class="field-label" for="venue-booking-min-gap">Minimum gap (minutes)</label>
            <el-input-number
              id="venue-booking-min-gap"
              v-model="form.venueBookingMinGapMinutes"
              :min="0"
              :max="120"
              :step="5"
              controls-position="right"
              class="field-control"
            />
            <p class="field-hint">
              Required buffer between consecutive bookings of the same venue (e.g. for cleaning).
              Example: with 15 minutes, after 09:00–11:00 the next booking can start from 11:15.
              Set to 0 to allow back-to-back bookings.
            </p>
          </div>
        </section>
      </div>

      <footer v-if="updatedAt" class="settings-footer">
        <span class="footer-meta">
          <font-awesome-icon :icon="['fas', 'clock']" class="footer-meta-icon" />
          Last updated {{ formatUpdatedAt(updatedAt) }}
        </span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemSettings, saveSystemSettings } from '@/api/systemSettings'
import { APP_TIMEZONE } from '@/utils/appTimezone'

const loading = ref(false)
const saving = ref(false)
const updatedAt = ref(null)

const form = reactive({
  userInactiveAfterMonths: 6,
  hkPublicHolidaysUrl: '',
  evDateUpdateTime: '13:00',
  evWeeklyBookingLimit: 1,
  venueBookingMinGapMinutes: 15
})

function formatUpdatedAt (value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', {
    timeZone: APP_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function applySettings (data) {
  form.userInactiveAfterMonths = Number(data?.userInactiveAfterMonths) || 6
  form.hkPublicHolidaysUrl = String(data?.hkPublicHolidaysUrl ?? '')
  form.evDateUpdateTime = String(data?.evDateUpdateTime ?? '13:00')
  form.evWeeklyBookingLimit = Number(data?.evWeeklyBookingLimit) || 1
  form.venueBookingMinGapMinutes =
    data?.venueBookingMinGapMinutes == null
      ? 15
      : Number(data.venueBookingMinGapMinutes)
  updatedAt.value = data?.updatedAt ?? null
}

async function loadSettings () {
  loading.value = true
  try {
    const data = await getSystemSettings()
    applySettings(data)
  } catch (err) {
    ElMessage.error(err?.response?.data?.message || err?.message || 'Failed to load system settings')
  } finally {
    loading.value = false
  }
}

async function handleSave () {
  if (!form.hkPublicHolidaysUrl) {
    ElMessage.warning('Hong Kong public holidays URL is required')
    return
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.evDateUpdateTime)) {
    ElMessage.warning('EV date update time must be HH:mm in 24-hour format')
    return
  }

  if (!Number.isInteger(form.evWeeklyBookingLimit) || form.evWeeklyBookingLimit < 1 || form.evWeeklyBookingLimit > 7) {
    ElMessage.warning('Weekly EV booking limit must be between 1 and 7')
    return
  }
  if (
    !Number.isInteger(form.venueBookingMinGapMinutes) ||
    form.venueBookingMinGapMinutes < 0 ||
    form.venueBookingMinGapMinutes > 120
  ) {
    ElMessage.warning('Venue booking minimum gap must be an integer between 0 and 120')
    return
  }

  saving.value = true
  try {
    const data = await saveSystemSettings({
      userInactiveAfterMonths: form.userInactiveAfterMonths,
      hkPublicHolidaysUrl: form.hkPublicHolidaysUrl,
      evDateUpdateTime: form.evDateUpdateTime,
      evWeeklyBookingLimit: form.evWeeklyBookingLimit,
      venueBookingMinGapMinutes: form.venueBookingMinGapMinutes
    })
    applySettings(data)
    ElMessage.success('System settings saved')
  } catch (err) {
    const msg = err?.response?.data?.message
    if (Array.isArray(msg)) {
      ElMessage.error(msg.join('; '))
    } else {
      ElMessage.error(msg || err?.message || 'Failed to save system settings')
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSettings()
})
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
  margin: 0.45rem 0.6rem 0.25rem;
  min-height: 3.625rem;
  box-sizing: border-box;
}

.page-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon {
  margin-right: 0.375rem;
}

.page-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0.25rem 0.6rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.page-intro {
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: #6b7280;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  align-items: stretch;
}

.setting-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.setting-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  background: linear-gradient(180deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
  min-height: 4.25rem;
  box-sizing: border-box;
}

.setting-card-title-row {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  min-width: 0;
}

.setting-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.95rem;
}

.setting-icon--user {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border: 1px solid #86efac;
}

.setting-icon--calendar {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.setting-icon--ev {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #b45309;
  border: 1px solid #fcd34d;
}

.setting-icon--venue {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
  border: 1px solid #a5b4fc;
}

.setting-card-titles {
  min-width: 0;
}

.setting-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.3;
}

.setting-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.35;
}

.value-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.value-pill--green {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #86efac;
}

.value-pill-label {
  background: #166534;
  color: #ffffff;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.value-pill-text {
  color: #14532d;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
}

.header-action-spacer {
  visibility: hidden;
  pointer-events: none;
}

.setting-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.85rem;
}

.field-label {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #374151;
}

.field-label--spaced {
  margin-top: 1rem;
}

.field-control {
  width: 180px;
}

.field-control--full {
  width: 100%;
}

.field-control--time {
  width: 120px;
}

.field-hint {
  margin: 0.55rem 0 0;
  font-size: 0.75rem;
  line-height: 1.55;
  color: #6b7280;
  flex: 1;
}

.url-preview {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.55rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #2563eb;
  text-decoration: none;
  transition: color 0.2s ease;
}

.url-preview:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.url-preview-icon {
  font-size: 0.75rem;
}

.settings-footer {
  margin-top: auto;
  padding: 0.55rem 0.85rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.footer-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.footer-meta-icon {
  color: #9ca3af;
  font-size: 0.75rem;
}

.setting-card-body :deep(.el-input-number) {
  width: 180px;
}

.setting-card-body :deep(.el-input__wrapper) {
  border-radius: 0.375rem;
  box-shadow: 0 0 0 1px #d1d5db inset;
}

.setting-card-body :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #9ca3af inset;
}

.setting-card-body :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #00723a inset;
}

@media (max-width: 1100px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions :deep(.el-button) {
    width: 100%;
  }

  .setting-card-header {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
  }

  .header-action-spacer,
  .value-pill {
    align-self: flex-start;
  }

  .field-control,
  .setting-card-body :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
