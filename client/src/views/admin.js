export const renderAdmin = () => {
  return `
    <div class="p-8 min-h-screen bg-slate-100">
      <h1 class="text-3xl font-bold text-slate-800 mb-6">Panel Administrativo</h1>
      <div class="bg-white p-6 rounded-lg shadow-md">
        <p class="text-slate-600">Solo usuarios con rol de administrador pueden ver esto.</p>
      </div>
    </div>
  `;
};

export const setupAdmin = () => {
  // Inicialización del panel de administración
};
