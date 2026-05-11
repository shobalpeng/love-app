import request from './request'

export function createTask(data) {
  return request.post('/tasks', data).then(r => r.data)
}

export function getTaskList(filter, search, status, page = 1, pageSize = 10) {
  return request.get('/tasks', { params: { filter, search, status, page, pageSize } }).then(r => r.data)
}

export function getTaskDetail(id) {
  return request.get(`/tasks/${id}`).then(r => r.data)
}

export function submitTask(id, data) {
  return request.post(`/tasks/${id}/submit`, data).then(r => r.data)
}

export function reviewTask(id, data) {
  return request.post(`/tasks/${id}/review`, data).then(r => r.data)
}

export function updateTask(id, data) {
  return request.put(`/tasks/${id}`, data).then(r => r.data)
}

export function deleteTask(id) {
  return request.delete(`/tasks/${id}`)
}
