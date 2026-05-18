import request from './request'

export function getDisplayConfig () {
  return request.get('/display-management/config')
}

export function saveDisplayConfig (payload) {
  return request.put('/display-management/config', payload)
}

export function uploadMergeQrImage (file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/display-management/merge-qr-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function clearMergeQrImage () {
  return request.delete('/display-management/merge-qr-image')
}
