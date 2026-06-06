import { ReservationCard } from "../components/ReservationCard";
import { authService } from "../services/auth.service";
import { reservationService } from "../services/reservation.service";
import { badgeComponent } from "../components/badge";

export function renderHome() {
  const user = authService.getSession();
  const userRoles = user?.roles || user?.role || [];
  const isAdmin = userRoles.includes("admin");

  return `
    <div class="flex">
      <main class="flex-1 p bg-slate-100 min-h-screen">
        <div id="welcome-message" class="mb-6">
          <h1 class="text-xl font-bold">
            Bienvenido ${user?.name || "Usuario"}
          </h1>
          <p class="text-orange-900">
            Rol: ${userRoles.join(", ")}
          </p>
        </div>

        ${
          isAdmin
            ? `
              <section class="bg-white p-5 rounded-lg shadow mb-6">
                <h2 class="font-bold text-xl mb-2">Panel Administrador</h2>
                <p>Puedes visualizar todas las reservas.</p>
                <button class="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Gestionar Reservas</button>
              </section>
            `
            : `
              <section class="bg-white p-5 rounded-lg shadow mb-6">
                <h2 class="font-bold text-xl mb-2">Panel Usuario</h2>
                <p>Puedes visualizar únicamente tus reservas.</p>
                <button class="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Nueva Reserva</button>
              </section>
            `
        }

        <section class="bg-white p-5 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-bold text-xl">Reservas</h2>
            <span class="text-sm text-slate-500">
              ${
                isAdmin
                  ? "Mostrando todas las reservas"
                  : "Mostrando únicamente tus reservas"
              }
            </span>
          </div>

          <div id="reservationsContainer" class="grid gap-4 md:grid-cols-2">
            <div class="w-full text-center py-8 col-span-2">
              <p class="text-emerald-800">Cargando reservas ...</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
}

export const setupHome = async () => {
  const container = document.querySelector("#reservationsContainer");
  const welcomeContainer = document.querySelector("#welcome-message");

  const user = authService.getSession();
  if (!user) return;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes("admin");

  if (welcomeContainer) {
    welcomeContainer.innerHTML = `
      <h1 class="text-xl font-bold">Bienvenido ${user.name}</h1>
      <div class="mt-2 flex gap-2 items-center">
        <span class="text-sm text-slate-600">Roles:</span> 
        <div class="flex gap-1">${userRoles.map(role => typeof badgeComponent === "function" ? badgeComponent(role) : role).join('')}</div>
      </div>
    `;
  }

  try {
    const reservations = await reservationService.get();
    const filteredReservations = isAdmin
        ? reservations
        : reservations.filter((reservation) => reservation.userId === user.id);

    if (container) {
      container.innerHTML = filteredReservations?.length
        ? filteredReservations.map((reservation) => ReservationCard(reservation)).join("")
        : `
          <div class="w-full text-center py-8 col-span-2">
            <p class="text-slate-500">No hay reservas disponibles</p>
          </div>
        `;
    }
  } catch (error) {
    console.error("Error cargando reservas", error);
    if (container) {
      container.innerHTML = `<p class="text-red-500 col-span-2 text-center">Error al cargar las reservas</p>`;
    }
  }
};
