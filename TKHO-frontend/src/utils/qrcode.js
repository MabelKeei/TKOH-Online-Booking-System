import QRCode from 'qrcode'

/**
 * 生成二维码
 * @param {string} text - 要编码的文本
 * @param {object} options - 二维码选项
 * @returns {Promise<string>} - 返回 base64 图片数据
 */
export const generateQRCode = async (text, options = {}) => {
  const defaultOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    const dataUrl = await QRCode.toDataURL(text, defaultOptions)
    return dataUrl
  } catch (error) {
    console.error('生成二维码失败:', error)
    throw error
  }
}

/**
 * 生成二维码并返回 canvas
 * @param {string} text - 要编码的文本
 * @param {HTMLCanvasElement} canvas - canvas 元素
 * @param {object} options - 二维码选项
 */
export const generateQRCodeToCanvas = async (canvas, text, options = {}) => {
  const defaultOptions = {
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    ...options
  }

  try {
    await QRCode.toCanvas(canvas, text, defaultOptions)
  } catch (error) {
    console.error('生成二维码失败:', error)
    throw error
  }
}
