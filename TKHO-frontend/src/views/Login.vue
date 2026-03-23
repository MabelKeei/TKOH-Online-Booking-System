<template>
  <div class="login-container flex flex-col min-h-screen bg-[#f8ecdd]">
    <header class="login-header w-full">
      <div class="header-content">
        <img src="../assets/TKOH_logo.png" alt="TKOH Logo" class="login-header-logo" />
        <h1 class="login-title">
          <span class="title-main">TKOH</span>
          <span class="title-subtitle">GA Service Center</span>
        </h1>
      </div>
    </header>

    <!-- 系统选择按钮区：在不同屏幕下自适应宽度和间距 -->
    <div class="system-buttons-container w-full max-w-md md:max-w-lg mx-auto mt-6 mb-3 px-4">
      <el-form-item prop="system" class="system-buttons-item">
        <div class="system-buttons">
          <button
            v-for="item in systemOptions"
            :key="item.value"
            type="button"
            :class="['system-button', { active: loginForm.system === item.value }]"
            @click="loginForm.system = item.value"
          >
            <span class="button-icon">
              <font-awesome-icon :icon="['fas', item.icon]" />
            </span>
            <span class="button-label">{{ item.label }}</span>
          </button>
        </div>
      </el-form-item>
      <p class="system-caption">Please select a system</p>
    </div>

    <!-- 登录卡片：自适应宽度，居中显示 -->
    <div class="login-card w-full max-w-md md:max-w-lg mx-auto px-4">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="corpId">
          <el-input
            v-model="loginForm.corpId"
            size="large"
            class="login-input input-with-prefix"
          >
            <template #prefix>
              <span class="input-prefix-text">CORP ID</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            size="large"
            class="login-input input-with-prefix"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <span class="input-prefix-text">Password</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            class="login-button"
            size="large"
          >
            Login
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 底部说明区域：绿色背景全宽，内容区随屏幕宽度自适应 -->
    <section class="login-notes w-full mt-6 py-3 px-0">
      <div class="w-full">
      <h2 class="notes-title">Points to Note:</h2>
      <ol class="notes-list">
        <li>
          1.For reservation of other venues (e.g. Courtyard or Glasshouse), please contact General Office at
          <strong>2208 1951</strong> directly.
        </li>
        <li>
          2.General Office reserves the right to cancel any booking or reassign another venue under necessary
          circumstances.
        </li>
        <li>
          3.Should user require the following service for the meeting, please directly contact the respective
          department in advance for arrangement.
        </li>
      </ol>

      <div class="notes-table">
        <div class="notes-row notes-header-row">
          <div class="notes-cell notes-cell-service">Service/Equipment</div>
          <div class="notes-cell notes-cell-dept">Subject Department</div>
        </div>
        <div class="notes-row">
          <div class="notes-cell notes-cell-service">Zoom/Video Conferencing</div>
          <div class="notes-cell notes-cell-dept">
            Information Technology Dept (Tel: 2208 1830)
          </div>
        </div>
        <div class="notes-row">
          <div class="notes-cell notes-cell-service">Venue Setting / Furniture on-loan</div>
          <div class="notes-cell notes-cell-dept">
            Facility Management Dept (Tel: 2208 1845)
          </div>
        </div>
        <div class="notes-row">
          <div class="notes-cell notes-cell-service">Equipment on-loan</div>
          <div class="notes-cell notes-cell-dept">
            General Office (Tel: 2208 1951)
          </div>
        </div>
        <div class="notes-row">
          <div class="notes-cell notes-cell-service">
            Tea Service for Conference Rooms (ad-hoc)
          </div>
          <div class="notes-cell notes-cell-dept">
            General Office (Tel: 2208 1951)
          </div>
        </div>
        <div class="notes-row">
          <div class="notes-cell notes-cell-service">
            Tea Service for Other Venue and Rooms
          </div>
          <div class="notes-cell notes-cell-dept">
            Via ADS
          </div>
        </div>
      </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { login as loginApi } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)
const loading = ref(false)

