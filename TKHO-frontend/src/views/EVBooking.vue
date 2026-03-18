<template>
  <!-- EV Booking 页面，优先使用 CSS 自适应高度 -->
  <div class="booking-page bg-[#f5f5f5] flex flex-col overflow-hidden">
    <!-- 顶部系统 Header -->
    <header class="booking-header w-full bg-[#00723a] text-white flex items-center justify-between px-8 py-3">
      <h1 class="text-lg font-semibold">
        TKHO <span class="font-normal">EV Booking</span>
      </h1>
      <div class="flex items-center gap-2">
        <el-button size="small" class="!bg-white !text-[#00723a] !border-none">
          Manage Booking
        </el-button>
        <el-button size="small" class="!bg-white !text-[#00723a] !border-none">
          Account
        </el-button>
        <el-button size="small" type="danger" class="!px-4">
          Log out
        </el-button>
      </div>
    </header>

    <!-- 进度步骤条（简化版） -->
    <div class="w-full bg-white shadow-sm">
      <div
        class="w-full max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto
               flex justify-center gap-2 py-2
               text-xs md:text-sm lg:text-base font-medium"
      >
        <div class="step-item step-item--done">Log in</div>
        <div class="step-item step-item--active">Booking</div>
        <div class="step-item">Submission</div>
        <div class="step-item">Confirmation</div>
      </div>
    </div>

    <!-- 主体内容 -->
    <main class="flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-4 md:py-6">
      <h2 class="text-xl md:text-2xl lg:text-3xl 2xl:text-4xl font-semibold text-gray-900 mb-6 md:mb-8 text-center">
        What EV would you like to book?
      </h2>

      <div class="flex flex-col md:flex-row gap-6 md:gap-10 2xl:gap-14">
        <!-- 左侧卡片：Pool Cars -->
        <section class="ev-card w-[220px] md:w-[260px] lg:w-[280px] 2xl:w-[320px]">
          <h3 class="ev-card__title">Pool Cars</h3>
          <div class="ev-card__grid">
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=EV+1');"
            ></div>
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=EV+2');"
            ></div>
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=EV+3');"
            ></div>
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=EV+4');"
            ></div>
          </div>
          <el-button type="warning" class="ev-card__button" @click="goToPoolCars">
            Book Now
          </el-button>
        </section>

        <!-- 右侧卡片：Other EV / Chargers -->
        <section class="ev-card w-[220px] md:w-[260px] lg:w-[280px] 2xl:w-[320px]">
          <h3 class="ev-card__title">Other EV / Chargers</h3>
          <div class="ev-card__grid">
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=Charger+1');"
            ></div>
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=Charger+2');"
            ></div>
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=EV+5');"
            ></div>
            <div
              class="ev-card__image bg-cover bg-center"
              style="background-image: url('https://via.placeholder.com/160x100?text=EV+6');"
            ></div>
          </div>
          <el-button type="warning" class="ev-card__button" @click="goToOtherEV">
            Book Now
          </el-button>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToPoolCars = () => {
  // TODO: 跳转到 EV 车辆预定详情页
  console.log('Go to EV pool cars booking')
}

const goToOtherEV = () => {
  // TODO: 跳转到其它 EV / 充电桩预定详情页
  console.log('Go to other EV / chargers booking')
}
</script>

<style scoped>
.booking-page {
  /* 与 VenueBooking 保持一致：最小高度为一屏，高度根据内容自适应 */
  min-height: 100vh;
  height: auto;
}

.step-item {
  @apply px-4 py-1 rounded-sm border border-transparent text-gray-700 bg-gray-100;
}

.step-item--active {
  @apply bg-orange-500 text-white;
}

.step-item--done {
  @apply bg-green-500 text-white;
}

.ev-card {
  @apply bg-[#d6f3c5] rounded-xl px-6 pt-5 pb-6 shadow-sm flex flex-col items-center;
  /* 卡片宽度使用相对单位，保证在不同屏幕下良好显示 */
  width: min(100vw - 2rem, 20rem);
}

.ev-card__title {
  @apply text-center text-base font-semibold text-gray-900 mb-4;
}

.ev-card__grid {
  @apply grid grid-cols-2 gap-2 mb-4;
}

.ev-card__image {
  @apply rounded-md overflow-hidden bg-gray-300;
  width: 100%;
  aspect-ratio: 16 / 10;
}

.ev-card__button {
  @apply w-full mt-1 !bg-orange-500 !border-orange-500 !text-white !font-semibold;
}

@media (max-width: 768px) {
  .booking-header {
    padding-inline: 1rem;
  }

  .booking-header h1 {
    font-size: 1rem;
  }

  .booking-header {
    flex-wrap: wrap;
    row-gap: 0.5rem;
  }

  .booking-header > div {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .ev-card {
    width: min(100vw - 1.5rem, 19rem);
  }

  .ev-card__grid {
    column-gap: 0.5rem;
    row-gap: 0.5rem;
  }
}
</style>

