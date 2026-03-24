<template>
  <div class="booking-page">
    <AppHeader @logout="onLogout" />

    <!-- Main container: viewport minus header and bottom space -->
    <main class="booking-main">
      <div class="booking-content">
        <h2 class="booking-title">What venue would you like to book?</h2>

        <div class="cards-container">
          <!-- Conference room card -->
          <section class="venue-card">
            <!-- Fixed title height to avoid layout shift -->
            <div class="venue-card__title-wrapper">
              <h3 class="venue-card__title">Conference Rooms and Discussion Room</h3>
            </div>
            <div class="venue-card__grid">
              <div class="venue-card__image" v-for="i in 4" :key="i">
                <img :src="venueImage" alt="Conference Room" />
                <div class="venue-card__overlay"></div>
              </div>
            </div>
            <el-button type="primary" class="venue-card__button" @click="goToConference">
              Book Now →
            </el-button>
          </section>

          <!-- Other venue card -->
          <section class="venue-card">
            <!-- Fixed title height to avoid layout shift -->
            <div class="venue-card__title-wrapper">
              <h3 class="venue-card__title">Other Venues</h3>
            </div>
            <div class="venue-card__grid">
              <div class="venue-card__image" v-for="i in 4" :key="i">
                <img :src="venueImage" alt="Other Venue" />
                <div class="venue-card__overlay"></div>
              </div>
            </div>
            <el-button type="primary" class="venue-card__button" @click="goToOtherVenues">
              Book Now →
            </el-button>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import venueImage from '../assets/venue/1.jpg'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()
const onLogout = () => router.push('/login')
const goToConference = () => router.push({ name: 'VenueCalendarView', query: { roomType: 'conference' } })
const goToOtherVenues = () => router.push({ name: 'VenueCalendarView', query: { roomType: 'other' } })
</script>


<style scoped>
/* Page shell */
.booking-page {
  height: var(--zoom-vh);
  overflow: hidden;
  background: linear-gradient(135deg, #f8ecdd 0%, #f5e6d3 50%, #f8ecdd 100%);
  padding-top: 60px; /* Header reserved height */
  box-sizing: border-box;
  position: relative;
}

/* Main area: viewport minus header and bottom space */
.booking-main {
  /* height: calc(100vh - 60px - 20px); 60px header, 20px bottom spacing */
  padding: 14vh 0 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Content container: max width and centered */
.booking-content {
  width: 100%;
  max-width: 90vw;
  margin: 0 auto;
}

/* Title: responsive font and compact spacing */
.booking-title {
  font-size: clamp(1.5rem, min(6vh, 4vw), 2.5rem);
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 6vh; /* Reduce title/card spacing */
  font-weight: bold;
}

/* Cards container: responsive layout */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
}
@media (min-width: 768px) and (max-width: 1099px) {
  .cards-container {
    flex-direction: row;
    gap: 1.5vw;
    justify-content: center;
  }
}

@media (min-width: 1100px) and (max-width: 1599px) {
  .cards-container {
    flex-direction: row;
    gap: 1.5vw;
    justify-content: center;
  }
}

@media (min-width: 1600px) and (max-width: 2239px) {
  .cards-container {
    flex-direction: row;
    gap: 1.5vw;
    justify-content: center;
  }
}

@media (min-width: 2240px) {
  .cards-container {
    flex-direction: row;
    gap: 1.5vw;
    justify-content: center;
  }
}

/* Card: responsive size and compact padding */
.venue-card {
  background: #fff;
  border-radius: clamp(0.8rem, 1.2vh, 1.5rem);
  padding: clamp(1.2rem, 2.5vh, 2rem);
  width: 100%;
  min-width: 300px;
  max-width: clamp(300px, 36vw, 500px);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: clamp(380px, 65vh, 550px);
}

/* Title wrapper */
.venue-card__title-wrapper {
  height: clamp(2rem, 8vh, 3.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: clamp(0.5rem, 1vh, 1rem);
}

/* Card title: responsive text sizing */
.venue-card__title {
  font-size: clamp(1rem, min(4vh, 2.2vw), 1.8rem);
  line-height: 1.1; /* 这里调行间距 */
  color: #00723a;
  text-align: center;
  margin: 0;
  font-weight: bold;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Image grid */
.venue-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  row-gap: clamp(8px, 1vh, 10px);
  column-gap: clamp(8px, 1vh, 10px);
  flex: 1;
  align-content: center;
  margin-bottom: clamp(8px, 1vh, 10px);
}

/* Image block */
.venue-card__image {
  aspect-ratio: 4/3;
  border-radius: clamp(0.4rem, 0.8vh, 0.6rem);
  overflow: hidden;
  position: relative;
  will-change: transform;
  backface-visibility: hidden;
  padding: 0;
  margin: 0;
}

/* Image */
.venue-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
}

/* Hover overlay */
.venue-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,0.3));
  opacity: 0;
  transition: opacity 0.3s;
}
.venue-card__image:hover .venue-card__overlay {
  opacity: 1;
}

/* CTA button */
.venue-card__button {
  height: clamp(2rem, 5vh, 2.8rem);
  background: linear-gradient(135deg, #00723a, #005a2f) !important;
  border: none !important;
  color: #fff !important;
  font-size: clamp(0.9rem, min(2.5vh, 1.4vw), 1.2rem) !important;
  font-weight: bold;
  border-radius: clamp(0.6rem, 1vh, 1rem) !important;
}

</style>
