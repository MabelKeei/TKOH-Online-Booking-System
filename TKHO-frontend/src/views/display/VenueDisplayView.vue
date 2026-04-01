<template>
  <div class="display-container">
    <!-- Header -->
    <div class="display-header">
      <div class="date-time">
        <span class="date">{{ currentDate }}</span>
        <span class="time">{{ currentTime }}</span>
      </div>
      <img v-if="displayType === 'merge' && qrCodeImage" :src="qrCodeImage" alt="QR Code" class="header-qr" />
    </div>

    <!-- Main content -->
    <div class="display-content">
      <div v-if="hasEvents" class="events-list">
        <div v-for="event in todayEvents" :key="event.id" class="event-card">
          <div class="event-time">{{ event.startTime }} - {{ event.endTime }}</div>
          <div class="event-topic">{{ event.topic }}</div>
          <div v-if="event.reservedBy" class="event-organizer">{{ event.reservedBy }}</div>
        </div>
      </div>
      <div v-else class="no-events">
        <div class="no-events-text-en">NO EVENTS</div>
        <div class="no-events-text-zh">沒有活動</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="display-footer">
      <div class="venue-info-row">
        <span v-if="venueName" class="venue-name">{{ venueName }}</span>
        <span v-if="venueName && venueLocation" class="separator">|</span>
        <span v-if="venueLocation" class="venue-location">{{ venueLocation }}</span>
      </div>
      <div v-if="venueNameZh || venueLocationZh" class="venue-info-row">
        <span v-if="venueNameZh" class="venue-name-zh">{{ venueNameZh }}</span>
        <span v-if="venueNameZh && venueLocationZh" class="separator">|</span>
        <span v-if="venueLocationZh" class="venue-location-zh">{{ venueLocationZh }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMockVenueList, getMockDisplayConfig } from '@/mocks/mockData'

const route = useRoute()
const DISPLAY_SCALE = 1.8

// Get venue info from query params
const venueId = ref(route.query.venueId)
const displayType = ref(route.query.displayType || 'single')

// Current date and time
const currentDate = ref('')
const currentTime = ref('')
const currentDay = ref('')

// Venue info
const venueName = ref('')
const venueNameZh = ref('')
const venueLocation = ref('')
const venueLocationZh = ref('')
const qrCodeImage = ref('')

// Events data
const todayEvents = ref([])

// Computed
const hasEvents = computed(() => todayEvents.value.length > 0)

// Update date and time
function updateDateTime() {
  const now = new Date()

  // Format date: 16/03/2026 Monday 星期一
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const weekdayEn = now.toLocaleDateString('en-US', { weekday: 'long' })
  const weekdayZh = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]

  currentDate.value = `${day}/${month}/${year} ${weekdayEn} ${weekdayZh}`
  currentDay.value = weekdayEn

  // Format time: 16:45
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// Load venue data
function loadVenueData() {
  const venueList = getMockVenueList()
  const displayConfig = getMockDisplayConfig()

  if (displayType.value === 'single' && venueId.value) {
    // Single venue display
    qrCodeImage.value = ''
    const venue = venueList.find(v => v.id === parseInt(venueId.value))
    if (venue) {
      venueName.value = venue.name
      venueNameZh.value = venue.nameZh || ''
      venueLocation.value = venue.location || ''
      venueLocationZh.value = venue.locationZh || ''
    }
  } else if (displayType.value === 'merge') {
    // Merged venues display
    const mergedVenues = venueList.filter(v => v.displayType === 'merge')
    if (mergedVenues.length > 0) {
      venueName.value = mergedVenues.map(v => v.name).join(' | ')
      venueNameZh.value = mergedVenues.map(v => v.nameZh).filter(Boolean).join(' | ')
      venueLocation.value = mergedVenues.map(v => v.location).filter(Boolean).join(' | ')
      venueLocationZh.value = mergedVenues.map(v => v.locationZh).filter(Boolean).join(' | ')
    }
    const footerLine1 = displayConfig.mergeDisplaySettings?.footerLine1 || ''
    const footerLine2 = displayConfig.mergeDisplaySettings?.footerLine2 || ''
    if (footerLine1) venueName.value = footerLine1
    if (footerLine2) venueNameZh.value = footerLine2
    qrCodeImage.value = displayConfig.mergeDisplaySettings?.qrCodeImage || ''
  }
}

// Load today's events (mock data for now)
function loadTodayEvents() {
  // TODO: Fetch real booking data from API
  // For now, using empty array - will show "NO EVENTS"
  todayEvents.value = []

  // Example with events:
  // todayEvents.value = [
  //   {
  //     id: 1,
  //     startTime: '09:00',
  //     endTime: '11:00',
  //     topic: 'Team Meeting',
  //     reservedBy: 'John Smith'
  //   }
  // ]
}

let timeInterval = null

