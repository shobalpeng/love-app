import request from './request'

export function getBalance() {
  return request.get('/integrals').then(r => r.data)
}

export function getPartnerBalance() {
  return request.get('/integrals/partner').then(r => r.data)
}

export function getRecords(page = 1, pageSize = 20) {
  return request.get('/integrals/records', { params: { page, pageSize } }).then(r => r.data)
}
