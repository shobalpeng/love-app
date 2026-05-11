import request from './request'

export function getNotificationList(page = 1, pageSize = 10) {
  return request.get('/notifications', { params: { page, pageSize } }).then(r => r.data)
}

export function getUnreadCount() {
  return request.get('/notifications/unread-count').then(r => r.data)
}

export function markRead(id) {
  return request.post(`/notifications/${id}/read`).then(r => r.data)
}

export function markAllRead() {
  return request.post('/notifications/read-all').then(r => r.data)
}