// Force fullscreen layout
function forceFullscreen() {
  const container = document.querySelector('.display-container')
  if (container) {
    container.style.setProperty('--display-scale', String(DISPLAY_SCALE))
    // Force dimensions
    const scaledSize = `${100 / DISPLAY_SCALE}%`
    const scaledViewport = `${100 / DISPLAY_SCALE}vw`
    const scaledViewportHeight = `${100 / DISPLAY_SCALE}vh`
    container.style.width = scaledSize
    container.style.height = scaledSize
    container.style.minWidth = scaledViewport
    container.style.minHeight = scaledViewportHeight
  }

  // Force body and html
  document.documentElement.style.width = '100%'
  document.documentElement.style.height = '100%'
  document.documentElement.style.margin = '0'
  document.documentElement.style.padding = '0'
  document.documentElement.style.overflow = 'hidden'

  document.body.style.width = '100%'
  document.body.style.height = '100%'
  document.body.style.margin = '0'
  document.body.style.padding = '0'
  document.body.style.overflow = 'hidden'
}

onMounted(() => {
  updateDateTime()
  loadVenueData()
  loadTodayEvents()

  // Update time every minute
  timeInterval = setInterval(updateDateTime, 60000)

  // Force fullscreen
  forceFullscreen()

  // Re-apply on resize to handle zoom changes
  window.addEventListener('resize', forceFullscreen)

  // Prevent zoom on mobile
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }

  // Remove resize listener
  window.removeEventListener('resize', forceFullscreen)

  // Restore styles
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  document.body.style.width = ''
  document.body.style.height = ''
  document.documentElement.style.width = ''
  document.documentElement.style.height = ''
})
</script>

<style scoped>
/* Force body and html to be full screen */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.display-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 50%;
  height: 50%;
  min-width: 50vw;
  min-height: 50vh;
  /* 稍微降低饱和度/亮度的橙色背景，接近原色但不荧光 */
  background: linear-gradient(180deg, #f7b75a 0%, #f29b3a 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transform: scale(var(--display-scale, 2));
  transform-origin: top left;
  /* Prevent text selection */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  /* Prevent touch actions that might cause zoom */
  touch-action: none;
  -webkit-touch-callout: none;
  /* Keep plain scale to avoid text ghosting at non-integer ratios */
  -webkit-transform: scale(var(--display-scale, 2));
}

/* Prevent zoom on double tap */
* {
  touch-action: manipulation;
}

.display-header {
  padding: 1rem 1.25rem;
  background: rgba(196, 133, 55, 0.22);
  border-bottom: 2px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.date-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #111111;
  flex: 1;
  min-width: 0;
}

.header-qr {
  width: 72px;
  height: 72px;
  margin-left: 0.75rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.18);
  object-fit: cover;
  flex-shrink: 0;
}

.date {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.time {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.display-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  overflow-y: auto;
  min-height: 0;
}

.events-list {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  background: rgba(255, 255, 255, 0.88);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.event-time {
  font-size: 1.25rem;
  font-weight: 700;
  color: #FF9800;
  margin-bottom: 0.5rem;
}

.event-topic {
  font-size: 1.75rem;
  font-weight: 600;
  color: #212121;
  margin-bottom: 0.5rem;
}

.event-organizer {
  font-size: 1.125rem;
  color: #616161;
  font-weight: 500;
}

.no-events {
  text-align: center;
  color: #111111;
}

.no-events-text-en {
  font-size: 4rem;
  font-weight: 700;
  line-height: 0.8;
  letter-spacing: 2px;
  margin-bottom: 1rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.no-events-text-zh {
  font-size: 3rem;
  font-weight: 600;
  line-height: 0.8;
  letter-spacing: 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.display-footer {
  padding: 0.9rem 1rem;
  /* 比当前再浅一些、接近原始蓝但不荧光 */
  background: rgba(90, 170, 220, 0.9);
  border-top: 2px solid rgba(0, 0, 0, 0.15);
  text-align: left;
  flex-shrink: 0;
}

.venue-info-row {
  display: flex;
  align-items: center;
  color: #111111;
  margin-bottom: 0.25rem;
}

.venue-info-row:last-child {
  margin-bottom: 0;
}

.venue-name,
.venue-location {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.venue-name-zh,
.venue-location-zh {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.separator {
  margin: 0 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.venue-info-row:last-child .separator {
  font-size: 1.1rem;
}

/* Scrollbar styling */
.display-content::-webkit-scrollbar {
  width: 8px;
}

.display-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}

.display-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.22);
  border-radius: 4px;
}

.display-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.32);
}

/* Responsive adjustments for different screen sizes */
@media (max-width: 768px) {
  .date {
    font-size: 1.125rem;
  }

  .time {
    font-size: 1.5rem;
  }

  .header-qr {
    width: 48px;
    height: 48px;
  }

  .no-events-text-en {
    font-size: 2.5rem;
  }

  .no-events-text-zh {
    font-size: 2rem;
  }

  .venue-name,
  .venue-location {
    font-size: 1.25rem;
  }

  .venue-name-zh,
  .venue-location-zh {
    font-size: 1.125rem;
  }

  .separator {
    font-size: 1.25rem;
    margin: 0 0.5rem;
  }

  .venue-info-row:last-child .separator {
    font-size: 1.125rem;
  }
}

/* Ensure content fits on very small screens */
@media (max-height: 600px) {
  .display-header {
    padding: 0.75rem 1rem;
  }

  .display-footer {
    padding: 0.7rem 0.8rem;
  }

  .display-content {
    padding: 1rem 0.75rem;
  }
}
</style>
