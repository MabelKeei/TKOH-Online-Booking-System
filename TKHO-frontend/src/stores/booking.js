import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBookingStore = defineStore('booking', () => {
  const bookings = ref([])
  const currentBooking = ref(null)

  // 添加预定
  const addBooking = (booking) => {
    bookings.value.push(booking)
  }

  // 更新预定
  const updateBooking = (id, booking) => {
    const index = bookings.value.findIndex(b => b.id === id)
    if (index !== -1) {
      bookings.value[index] = { ...bookings.value[index], ...booking }
    }
  }

  // 删除预定
  const removeBooking = (id) => {
    const index = bookings.value.findIndex(b => b.id === id)
    if (index !== -1) {
      bookings.value.splice(index, 1)
    }
  }

  // 设置当前预定
  const setCurrentBooking = (booking) => {
    currentBooking.value = booking
  }

  return {
    bookings,
    currentBooking,
    addBooking,
    updateBooking,
    removeBooking,
    setCurrentBooking
  }
})
