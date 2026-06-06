import { authService } from "../services/auth.service";
import { userService } from "../services/users.service";
import { hashPassword } from "../utils/crypto.util";
import { showToast } from "../components/alerts";

export function renderProfile() {
  const user = authService.getSession();
  if (!user) return `<div style="padding: 20px; text-align: center; color: red;">No autorizado.</div>`;

  const userRoles = user.roles || user.role || [];

  return `
    <div class="p-6 max-w-md mx-auto bg-white border border-gray-300 rounded shadow-sm my-8 text-sm">
      <div class="mb-4 text-center">
        <h1 class="text-xl font-bold">Mi Perfil</h1>
        <p class="text-gray-500">Actualiza tus datos de acceso</p>
      </div>

      <form id="profileForm" class="space-y-4">
        <div>
          <label class="block font-semibold mb-1" for="profile-name">Nombre completo</label>
          <input id="profile-name" type="text" value="${user.name || ''}" class="w-full border border-gray-300 rounded p-2 focus:outline-none" required />
        </div>

        <div>
          <label class="block font-semibold mb-1" for="profile-email">Correo electrónico</label>
          <input id="profile-email" type="email" value="${user.email || ''}" class="w-full border border-gray-300 rounded p-2 focus:outline-none" required />
        </div>

        <div>
          <label class="block font-semibold mb-1" for="profile-password">Contraseña (dejar en blanco para no cambiar)</label>
          <input id="profile-password" type="password" class="w-full border border-gray-300 rounded p-2 focus:outline-none" />
        </div>

        <div>
          <label class="block font-semibold mb-1">Roles activos</label>
          <div class="flex gap-2">
            ${userRoles.map(role => `
              <span class="bg-gray-100 border border-gray-300 text-gray-700 px-2 py-0.5 rounded text-xs">
                ${role}
              </span>
            `).join('')}
          </div>
        </div>

        <button id="updateProfileBtn" type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold cursor-pointer">
          Guardar Cambios
        </button>
      </form>
    </div>
  `;
}

export const setupProfile = () => {
  const form = document.getElementById("profileForm");
  if (!form) return;

  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const passwordInput = document.getElementById("profile-password");

  const user = authService.getSession();
  if (!user) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    if (!name || !email) {
      showToast("Error", "error", "Completa todos los campos obligatorios.");
      return;
    }

    try {
      const updateBtn = document.getElementById("updateProfileBtn");
      updateBtn.disabled = true;
      updateBtn.textContent = "Guardando...";

      const users = await userService.get();
      const emailConflict = users.some(u => u.email.toLowerCase() === email && Number(u.id) !== Number(user.id));
      
      if (emailConflict) {
        showToast("Error", "error", "El correo ya está en uso.");
        updateBtn.disabled = false;
        updateBtn.textContent = "Guardar Cambios";
        return;
      }

      const updatedUser = {
        ...user,
        name: name,
        email: email
      };

      if (password) {
        if (password.length < 6) {
          showToast("Error", "error", "La contraseña debe tener al menos 6 caracteres.");
          updateBtn.disabled = false;
          updateBtn.textContent = "Guardar Cambios";
          return;
        }
        updatedUser.password = hashPassword(password);
      }

      await userService.put(user.id, updatedUser);
      authService.setSession(updatedUser);

      showToast("Listo", "success", "Perfil actualizado.");
      setTimeout(() => {
        location.reload();
      }, 1000);

    } catch (error) {
      console.error(error);
      showToast("Error", "error", "No se pudo actualizar.");
      const updateBtn = document.getElementById("updateProfileBtn");
      updateBtn.disabled = false;
      updateBtn.textContent = "Guardar Cambios";
    }
  });
};
