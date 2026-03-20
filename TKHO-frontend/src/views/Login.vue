<template>
  <div class="login-container flex flex-col min-h-screen bg-[#f8ecdd]">
    <header class="login-header w-full">
      <h1 class="login-title">
        <span class="title-main">TKHO</span>
        <span class="title-subtitle">Resource Booking System</span>
      </h1>
    </header>

    <!-- 系统选择按钮区：在不同屏幕下自适应宽度和间距 -->
    <div class="system-buttons-container w-full max-w-md md:max-w-lg mx-auto mt-10 mb-4 px-4">
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
    <section class="login-notes w-full mt-10 py-4 px-0">
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
          router.push('/evBooking')
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
  background-color: #f8ecdd;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.login-header {
  width: 100%;
  padding: 16px 32px;
  box-sizing: border-box;
  background-color: #00723a; /* 绿色底，参考系统头部 */
  color: #ffffff;
  display: flex;
  align-items: center;
}

.login-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.title-main {
  font-weight: 700;
}

.title-subtitle {
  margin-left: 4px;
  font-weight: 400;
}

.system-buttons-container {
  width: min(100vw - 2rem, 460px);
  margin: 5rem auto 1rem;
}

.system-caption {
  margin: 12px 0 0;
  font-size: 13px;
  color: #555555;
  text-align: center;
}

.login-card {
  width: min(100vw - 2rem, 460px);
  margin: 0 auto;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e4e4e4;
  padding: 28px 32px 32px;
  box-sizing: border-box;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.login-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset; /* 强化整圈红色边框，包括左侧 */
}

.input-with-prefix :deep(.el-input__wrapper) {
  padding-left: 1px; /* 左侧保留一点点空隙，避免完全贴边 */
}

.input-with-prefix :deep(.el-input__prefix) {
  padding-left: 0;
  padding-right: 0;
}

.input-prefix-text {
  font-size: 13px;
  color: #555555;
  width: 70px;
  padding: 0 6px;
  background-color: #e5e5e5; /* 灰色底色 */
  border-right: 1px solid #d4d4d4;
  margin-right: 6px;
  white-space: nowrap;
  text-align: left; /* 左对齐 */
  border-radius: 4px 0 0 4px;
}

.login-form :deep(.el-form-item.is-error .input-prefix-text) {
  background-color: #fef0f0; /* 与校验错误风格一致的浅红底 */
  color: #f56c6c;
  border-right-color: #f56c6c;
}

.system-buttons-item {
  margin-bottom: 0;
}

.system-buttons-item :deep(.el-form-item__error) {
  text-align: center;
  margin-top: 16px;
}

.system-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  width: 100%;
  /* 固定为单行水平排列三个圆形按钮 */
  flex-wrap: nowrap;
}

.system-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 6.5rem;
  height: 6.5rem;
  border-radius: 50%;
  border: 1px solid #d4d4d4;
  background: linear-gradient(#ffffff, #f2f2f2);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease,
    box-shadow 0.25s ease, transform 0.15s ease;
  padding: 0;
  outline: none;
}

.system-button:hover {
  border-color: #999999;
  background: linear-gradient(#ffffff, #ededed);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.system-button.active {
  border-color: #00723a;
  background: #00723a;
  color: #ffffff;
  box-shadow: 0 0 0 3px rgba(0, 114, 58, 0.25);
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  font-size: 20px;
}

.button-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.system-button.active .button-icon :deep(svg) {
  color: #ffffff;
}

.button-label {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  line-height: 1.3;
  color: #4a4a4a;
  padding: 0 8px;
}

.system-button.active .button-label {
  color: #ffffff;
}

.login-button {
  width: 100%;
  background-color: #333333; /* 黑色风格按钮 */
  border-color: #333333;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  border-radius: 4px;
  height: 44px;
  transition: all 0.3s;
}

.login-button:hover {
  background-color: #444444;
  border-color: #444444;
}

.login-button:active {
  background-color: #222222;
  border-color: #222222;
}

.login-button.is-loading {
  background-color: #4a4a4a;
  border-color: #4a4a4a;
}

.login-notes {
  width: 100%;
  margin-top: auto;
  padding: 1rem 1rem 1.25rem;
  background-color: #e8f7ec;
  border: 1px solid #d0e8d6;
  box-sizing: border-box;
  font-size: 13px;
  line-height: 1.5;
  color: #2d4a32;
  text-align: left; /* 整体内容靠左 */
}

.notes-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  text-align: left; /* 标题靠左显示 */
}

.notes-list {
  margin: 0 0 12px;
  padding: 0;
  text-align: left;        /* 文本内部保持左对齐，提升可读性 */
}

.notes-list li + li {
  margin-top: 4px;
}

.notes-table {
  width: min(100vw - 2rem, 900px);
  border-collapse: collapse;
  margin: 6px 0 0;
  display: block;
  text-align: left;       /* 表格文字左对齐 */
}

.notes-row {
  display: flex;
  column-gap: 4px; /* 减小两列之间的间距，让内容更靠近一些 */
}

.notes-cell {
  padding: 4px 8px;
  font-size: 12px;
  text-align: left;
}

.notes-header-row {
  font-weight: 600;
  border-bottom: 1px solid #c2ddc9;
}

.notes-cell-service {
  flex: 0 0 30%;
}

.notes-cell-dept {
  flex: 1;       /* 右列占剩余空间，起始位置更靠左 */
}

.notes-row:not(.notes-header-row):nth-child(odd) .notes-cell {
  background-color: #f4fbf6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-header {
    padding-top: 2.5rem;
    margin-bottom: 2rem;
  }

  .title-main {
    font-size: 1.6rem;
    letter-spacing: 1px;
  }

  .title-subtitle {
    font-size: 0.9rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .button-label {
    font-size: 11px;
  }

  .system-buttons {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .system-button {
    width: 5.75rem;
    height: 5.75rem;
  }

  .button-label {
    font-size: 0.65rem;
  }

  .notes-table {
    width: min(100vw - 1.5rem, 900px);
  }

  .notes-cell-service {
    flex: 0 0 40%;
  }
}
</style>
