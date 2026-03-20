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
  padding-top: 60px; /* header预留高度 */
  box-sizing: border-box;
  position: relative;
}

/* 主体容器：高度=视口-精准header高度-底部空白 */
.booking-main {
  height: calc(100vh - 60px - 20px); /* 60px=header高度  20px=底部空白 */
  padding: 0.5vh 2vw 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 内容容器：限制最大宽度，居中 */
.booking-content {
  width: 100%;
  max-width: 90vw;
  margin: 0 auto;
}

/* 标题：自适应字体+紧凑间距 */
.booking-title {
  font-size: clamp(1.5rem, min(4vh, 2.8vw), 2.5rem);
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 3vh; /* 缩小标题与卡片间距 */
  font-weight: bold;
}

/* 卡片容器：响应式布局 */
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.2vh;
}
@media (min-width: 768px) {
  .cards-container {
    flex-direction: row;
    gap: 1.5vw;
    justify-content: center;
  }
}

/* 卡片：自适应尺寸+紧凑内边距 */
.venue-card {
  background: #fff;
  border-radius: clamp(0.8rem, 1.2vh, 1.5rem);
  padding: clamp(1.2rem, 2.5vh, 2rem); /* 紧凑内边距 */
  width: 100%;
  min-width: 280px;    /* 手机端最小宽度 */
  max-width: clamp(300px, 32vw, 500px); /* 大屏最大宽度 */
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: clamp(380px, 65vh, 550px); /* 紧凑高度 */
}

/* 标题容器：固定高度+紧凑间距 */
.venue-card__title-wrapper {
  height: clamp(2rem, 6vh, 3.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: clamp(0.5rem, 1vh, 1rem); /* 标题与图片间距 */
}

/* 卡片标题：自适应字体 */
.venue-card__title {
  font-size: clamp(1rem, min(3vh, 2.2vw), 1.8rem);
  color: #00723a;
  text-align: center;
  margin: 0;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 图片网格：核心！图片上下左右间距完全一致 */
.venue-card__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  /* 关键：行/列间距设为相同值，确保上下左右间距一致 */
  row-gap: clamp(6px, 0.8vh, 10px);    /* 图片上下间距 */
  column-gap: clamp(6px, 0.8vh, 10px); /* 图片左右间距 */
  flex: 1; /* 占满卡片剩余高度 */
  /* 👇 新增：让网格内容垂直居中，而不是拉伸间距 */
  align-content: center;
  margin-bottom: clamp(6px, 0.8vh, 10px); /* 图片与按钮间距（可选同值） */
}

/* 图片容器：修复圆角+消除额外间距 */
.venue-card__image {
  aspect-ratio: 4/3; /* 固定宽高比 */
  border-radius: clamp(0.4rem, 0.8vh, 0.6rem); /* 适配圆角 */
  overflow: hidden;
  position: relative;
  /* 修复圆角渲染bug */
  will-change: transform;
  backface-visibility: hidden;
  /* 消除容器额外间距 */
  padding: 0;
  margin: 0;
}

/* 图片样式：消除默认间隙+适配容器 */
.venue-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block; /* 消除图片底部默认行高间隙 */
  /* 消除图片额外间距 */
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
}

/* 图片悬浮遮罩 */
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

/* 按钮：自适应尺寸+渐变背景 */
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