import { authService } from "../../services/auth.service";
import { movieService } from "../../services/movie.service";
import { reservationService } from "../../services/reservation.service";
import { showToast, showConfirm, showError } from "../../components/alerts";
import Swal from 'sweetalert2';

export function renderMovies() {
  const user = authService.getSession();
  if (!user) return `<div style="padding: 20px; text-align: center; color: red;">No autorizado.</div>`;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes('admin');

  return `
    <div class="p-6 max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">${isAdmin ? 'Catálogo de Películas (Admin)' : 'Películas en Cartelera'}</h1>
        </div>
        ${isAdmin ? `
          <div>
            <a href="/movies/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold">
              + Nueva Película
            </a>
          </div>
        ` : ''}
      </div>

      <div id="moviesContentArea">
        <div class="p-6 text-center text-gray-500">Cargando películas...</div>
      </div>
    </div>
  `;
}

export const setupMovies = async () => {
  const contentArea = document.getElementById("moviesContentArea");
  const user = authService.getSession();
  if (!contentArea || !user) return;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes('admin');

  const loadMovies = async () => {
    try {
      const movies = await movieService.get();

      if (isAdmin) {
        if (movies.length === 0) {
          contentArea.innerHTML = `<div class="p-6 text-center border border-gray-300 rounded bg-white text-gray-500">No hay películas registradas.</div>`;
          return;
        }

        contentArea.innerHTML = `
          <div class="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-gray-100 border-b border-gray-300">
                  <th class="p-3 font-semibold text-gray-700">ID</th>
                  <th class="p-3 font-semibold text-gray-700">Título</th>
                  <th class="p-3 font-semibold text-gray-700">Sala</th>
                  <th class="p-3 font-semibold text-gray-700">Fecha</th>
                  <th class="p-3 font-semibold text-gray-700">Hora</th>
                  <th class="p-3 font-semibold text-gray-700">Capacidad</th>
                  <th class="p-3 font-semibold text-gray-700">Disponibles</th>
                  <th class="p-3 font-semibold text-gray-700">Estado</th>
                  <th class="p-3 font-semibold text-gray-700 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${movies.map(m => {
                  const isCancel = m.state === 'cancel';
                  return `
                    <tr class="border-b border-gray-200 hover:bg-gray-50">
                      <td class="p-3 font-mono text-xs text-gray-500">#${m.id}</td>
                      <td class="p-3 font-semibold">${m.movie}</td>
                      <td class="p-3">${m.room}</td>
                      <td class="p-3">${m.date}</td>
                      <td class="p-3">${m.hour}</td>
                      <td class="p-3">${m.capacity}</td>
                      <td class="p-3 font-bold ${m.available === 0 ? 'text-red-600' : 'text-green-600'}">${m.available}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded text-xs font-semibold ${isCancel ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}">
                          ${isCancel ? 'Cancelada' : 'Activa'}
                        </span>
                      </td>
                      <td class="p-3 text-center">
                        <div class="flex gap-2 justify-center">
                          <a href="/movies/new?id=${m.id}" class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                            Editar
                          </a>
                          <button class="btn-toggle-movie-state bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs cursor-pointer" data-id="${m.id}" data-state="${m.state}">
                            ${isCancel ? 'Activar' : 'Cancelar'}
                          </button>
                          <button class="btn-delete-movie bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs cursor-pointer" data-id="${m.id}">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;

        document.querySelectorAll('.btn-delete-movie').forEach(btn => {
          btn.addEventListener('click', (e) => handleDeleteMovie(e.currentTarget.getAttribute('data-id')));
        });
        document.querySelectorAll('.btn-toggle-movie-state').forEach(btn => {
          btn.addEventListener('click', (e) => handleToggleMovieState(e.currentTarget.getAttribute('data-id'), e.currentTarget.getAttribute('data-state')));
        });

      } else {
        const activeMovies = movies.filter(m => m.state === 'active');

        if (activeMovies.length === 0) {
          contentArea.innerHTML = `<div class="p-6 text-center border border-gray-300 rounded bg-white text-gray-500">No hay películas disponibles.</div>`;
          return;
        }

        contentArea.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${activeMovies.map(m => {
              const isSoldOut = m.available <= 0;
              return `
                <div class="bg-white border border-gray-300 rounded p-4 shadow-sm">
                  <h2 class="text-lg font-bold text-gray-800 mb-1">${m.movie}</h2>
                  <p class="text-xs text-gray-500 mb-3">${m.description || 'Sin sinopsis disponible.'}</p>
                  
                  <div class="text-xs text-gray-600 space-y-1 mb-4">
                    <div><b>Sala:</b> ${m.room}</div>
                    <div><b>Fecha / Hora:</b> ${m.date} a las ${m.hour}</div>
                    <div><b>Disponibles:</b> ${m.available} / ${m.capacity}</div>
                  </div>

                  <button 
                    class="btn-book-movie w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                    data-id="${m.id}"
                    ${isSoldOut ? 'disabled' : ''}
                  >
                    ${isSoldOut ? 'Agotada' : 'Reservar'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        `;

        document.querySelectorAll('.btn-book-movie').forEach(btn => {
          btn.addEventListener('click', (e) => handleBookMovie(e.currentTarget.getAttribute('data-id'), activeMovies));
        });
      }
    } catch (error) {
      console.error(error);
      contentArea.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error al cargar películas.</div>`;
    }
  };

  const handleBookMovie = async (id, movies) => {
    const movie = movies.find(m => Number(m.id) === Number(id));
    if (!movie) return;

    const { value: amount } = await Swal.fire({
      title: 'Reservar Entradas',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <p>Película: <b>${movie.movie}</b></p>
          <p style="margin-bottom: 15px; font-size:12px; color: gray;">Sala: ${movie.room} &bull; ${movie.date} &bull; ${movie.hour}</p>
          <label style="display:block; margin-bottom: 5px;">Cantidad de entradas (Máximo: ${movie.available})</label>
          <input id="swal-book-amount" class="swal2-input" type="number" min="1" max="${movie.available}" value="1" style="width: 90%; margin: 0;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Reservar',
      preConfirm: () => {
        const amt = Number(document.getElementById('swal-book-amount').value);
        if (isNaN(amt) || amt <= 0 || amt > movie.available) {
          Swal.showValidationMessage(`La cantidad debe ser menor que (Max: ${movie.available})`);
          return false;
        }
        return amt;
      }
    });

    if (amount) {
      try {
        const newReservation = {
          userId: Number(user.id),
          movieId: Number(movie.id),
          amountTicket: Number(amount),
          date: new Date().toISOString().split('T')[0],
          status: 'pending'
        };

        await reservationService.post(newReservation);

        movie.available = movie.available - amount;
        await movieService.put(movie.id, movie);

        showToast('Reserva realizada con éxito (Pendiente).', 'success');
        loadMovies();
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo reservar.');
      }
    }
  };

  const handleToggleMovieState = async (id, currentState) => {
    try {
      const movie = await movieService.getById(id);
      if (!movie) return;

      movie.state = currentState === 'active' ? 'cancel' : 'active';
      await movieService.put(id, movie);
      showToast('Estado cambiado.', 'success');
      loadMovies();
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudo cambiar el estado.');
    }
  };

  const handleDeleteMovie = async (id) => {
    try {
      const reservations = await reservationService.get();
      const activeReservations = reservations.filter(r => Number(r.movieId) === Number(id) && r.status !== 'canceled');

      let warningText = "¿Estás seguro?";
      if (activeReservations.length > 0) {
        warningText = `Hay ${activeReservations.length} reservas activas asociadas. ¿Eliminar igual?`;
      }

      const confirmed = await showConfirm('Eliminar Película', warningText);

      if (confirmed) {
        await movieService.del(id);
        showToast('Película borrada.', 'success');
        loadMovies();
      }
    } catch (error) {
      console.error(error);
      showError('Error', 'No se pudo eliminar.');
    }
  };

  loadMovies();
};
