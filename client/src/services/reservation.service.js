import { request, jsonOptions } from './api.service.js'
import { authService } from './auth.service.js'

const get = async () => await request('/reservations')

const post = async (newData) => await request('/reservations', jsonOptions('POST', newData))

const getById = async (id) => await request(`/reservations/${id}`)

const ensureOwnerOrAdmin = async (id) => {
  const user = authService.getSession();
  if (!user) throw new Error('No autenticado');
  const reservation = await getById(id);
  const isAdmin = user.roles && user.roles.includes('admin');
  if (!isAdmin && String(reservation.userId) !== String(user.id)) {
    throw new Error("No autorizado: no eres propietario de la reserva");
  }
  return reservation;
}

const put = async (id, newData) => {
  await ensureOwnerOrAdmin(id);
  return await request(`/reservations/${id}`, jsonOptions('PUT', newData))
}

const patch = async (id, newData) => {
  await ensureOwnerOrAdmin(id);
  return await request(`/reservations/${id}`, jsonOptions('PATCH', newData))
}

const del = async (id) => {
  await ensureOwnerOrAdmin(id);
  return await request(`/reservations/${id}`, { method: 'DELETE' })
}
export const reservationService = {
  get,
  post,
  put,
  patch,
  del,
  getById
}