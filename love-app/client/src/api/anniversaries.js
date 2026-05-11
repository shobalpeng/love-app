import request from './request'

export function getAnniversaries() {
  return request.get('/anniversaries').then(r => r.data)
}

export function createAnniversary({ name, date }) {
  return request.post('/anniversaries', { name, date }).then(r => r.data)
}

export function deleteAnniversary(id) {
  return request.delete(`/anniversaries/${id}`)
}

export function togglePin(id) {
  return request.post(`/anniversaries/${id}/pin`).then(r => r.data)
}
