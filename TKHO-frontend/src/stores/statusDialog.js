import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 与 Login 页 Reminder 弹层一致，供任意模块（如 axios 拦截器）调用 */
export const useStatusDialogStore = defineStore('statusDialog', () => {
  const visible = ref(false)
  const message = ref('')
  const type = ref('warning')

  const show = (msg, msgType = 'warning') => {
    message.value = msg
    type.value = msgType
    visible.value = true
  }

  const hide = () => {
    visible.value = false
  }

  return { visible, message, type, show, hide }
})