// 默认账号密码：corpId=test，password=123456
const loginForm = reactive({
  corpId: 'test',
  password: '123456',
  system: ''
})

const systemOptions = [
  { label: 'Admin Management', value: 'admin', icon: 'user-gear' },
  { label: 'EV Booking', value: 'parking', icon: 'car' },
  { label: 'Venue Booking', value: 'room', icon: 'building' }
]

const loginRules = {
  corpId: [
    { required: true, message: 'Please enter CORP ID', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' }
  ],
  system: [
    { required: true, message: 'Please select a system', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 这里应该调用实际的登录 API
        // const res = await loginApi(loginForm)
        // 暂时固定为本地模拟账号：test / 123456
        if (loginForm.corpId !== 'test' || loginForm.password !== '123456') {
          ElMessage.error('Invalid CORP ID or password (use test / 123456)')
          loading.value = false
          return
        }

        const mockUser = {
          id: 1,
          name: loginForm.corpId,
          role: 'user',
          system: loginForm.system
        }
        const mockToken = 'mock-token-' + Date.now()

        userStore.login(mockUser, mockToken)
        ElMessage.success('Login successful')
        // 根据选择的系统跳转到对应页面
        if (loginForm.system === 'parking') {
          router.push('/evBooking/Calendar')
        } else if (loginForm.system === 'room') {
          router.push('/VenueBooking')
        } else if (loginForm.system === 'admin') {
          router.push('/VenueBooking/ManageBooking')
        } else {
          router.push('/login')
        }
      } catch (error) {
        ElMessage.error(error.message || 'Login failed')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  /* 与各 Booking 页面统一：最小高度为一屏，自适应内容高度 */
  min-height: 100vh;
  background: linear-gradient(135deg, #f8ecdd 0%, #f5e6d3 50%, #f8ecdd 100%);
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(0, 114, 58, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(0, 114, 58, 0.02) 0%, transparent 50%);
  pointer-events: none;
}

.login-header {
  width: 100%;
  padding: 12px 32px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #00723a 0%, #005a2f 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 114, 58, 0.15);
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-header-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.login-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.title-main {
  font-weight: 700;
}

.title-subtitle {
  margin-left: 6px;
  font-weight: 400;
  opacity: 0.95;
}

.system-buttons-container {
  width: min(100vw - 2rem, 480px);
  margin: 2rem auto 1rem;
  position: relative;
  z-index: 1;
}

.system-caption {
  margin: 12px 0 0;
  font-size: 13px;
  color: #666666;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.login-card {
  width: min(100vw - 2rem, 480px);
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 114, 58, 0.08);
  padding: 28px 36px 32px;
  box-sizing: border-box;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 4px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.06);
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.login-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e0e0e0 inset;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #b8b8b8 inset;
  background-color: #ffffff;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #00723a inset;
  background-color: #ffffff;
}

.login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 2px #f56c6c inset;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.input-with-prefix :deep(.el-input__wrapper) {
  padding-left: 1px;
}

.input-with-prefix :deep(.el-input__prefix) {
  padding-left: 0;
  padding-right: 0;
}

.input-prefix-text {
  font-size: 13px;
  color: #666666;
  width: 80px;
  padding: 0 10px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  border-right: 1px solid #d0d0d0;
  margin-right: 8px;
  white-space: nowrap;
  text-align: left;
  border-radius: 7px 0 0 7px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.login-input :deep(.el-input__wrapper.is-focus) .input-prefix-text {
  background: linear-gradient(135deg, #00723a 0%, #005a2f 100%);
  color: #ffffff;
  border-right-color: #00723a;
}

.login-form :deep(.el-form-item.is-error .input-prefix-text) {
  background: linear-gradient(135deg, #fef0f0 0%, #fde8e8 100%);
  color: #f56c6c;
  border-right-color: #f56c6c;
}

.system-buttons-item {
  margin-bottom: 0;
}

.system-buttons-item :deep(.el-form-item__error) {
  text-align: center;
  margin-top: 18px;
  font-weight: 500;
  font-size: 13px;
}

.system-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  flex-wrap: nowrap;
}

.system-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  border: 2px solid #d8d8d8;
  background: linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  outline: none;
  position: relative;
  overflow: hidden;
}

.system-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(0, 114, 58, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.system-button:hover::before {
  width: 100%;
  height: 100%;
}

.system-button:hover {
  border-color: #00723a;
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
  box-shadow: 0 4px 16px rgba(0, 114, 58, 0.15);
  transform: translateY(-3px) scale(1.05);
}

.system-button.active {
  border-color: #00723a;
  background: linear-gradient(135deg, #00723a 0%, #005a2f 100%);
  color: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 114, 58, 0.2), 0 4px 16px rgba(0, 114, 58, 0.3);
  transform: scale(1.08);
}

.system-button.active::before {
  display: none;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 22px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.system-button:hover .button-icon {
  transform: scale(1.1);
}

.button-icon :deep(svg) {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.system-button.active .button-icon :deep(svg) {
  color: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.button-label {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
  color: #4a4a4a;
  padding: 0 10px;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.system-button:hover .button-label {
  color: #00723a;
}

.system-button.active .button-label {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
  border: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  background: linear-gradient(135deg, #3a3a3a 0%, #2c2c2c 100%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

.login-button:active {
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.login-button.is-loading {
  background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
  cursor: not-allowed;
}

.login-notes {
  width: 100%;
  margin-top: auto;
  padding: 1.5rem 1.5rem 2rem;
  background: linear-gradient(135deg, #e8f7ec 0%, #dff3e3 100%);
  border-top: 2px solid #c8e6d0;
  box-sizing: border-box;
  font-size: 13px;
  line-height: 1.6;
  color: #2d4a32;
  text-align: left;
  box-shadow: 0 -2px 12px rgba(0, 114, 58, 0.08);
}

.notes-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  color: #00723a;
  letter-spacing: 0.3px;
}

.notes-list {
  margin: 0 0 16px;
  padding: 0;
  text-align: left;
}

.notes-list li + li {
  margin-top: 6px;
}

.notes-table {
  width: min(100vw - 2rem, 900px);
  border-collapse: collapse;
  margin: 8px 0 0;
  display: block;
  text-align: left;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.notes-row {
  display: flex;
  column-gap: 6px;
}

.notes-cell {
  padding: 6px 10px;
  font-size: 12px;
  text-align: left;
}

.notes-header-row {
  font-weight: 700;
  background: linear-gradient(135deg, #d0e8d6 0%, #c8e6d0 100%);
  color: #00723a;
}

.notes-cell-service {
  flex: 0 0 50%;
}

.notes-cell-dept {
  flex: 0 0 50%;
}

.notes-row:not(.notes-header-row):nth-child(odd) .notes-cell {
  background-color: #f8fcf9;
}

.notes-row:not(.notes-header-row):nth-child(even) .notes-cell {
  background-color: #ffffff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-header {
    padding: 18px 24px;
  }

  .login-header-logo {
    height: 28px;
  }

  .login-title {
    font-size: 18px;
  }

  .title-subtitle {
    font-size: 0.9rem;
  }

  .system-buttons-container {
    margin: 2.5rem auto 1.25rem;
  }

  .login-card {
    padding: 28px 28px 32px;
    border-radius: 12px;
  }

  .button-label {
    font-size: 11px;
  }

  .system-buttons {
    gap: 1.25rem;
  }

  .system-button {
    width: 6.25rem;
    height: 6.25rem;
  }
}

@media (max-width: 480px) {
  .system-button {
    width: 5.5rem;
    height: 5.5rem;
  }

  .button-icon {
    font-size: 18px;
    margin-bottom: 6px;
  }

  .button-icon :deep(svg) {
    width: 20px;
    height: 20px;
  }

  .button-label {
    font-size: 10px;
  }

  .system-buttons {
    gap: 1rem;
  }

  .login-card {
    padding: 24px 20px 28px;
  }

  .notes-table {
    width: min(100vw - 1.5rem, 900px);
  }

  .notes-cell-service {
    flex: 0 0 50%;
  }
}
</style>
