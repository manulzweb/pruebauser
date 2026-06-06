import { authService } from "../services/auth.service";
import { reservationService } from "../services/reservation.service";
import { movieService } from "../services/movie.service";
import { showToast, showConfirm, showError } from "../components/alerts";

export function renderHome() {
  const user = authService.getSession();
  if (!user) return `<div style="padding: 20px; text-align: center; color: red;">No autorizado.</div>`;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes("admin");

  return `
    <div class="p-6 max-w-4xl mx-auto space-y-6 text-sm">
      <div class="bg-white border border-gray-300 rounded p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-800">¡Hola, ${user.name || 'Usuario'}!</h1>
          <p class="text-xs text-gray-500 mt-0.5">${user.email}</p>
          <div class="mt-2 flex gap-1.5">
            ${userRoles.map(role => `
              <span class="bg-gray-100 border border-gray-300 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                ${role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            `).join('')}
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          ${isAdmin ? `
            <a href="/dashboard" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold text-xs text-center">
              Gestionar Reservas
            </a>
            <a href="/movies" class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded font-semibold text-xs text-center">
              Gestionar Películas
            </a>
            <a href="/admin" class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded font-semibold text-xs text-center">
              Administrar Usuarios
            </a>
          ` : `
            <a href="/movies" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded font-semibold text-xs text-center">
              Nueva Reserva
            </a>
            <a href="/dashboard" class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded font-semibold text-xs text-center">
              Ver Historial
            </a>
          `}
        </div>
      </div>

      <div class="bg-white border border-gray-300 rounded shadow-sm p-6">
        <div class="border-b border-gray-200 pb-3 mb-4 flex justify-between items-center">
          <h2 class="text-base font-bold text-gray-800">
            ${isAdmin ? 'Resumen General de Reservas Activas' : 'Mis Reservas Activas'}
          </h2>
          <span class="text-xs text-gray-500" id="activeReservationsCount">
            Cargando...
          </span>
        </div>

        <div id="homeReservationsList" class="space-y-3">
          <p class="text-gray-500 text-center py-4">Cargando reservas...</p>
        </div>
      </div>
    </div>
  `;
}

export const setupHome = async () => {
  const listContainer = document.getElementById("homeReservationsList");
  const countBadge = document.getElementById("activeReservationsCount");
  
  const user = authService.getSession();
  if (!listContainer || !user) return;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes("admin");

  const loadReservations = async () => {
    try {
      const [reservations, movies] = await Promise.all([
        reservationService.get(),
        movieService.get()
      ]);

      let activeList = reservations.filter(r => r.status !== 'canceled');

      if (!isAdmin) {
        activeList = activeList.filter(r => Number(r.userId) === Number(user.id));
      }

      if (countBadge) {
        countBadge.textContent = `${activeList.length} activa(s)`;
      }

      if (activeList.length === 0) {
        listContainer.innerHTML = `
          <div class="p-6 text-center text-gray-500 italic">
            No tienes reservas activas en este momento.
          </div>
        `;
        return;
      }

      listContainer.innerHTML = activeList.map(r => {
        const movie = movies.find(m => Number(m.id) === Number(r.movieId)) || {};
        
        let statusLabel = 'Pendiente de Confirmación';
        let statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (r.status === 'confirmed') {
          statusLabel = 'Confirmada';
          statusColor = 'text-green-600 bg-green-50 border-green-200';
        }

        return `
          <div class="border border-gray-200 rounded p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span class="font-bold text-gray-800 text-sm">${movie.movie || 'Película Eliminada'}</span>
                <span class="px-2 py-0.5 text-[10px] rounded border ${statusColor}">
                  ${statusLabel}
                </span>
              </div>
              <div class="text-xs text-gray-500 space-y-0.5">
                <div><b>Sala:</b> ${movie.room || 'N/A'} &bull; <b>Fecha:</b> ${movie.date || 'N/A'} &bull; <b>Hora:</b> ${movie.hour || 'N/A'}</div>
                <div><b>Entradas reservadas:</b> ${r.amountTicket} &bull; <b>Hecha el:</b> ${r.date}</div>
              </div>
            </div>
            <div>
              <button 
                class="btn-home-cancel bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs cursor-pointer font-semibold"
                data-id="${r.id}"
              >
                Cancelar
              </button>
            </div>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.btn-home-cancel').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          const reservation = activeList.find(res => Number(res.id) === Number(id));
          if (!reservation) return;

          const result = await Swal.fire({
            title: '¿Cancelar Reserva?',
            text: `Se liberarán los cupos para esta película.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No'
          });

          if (result.isConfirmed) {
            try {
              const movie = movies.find(m => Number(m.id) === Number(reservation.movieId));
              reservation.status = 'canceled';
              await reservationService.put(reservation.id, reservation);

              if (movie) {
                movie.available = (movie.available || 0) + reservation.amountTicket;
                await movieService.put(movie.id, movie);
              }

              showToast('Reserva cancelada correctamente.', 'success');
              loadReservations();
            } catch (error) {
              console.error(error);
              showError('Error', 'No se pudo cancelar la reserva.');
            }
          }
        });
      });

    } catch (error) {
      console.error(error);
      listContainer.innerHTML = `<p class="text-red-500 text-center py-4">Error al cargar reservas.</p>`;
    }
  };

  loadReservations();
};
