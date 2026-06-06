import { authService } from "../../services/auth.service";
import { movieService } from "../../services/movie.service";
import { showToast } from "../../components/alerts";

export function renderNewMovie() {
  const user = authService.getSession();
  if (!user) return `<div style="padding: 20px; text-align: center; color: red;">No autorizado.</div>`;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes('admin');
  if (!isAdmin) return `<div style="padding: 20px; text-align: center; color: red;">Acceso denegado.</div>`;

  const params = new URLSearchParams(window.location.search);
  const isEdit = params.has('id');

  return `
    <div class="p-6 max-w-lg mx-auto bg-white border border-gray-300 rounded shadow-sm my-8">
      <div class="mb-4">
        <a href="/movies" class="text-xs text-blue-600 hover:underline flex items-center gap-1 mb-2">
          &larr; Volver
        </a>
        <h1 class="text-xl font-bold">${isEdit ? 'Editar Película' : 'Nueva Película'}</h1>
      </div>

      <form id="movieForm" class="space-y-4 text-sm">
        <input type="hidden" id="movieId">

        <div>
          <label class="block font-semibold mb-1" for="movie-title">Título</label>
          <input id="movie-title" type="text" class="w-full border border-gray-300 rounded p-2 focus:outline-none" required />
        </div>

        <div>
          <label class="block font-semibold mb-1" for="movie-description">Descripción</label>
          <textarea id="movie-description" rows="3" class="w-full border border-gray-300 rounded p-2 focus:outline-none"></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1" for="movie-room">Sala</label>
            <select id="movie-room" class="w-full border border-gray-300 rounded p-2 focus:outline-none">
              <option value="Sala A">Sala A</option>
              <option value="Sala B">Sala B</option>
              <option value="Sala C">Sala C</option>
              <option value="Sala IMAX">Sala IMAX</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold mb-1" for="movie-capacity">Capacidad</label>
            <input id="movie-capacity" type="number" min="10" max="200" value="30" class="w-full border border-gray-300 rounded p-2 focus:outline-none" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold mb-1" for="movie-date">Fecha</label>
            <input id="movie-date" type="text" placeholder="YYYY-MM-DD" class="w-full border border-gray-300 rounded p-2 focus:outline-none" required />
          </div>
          <div>
            <label class="block font-semibold mb-1" for="movie-hour">Hora</label>
            <input id="movie-hour" type="text" placeholder="HH:MM" class="w-full border border-gray-300 rounded p-2 focus:outline-none" required />
          </div>
        </div>

        <div>
          <label class="block font-semibold mb-1" for="movie-state">Estado</label>
          <select id="movie-state" class="w-full border border-gray-300 rounded p-2 focus:outline-none">
            <option value="active">Activo</option>
            <option value="cancel">Cancelado</option>
          </select>
        </div>

        <div class="flex gap-4 pt-2">
          <button id="saveMovieBtn" type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold cursor-pointer">
            ${isEdit ? 'Guardar' : 'Crear'}
          </button>
          <a href="/movies" class="flex-1 text-center border border-gray-300 py-2 rounded font-semibold hover:bg-gray-50">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  `;
}

export const setupNewMovie = async () => {
  const form = document.getElementById("movieForm");
  if (!form) return;

  const titleInput = document.getElementById("movie-title");
  const descInput = document.getElementById("movie-description");
  const roomInput = document.getElementById("movie-room");
  const capacityInput = document.getElementById("movie-capacity");
  const dateInput = document.getElementById("movie-date");
  const hourInput = document.getElementById("movie-hour");
  const stateInput = document.getElementById("movie-state");
  const idInput = document.getElementById("movieId");

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');

  let existingMovie = null;

  if (movieId) {
    try {
      existingMovie = await movieService.getById(movieId);
      if (existingMovie) {
        idInput.value = existingMovie.id;
        titleInput.value = existingMovie.movie || '';
        descInput.value = existingMovie.description || '';
        roomInput.value = existingMovie.room || 'Sala A';
        capacityInput.value = existingMovie.capacity || 30;
        dateInput.value = existingMovie.date || '';
        hourInput.value = existingMovie.hour || '';
        stateInput.value = existingMovie.state || 'active';
      }
    } catch (error) {
      console.error(error);
      showToast("Error", "error", "No se pudo cargar la película.");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const room = roomInput.value;
    const capacity = Number(capacityInput.value);
    const date = dateInput.value;
    const hour = hourInput.value;
    const state = stateInput.value;

    if (!title || isNaN(capacity) || capacity <= 0 || !date || !hour) {
      showToast("Error", "error", "Completa todos los campos.");
      return;
    }

    try {
      const saveBtn = document.getElementById("saveMovieBtn");
      saveBtn.disabled = true;
      saveBtn.textContent = "Guardando...";

      if (movieId && existingMovie) {
        const bookingsCount = existingMovie.capacity - existingMovie.available;
        const newAvailable = Math.max(0, capacity - bookingsCount);

        const updatedMovie = {
          ...existingMovie,
          movie: title,
          description: desc,
          room: room,
          capacity: capacity,
          available: newAvailable,
          date: date,
          hour: hour,
          state: state
        };

        await movieService.put(movieId, updatedMovie);
        showToast("Éxito", "success", "Cambios guardados.");
      } else {
        const newMovie = {
          movie: title,
          description: desc,
          room: room,
          capacity: capacity,
          available: capacity,
          date: date,
          hour: hour,
          state: state
        };

        await movieService.post(newMovie);
        showToast("Éxito", "success", "Película creada.");
      }

      setTimeout(() => {
        window.history.pushState({}, "", "/movies");
        const popStateEvent = new PopStateEvent('popstate');
        window.dispatchEvent(popStateEvent);
      }, 1000);

    } catch (error) {
      console.error(error);
      showToast("Error", "error", "No se pudo guardar.");
      const saveBtn = document.getElementById("saveMovieBtn");
      saveBtn.disabled = false;
      saveBtn.textContent = movieId ? "Guardar" : "Crear";
    }
  });
};
