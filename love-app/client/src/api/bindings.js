import request from './request'

export function sendRequest(to_username) {
  return request.post('/bindings/request', { to_username }).then(r => r.data)
}

export function getRequests() {
  return request.get('/bindings/requests').then(r => r.data)
}

export function acceptRequest(id) {
  return request.post(`/bindings/requests/${id}/accept`).then(r => r.data)
}

export function rejectRequest(id) {
  return request.post(`/bindings/requests/${id}/reject`).then(r => r.data)
}

export function unbind() {
  return request.delete('/bindings').then(r => r.data)
}

export function getStatus() {
  return request.get('/bindings/status').then(r => r.data)
}
