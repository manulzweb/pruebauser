export const renderNewMovie = () => {
  return `
    <div class="p-8 min-h-screen bg-slate-100">
      <h1 class="text-3xl font-bold text-slate-800 mb-6">Nueva Película</h1>
      <form id="new-movie-form" class="bg-white p-6 rounded-lg shadow-md max-w-lg">
        <div class="mb-4">
          <label class="block text-slate-700 font-bold mb-2">Título de la película</label>
          <input type="text" class="w-full border rounded px-3 py-2" placeholder="Título">
        </div>
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar Película</button>
      </form>
    </div>
  `;
};

export const setupNewMovie = () => {
  const form = document.getElementById("new-movie-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Nueva película enviada");
    });
  }
};
