import { request, jsonOptions } from './api.service.js'
import { authService } from './auth.service.js'

const get = async () => await request('/reservations')

const post = async (newData) => await request('/reservations', jsonOptions('POST', newData))

const getById = async (id) => await request(`/reservations/${id}`)

const put = async (id, newData) => {
  return await request(`/reservations/${id}`, jsonOptions('PUT', newData))
}

const patch = async (id, newData) => {
  return await request(`/reservations/${id}`, jsonOptions('PATCH', newData))
}

const del = async (id) => {
  return await request(`/reservations/${id}`, { method: 'DELETE' })
}
export const movieService = {
  get,
  post,
  put,
  patch,
  del,
  getById
}