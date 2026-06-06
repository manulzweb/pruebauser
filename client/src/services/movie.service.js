import { request, jsonOptions } from './api.service.js'
import { authService } from './auth.service.js'

const get = async () => await request('/movies')

const post = async (newData) => await request('/movies', jsonOptions('POST', newData))

const getById = async (id) => await request(`/movies/${id}`)

const put = async (id, newData) => {
  return await request(`/movies/${id}`, jsonOptions('PUT', newData))
}

const patch = async (id, newData) => {
  return await request(`/movies/${id}`, jsonOptions('PATCH', newData))
}

const del = async (id) => {
  return await request(`/movies/${id}`, { method: 'DELETE' })
}
export const movieService = {
  get,
  post,
  put,
  patch,
  del,
  getById
}