<template>
  <!-- 通过 h-screen + 弹性布局，让整个页面在大部分屏幕高度内不需要纵向滚动 -->
  <div class="booking-page h-screen bg-[#f5f5f5] flex flex-col overflow-hidden">
    <AppHeader @logout="onLogout" />

    <!-- 进度步骤条（复用 BookingSteps 组件） -->
    <BookingSteps
      :steps="['Log in', 'Booking', 'Submission', 'Confirmation']"
      :current="1"
    />

    <!-- 主体内容 -->
    <main class="booking-main flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <h2 class="booking-title text-center font-semibold text-gray-900">
        What venue would you like to book?
      </h2>


      <div class="flex flex-col md:flex-row gap-6 md:gap-10 2xl:gap-14">
        <!-- 左侧卡片：Conference Rooms -->
        <section
          class="venue-card
                 w-[100vw] md:w-[52vw] lg:w-[48vw] 2xl:w-[62vw]
                 max-w-[1020px] 2xl:max-w-[1280px]"
        >
          <h3 class="venue-card__title">Conference Rooms and Discussion Room</h3>
          <div class="venue-card__grid">
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
          </div>
          <el-button type="warning" class="venue-card__button" @click="goToConference">
            Book Now
          </el-button>
        </section>

        <!-- 右侧卡片：Other Venues -->
        <section
          class="venue-card
                 w-[80vw] md:w-[42vw] lg:w-[34vw] 2xl:w-[42vw]
                 max-w-[420px] 2xl:max-w-[680px]"
        >
          <h3 class="venue-card__title">Other Venues</h3>
          <div class="venue-card__grid">
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
            <div class="venue-card__image">
              <img :src="venueImage" alt="Venue" />
            </div>
          </div>
          <el-button type="warning" class="venue-card__button" @click="goToOtherVenues">
            Book Now
          </el-button>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import venueImage from '../assets/venue/1.jpg'
import BookingSteps from '../components/BookingSteps.vue'
import AppHeader from '../components/AppHeader.vue'

const router = useRouter()

const onLogout = () => {
  router.push('/login')
}

const goToConference = () => {
  router.push({
    name: 'CalendarView',
    query: { roomType: 'conference' }
  })
}

const goToOtherVenues = () => {
  router.push({
    name: 'CalendarView',
    query: { roomType: 'other' }
  })
}
</script>

<style scoped>
.booking-page {
  /* 使用最小高度 + 自动高度，避免小屏幕被强行撑成一屏导致内容溢出 */
  min-height: 100vh;
  height: auto;
}

.booking-steps-wrapper {
  /* 步骤条容器高度使用 clamp，自适应不同屏幕，并让内部内容上下居中 */
  height: clamp(58px, 8vh, 100px);
  display: flex;
  align-items: center;
  /* 轻微上下内边距，避免贴边 */
  padding-block: clamp(2px, 0.8vh, 8px);
}

.booking-main {
  /* 主体上下留白随屏幕自适应 */
  padding-top: clamp(16px, 4vh, 60px);
  padding-bottom: clamp(16px, 4vh, 60px);
}

.booking-title {
  /* 标题字号与间距随屏幕宽高等比缩放 */
  font-size: clamp(16px, 2vw, 36px);
  margin-bottom: clamp(16px, 4vh, 32px);
}

.venue-card {
  background-color: #d6f3c5;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  /* 三行网格：标题 / 图片区域 / 按钮，保证左右卡片图片和按钮对齐 */
  display: grid;
  grid-template-rows: auto 1fr auto;
  align-items: stretch;
  /* 宽度使用相对单位，整体随屏幕缩放，带上限和下限 */
  width: clamp(240px, 24vw, 480px);
}

.venue-card__title {
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  /* 标题区域统一高度，左右卡片标题行数不同也能对齐图片和按钮 */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.2rem;
  margin: 0;
}

.venue-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 0.75rem;
  row-gap: 0.75rem;
  /* 与标题和按钮拉开固定间距，保证两张卡片视觉高度一致 */
  margin: 16px 0 20px;
}

.venue-card__image {
  /* 容器本身提供固定比例区域 */
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 6px;
  overflow: hidden;
}

.venue-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-card__button {
  width: 100%;
  margin-top: 0.25rem;
  background-color: #f97316 !important;
  border-color: #f97316 !important;
  color: #fff !important;
  font-weight: 600 !important;
}

@media (max-width: 640px) {
  /* 极小屏时，卡片之间和图片网格间距略微缩小，避免左右挤压 */
  .venue-card {
    width: min(100vw - 1.5rem, 21rem);
  }

  .venue-card__grid {
    column-gap: 0.5rem;
    row-gap: 0.5rem;
  }
}
</style>

