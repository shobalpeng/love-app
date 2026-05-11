import request from './request'

export function createTodo(data) {
  return request.post('/todos', data).then(r => r.data)
}

export function getTodoList(filter) {
  return request.get('/todos', { params: { filter } }).then(r => r.data)
}

export function updateTodo(id, data) {
  return request.patch(`/todos/${id}`, data).then(r => r.data)
}

export function deleteTodo(id) {
  return request.delete(`/todos/${id}`)
}
