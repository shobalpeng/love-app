import request from './request'

export function createProduct(data) {
  return request.post('/products', data).then(r => r.data)
}

export function getProductList(search, status, page = 1, pageSize = 10) {
  return request.get('/products', { params: { search, status, page, pageSize } }).then(r => r.data)
}

export function getProductDetail(id) {
  return request.get(`/products/${id}`).then(r => r.data)
}

export function purchaseProduct(id) {
  return request.post(`/products/${id}/purchase`).then(r => r.data)
}

export function verifyProduct(id) {
  return request.post(`/products/${id}/verify`).then(r => r.data)
}

export function confirmProduct(id) {
  return request.post(`/products/${id}/confirm`).then(r => r.data)
}

export function extendProduct(id, new_deadline) {
  return request.post(`/products/${id}/extend`, { new_deadline }).then(r => r.data)
}

export function expireProduct(id) {
  return request.post(`/products/${id}/expire`).then(r => r.data)
}

export function updateProduct(id, data) {
  return request.put(`/products/${id}`, data).then(r => r.data)
}

export function deleteProduct(id) {
  return request.delete(`/products/${id}`)
}
