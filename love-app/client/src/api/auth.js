import request from './request'

export function register(username, password) {
  return request.post('/auth/register', { username, password }).then(r => r.data)
}

export function login(username, password) {
  return request.post('/auth/login', { username, password }).then(r => r.data)
}
