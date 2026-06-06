import { authService } from "../../services/auth.service";
import { reservationService } from "../../services/reservation.service";
import { movieService } from "../../services/movie.service";
import { userService } from "../../services/users.service";
import { showToast, showConfirm, showError } from "../../components/alerts";

export function renderReservation() {
  const user = authService.getSession();
  if (!user) return `<div style="padding: 20px; text-align: center; color: red;">No autorizado.</div>`;
  
  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes('admin');

  return `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">${isAdmin ? 'Control de Reservas (Admin)' : 'Mis Reservas'}</h1>
        </div>
        <div>
          <a href="/movies" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold">
            Nueva Reserva
          </a>
        </div>
      </div>

      <div id="statsContainer" class="flex gap-4 mb-6 text-sm"></div>

      <div class="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
              <th class="p-3 font-semibold text-gray-700">ID</th>
              ${isAdmin ? '<th class="p-3 font-semibold text-gray-700">Usuario</th>' : ''}
              <th class="p-3 font-semibold text-gray-700">Película</th>
              <th class="p-3 font-semibold text-gray-700">Sala</th>
              <th class="p-3 font-semibold text-gray-700">Fecha</th>
              <th class="p-3 font-semibold text-gray-700">Hora</th>
              <th class="p-3 font-semibold text-gray-700">Entradas</th>
              <th class="p-3 font-semibold text-gray-700">Fecha Reserva</th>
              <th class="p-3 font-semibold text-gray-700">Estado</th>
              <th class="p-3 font-semibold text-gray-700 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody id="reservationsTableBody">
            <tr>
              <td colspan="${isAdmin ? 10 : 9}" class="p-6 text-center text-gray-500">Cargando reservas...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export const setupReservation = async () => {
  const tbody = document.getElementById("reservationsTableBody");
  const user = authService.getSession();
  if (!tbody || !user) return;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes('admin');

  const loadTable = async () => {
    try {
      const [reservations, movies, users] = await Promise.all([
        reservationService.get(),
        movieService.get(),
        userService.get()
      ]);

      const filteredReservations = isAdmin 
        ? reservations 
        : reservations.filter(r => Number(r.userId) === Number(user.id));

      updateStats(filteredReservations);

      if (filteredReservations.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="${isAdmin ? 10 : 9}" class="p-6 text-center text-gray-500">
              No hay reservas registradas.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filteredReservations.map(r => {
        const movie = movies.find(m => Number(m.id) === Number(r.movieId)) || {};
        const resUser = users.find(u => Number(u.id) === Number(r.userId)) || {};
        
        let statusLabel = 'Pendiente';
        let badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (r.status === 'confirmed') {
          statusLabel = 'Confirmada';
          badgeColor = 'bg-green-100 text-green-800 border-green-200';
        } else if (r.status === 'canceled') {
          statusLabel = 'Cancelada';
          badgeColor = 'bg-red-100 text-red-800 border-red-200';
        }

        return `
          <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-3 font-mono text-xs text-gray-500">#${r.id}</td>
            ${isAdmin ? `<td class="p-3 font-semibold">${resUser.name || 'N/A'}<br><span class="text-xs text-gray-500 font-normal">${resUser.email || ''}</span></td>` : ''}
            <td class="p-3 font-semibold">${movie.movie || 'Eliminada'}</td>
            <td class="p-3">${movie.room || 'N/A'}</td>
            <td class="p-3">${movie.date || 'N/A'}</td>
            <td class="p-3">${movie.hour || 'N/A'}</td>
            <td class="p-3 font-semibold">${r.amountTicket}</td>
            <td class="p-3 text-gray-500">${r.date}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 text-xs font-semibold rounded border ${badgeColor}">
                ${statusLabel}
              </span>
            </td>
            <td class="p-3 text-center">
              <div class="flex gap-2 justify-center">
                ${r.status !== 'canceled' ? `
                  <button class="btn-cancel bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs cursor-pointer" data-id="${r.id}">
                    Cancelar
                  </button>
                ` : `<span class="text-xs text-gray-400">Ninguna</span>`}
                ${isAdmin ? `
                  <button class="btn-delete-reservation bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs cursor-pointer" data-id="${r.id}">
                    Eliminar
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');

      document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => handleCancel(e.target.getAttribute('data-id'), filteredReservations, movies));
      });

      if (isAdmin) {
        document.querySelectorAll('.btn-delete-reservation').forEach(btn => {
          btn.addEventListener('click', (e) => handleDelete(e.target.getAttribute('data-id'), filteredReservations, movies));
        });
      }

    } catch (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="${isAdmin ? 10 : 9}" class="p-6 text-center text-red-500">Error al cargar datos.</td></tr>`;
    }
  };

  const updateStats = (reservations) => {
    const statsContainer = document.getElementById("statsContainer");
    if (!statsContainer) return;

    const total = reservations.length;
    const pending = reservations.filter(r => r.status === 'pending').length;
    const confirmed = reservations.filter(r => r.status === 'confirmed').length;
    const canceled = reservations.filter(r => r.status === 'canceled').length;

    statsContainer.innerHTML = `
      <span class="border border-gray-300 bg-white px-3 py-1 rounded">Total: <b>${total}</b></span>
      <span class="border border-blue-300 bg-blue-50 text-blue-800 px-3 py-1 rounded">Pendientes: <b>${pending}</b></span>
      <span class="border border-green-300 bg-green-50 text-green-800 px-3 py-1 rounded">Confirmadas: <b>${confirmed}</b></span>
      <span class="border border-red-300 bg-red-50 text-red-800 px-3 py-1 rounded">Canceladas: <b>${canceled}</b></span>
    `;
  };

  const handleCancel = async (id, reservations, movies) => {
    const reservation = reservations.find(r => Number(r.id) === Number(id));
    if (!reservation) return;

    const confirmed = await showConfirm('¿Cancelar Reserva?', 'Se liberarán las entradas de esta reserva.');

    if (confirmed) {
      try {
        const movie = movies.find(m => Number(m.id) === Number(reservation.movieId));
        reservation.status = 'canceled';
        await reservationService.put(reservation.id, reservation);

        if (movie) {
          movie.available = (movie.available || 0) + reservation.amountTicket;
          await movieService.put(movie.id, movie);
        }

        showToast('Reserva cancelada correctamente.', 'success');
        loadTable();
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo cancelar.');
      }
    }
  };

  const handleDelete = async (id, reservations, movies) => {
    const reservation = reservations.find(r => Number(r.id) === Number(id));
    if (!reservation) return;

    const confirmed = await showConfirm('¿Eliminar Reserva?', 'Se borrará permanentemente de la base de datos.');

    if (confirmed) {
      try {
        const movie = movies.find(m => Number(m.id) === Number(reservation.movieId));
        if (reservation.status !== 'canceled' && movie) {
          movie.available = (movie.available || 0) + reservation.amountTicket;
          await movieService.put(movie.id, movie);
        }

        await reservationService.del(reservation.id);
        showToast('Reserva eliminada.', 'success');
        loadTable();
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo eliminar.');
      }
    }
  };

  loadTable();
};