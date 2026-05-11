import request from './request'

export function createRecipe(data) {
  return request.post('/recipes', data).then(r => r.data)
}

export function getRecipeList(params) {
  return request.get('/recipes', { params }).then(r => r.data)
}

export function getRecipeDetail(id) {
  return request.get(`/recipes/${id}`).then(r => r.data)
}

export function updateRecipe(id, data) {
  return request.put(`/recipes/${id}`, data).then(r => r.data)
}

export function deleteRecipe(id) {
  return request.delete(`/recipes/${id}`)
}
