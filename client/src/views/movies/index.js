export const renderMovies = () => {
  return `
    <div class="p-8 min-h-screen bg-slate-100">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-slate-800">Mis Películas</h1>
        <a href="/movies/new" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Nueva Película</a>
      </div>
      <div id="movies-container" class="grid gap-4">
        <p class="text-slate-500">Cargando películas...</p>
      </div>
    </div>
  `;
};

export const setupMovies = () => {
  const container = document.getElementById("movies-container");
  if (container) {
    container.innerHTML = '<p class="text-slate-500">No hay películas registradas aún.</p>';
  }
};
