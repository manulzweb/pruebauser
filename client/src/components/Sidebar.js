export function sidebarComponent() {
  return `
    <aside class="w-64 bg-slate-900 text-white h-screen p-5">
      <h2 class="text-2xl font-bold mb-8">SPA Base</h2>

      <nav class="flex flex-col gap-4">
        <a href="/" class="px-3 py-1 bg-gray-500 rounded-xl" data-link>Home</a>
        <button id="logoutBtn" class="text-left cursor-pointer text-red-400 hover:text-white hover:bg-red-400 px-3 py-1 rounded-xl">Cerrar sesión</button>
      </nav>
    </aside>
  `;
}