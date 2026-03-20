<template>
  <div class="booking-page">
    <AppHeader @logout="onLogout" />

    <!-- 主体容器：高度=视口-精准header高度-底部空白 -->
    <main class="booking-main">
      <div class="booking-content">
        <h2 class="booking-title">What venue would you like to book?</h2>

        <div class="cards-container">
          <!-- 会议室卡片 -->
          <section class="venue-card">
            <!-- 关键：给标题容器添加固定高度/弹性占位 -->
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

          <!-- 其他场地卡片 -->
          <section class="venue-card">
            <!-- 关键：给标题容器添加固定高度/弹性占位 -->
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
/* 全局容器：高度100vh，禁止滚动 */
.booking-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #f8ecdd 0%, #f5e6d3 50%, #f8ecdd 100%);
  padding-top: 60px; /* 增大header预留高度（原52px→60px，可按需调） */
  box-sizing: border-box;
  position: relative;
}

/* 主体容器：核心！高度=视口高度 - 精准header高度 - 底部空白 */
.booking-main {
  height: calc(100vh - 60px - 20px); /* 60px=header高度  20px=底部空白 */
  padding: 0.5vh 2vw 0; /* 减小顶部内边距（原1vh→0.5vh） */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 内容容器：限制最大宽度，居中 */
.booking-content {
  width: 100%;
  max-width: 90vw; /* 减小最大宽度（原95vw→90vw） */
  margin: 0 auto;
}

/* 标题：缩小字体+间距 */
.booking-title {
  font-size: min(4vh, 2.8vw); /* 缩小字体（原4vh→3.5vh） */
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 5vh; /* 减小间距（原2vh→1.5vh） */
  font-weight: bold;
}

/* 卡片容器：减小间距 */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.2vh; /* 减小间距（原2vh→1.2vh） */
}
@media (min-width: 768px) {
  .cards-container {
    flex-direction: row;
    gap: 1.5vw; /* 减小间距（原2vw→1.5vw） */
    justify-content: center;
  }
}

/* 卡片：全面缩小占比 */
.venue-card {
  background: #fff;
  border-radius: 1.2vh; /* 减小圆角（原1.5vh→1.2vh） */
  padding: 3vh; /* 减小内边距（原1.5vh→1vh） */
  box-shadow: 0 0.5vh 2vh rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 32vw; /* 减小最大宽度（原45vw→42vw） */
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 关键修改1：标题容器 - 固定高度/统一占位 */
.venue-card__title-wrapper {
  /* 固定高度，适配标题最多2行的情况（可根据实际字体调整） */
  height: 8vh; 
  /* 弹性布局确保标题居中，即使换行也不超出容器 */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2vh;
}

/* 卡片标题：缩小字体+间距 */
.venue-card__title {
  font-size: min(3vh, 2.2vw); /* 缩小字体（原2.2vh→2vh） */
  color: #00723a;
  text-align: center;
  /* 移除原有的margin-bottom，统一由title-wrapper控制 */
  margin: 0;
  font-weight: bold;
  /* 可选：限制标题最多2行，超出省略（防止高度溢出） */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图片网格：减小间距+底部边距 */
.venue-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2vh; /* 减小间距（原1vh→0.8vh） */
  flex: 1; /* 占满卡片剩余高度 */
  margin-bottom: 1.5vh; /* 减小底部边距（原1.5vh→1vh） */
}

/* 图片容器：减小圆角，保持宽高比 */
.venue-card__image {
  aspect-ratio: 4/3; /* 宽高比不变，整体尺寸随容器缩小 */
  border-radius: 1vh; /* 减小圆角（原1vh→0.8vh） */
  overflow: hidden;
  position: relative;
}
.venue-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
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

/* 按钮：减小高度+字体 */
.venue-card__button {
  height: 5.5vh; /* 减小高度（原6vh→5.5vh） */
  background: linear-gradient(135deg, #00723a, #005a2f) !important;
  border: none !important;
  color: #fff !important;
  font-size: min(2.5vh, 1.4vw) !important; /* 减小字体（原2vh→1.8vh） */
  font-weight: bold;
  border-radius: 1vh !important; /* 减小圆角（原1vh→0.8vh） */
}
</style>