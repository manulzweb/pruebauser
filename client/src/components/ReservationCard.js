import { movieService } from "../services/movie.service";
import { statusBadgeComponent } from "./statusBadge";

export async function ReservationCard(reservation, ownerName = "") {
  const { id, userId, movieId, amountTicket, date, status } = reservation;
  const movie = await movieService.getById(movieId)
  const ownerInfo = ownerName ? `<p class="mt-2 text-xs font-semibold text-slate-400">Reservado por: <span class="text-slate-600 font-bold">${escapeHtml(ownerName)}</span></p>` : "";

  return `
    <article class="rounded-3xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-50" data-movie-id="${escapeHtml(movie.id)}">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          ${statusBadgeComponent(movie.status)}
          <h2 class="movie-title mt-2 text-2xl font-bold text-slate-900">${escapeHtml(movie.title)}</h2>
          <p  class="movie-description mt-3 max-w-2xl text-slate-600">${escapeHtml(movie.description) || "Sin descripción proporcionada."}</p>
          ${ownerInfo}
        </div>
        <div class="flex gap-3 items-center">
          <button class="edit-movie-btn rounded-full border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer" data-movie-id="${escapeHtml(movie.id)}">Editar</button>
          <button class="delete-movie-btn rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 cursor-pointer" data-movie-id="${escapeHtml(movie.id)}">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}
