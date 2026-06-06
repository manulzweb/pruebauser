// import ReservationCard from "@components/ReservationCard";
// import { getReservations } from "@services/reservation.service";
// import { getSession } from "@/utils";

// export const homeController = async () => {
//   const container = document.querySelector("#reservationsContainer");

//   const user = getSession();

//   const reservations = await getReservations();

//   const filteredReservations =
//     user.role === "admin"
//       ? reservations
//       : reservations.filter((reservation) => reservation.userId === user.id);

//   container.innerHTML = container.innerHTML = filteredReservations?.length
//     ? filteredReservations
//         .map((reservation) => ReservationCard(reservation))
//         .join("")
//     : `
//       <div class="w-full text-center py-8 col-span-2">
//         <p class="text-slate-500">
//           No hay reservas disponibles
//         </p>
//       </div>
//     `;
// };
