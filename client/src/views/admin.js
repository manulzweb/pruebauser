import { authService } from "../services/auth.service";
import { userService } from "../services/users.service";
import { hashPassword } from "../utils/crypto.util";
import { showToast, showConfirm, showError } from "../components/alerts";
import Swal from 'sweetalert2';

export const renderAdmin = () => {
  const user = authService.getSession();
  if (!user) return `<div style="padding: 20px; text-align: center; color: red;">No autorizado.</div>`;

  const userRoles = user.roles || user.role || [];
  const isAdmin = userRoles.includes('admin');
  if (!isAdmin) return `<div style="padding: 20px; text-align: center; color: red;">Acceso denegado.</div>`;

  return `
    <div class="p-6 max-w-7xl mx-auto text-sm">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold">Administración de Usuarios</h1>
        </div>
        <div>
          <button id="adminCreateUserBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold cursor-pointer">
            + Nuevo Usuario
          </button>
        </div>
      </div>

      <div id="adminStatsArea" class="flex gap-4 mb-6"></div>

      <div class="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
              <th class="p-3 font-semibold text-gray-700">ID</th>
              <th class="p-3 font-semibold text-gray-700">Nombre Completo</th>
              <th class="p-3 font-semibold text-gray-700">Correo Electrónico</th>
              <th class="p-3 font-semibold text-gray-700">Roles</th>
              <th class="p-3 font-semibold text-gray-700 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody id="adminUsersTableBody">
            <tr>
              <td colspan="5" class="p-6 text-center text-gray-500">Cargando usuarios...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
};

export const setupAdmin = async () => {
  const tbody = document.getElementById("adminUsersTableBody");
  const statsArea = document.getElementById("adminStatsArea");
  const createUserBtn = document.getElementById("adminCreateUserBtn");

  const currentUser = authService.getSession();
  if (!tbody || !currentUser) return;

  const loadUsersTable = async () => {
    try {
      const users = await userService.get();

      const totalCount = users.length;
      const adminCount = users.filter(u => (u.roles || u.role || []).includes('admin')).length;
      const regularCount = totalCount - adminCount;

      if (statsArea) {
        statsArea.innerHTML = `
          <span class="border border-gray-300 bg-white px-3 py-1 rounded">Total: <b>${totalCount}</b></span>
          <span class="border border-gray-300 bg-white px-3 py-1 rounded text-red-700">Admins: <b>${adminCount}</b></span>
          <span class="border border-gray-300 bg-white px-3 py-1 rounded text-gray-700">Regulares: <b>${regularCount}</b></span>
        `;
      }

      if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-gray-500">No hay usuarios.</td></tr>`;
        return;
      }

      tbody.innerHTML = users.map(u => {
        const roles = u.roles || u.role || [];
        const isSelf = Number(u.id) === Number(currentUser.id);

        return `
          <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-3 font-mono text-xs text-gray-500">#${u.id}</td>
            <td class="p-3 font-bold">
              ${u.name} ${isSelf ? '<span class="text-xs font-normal text-blue-600 bg-blue-50 px-1 rounded">Tú</span>' : ''}
            </td>
            <td class="p-3 font-mono text-gray-600">${u.email}</td>
            <td class="p-3">
              <span class="px-2 py-0.5 text-xs font-semibold rounded border ${roles.includes('admin') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}">
                ${roles.join(', ')}
              </span>
            </td>
            <td class="p-3 text-center">
              <div class="flex gap-2 justify-center">
                <button class="btn-admin-edit-user bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs cursor-pointer" data-id="${u.id}">
                  Editar
                </button>
                <button class="btn-admin-delete-user bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" data-id="${u.id}" ${isSelf ? 'disabled' : ''}>
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      document.querySelectorAll('.btn-admin-edit-user').forEach(btn => {
        btn.addEventListener('click', (e) => handleEditUser(e.currentTarget.getAttribute('data-id'), users));
      });
      document.querySelectorAll('.btn-admin-delete-user').forEach(btn => {
        btn.addEventListener('click', (e) => handleDeleteUser(e.currentTarget.getAttribute('data-id')));
      });

    } catch (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-red-500">Error al cargar usuarios.</td></tr>`;
    }
  };

  const handleCreateUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Crear Usuario',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <label style="display:block; margin-bottom: 5px;">Nombre Completo</label>
          <input id="swal-user-name" class="swal2-input" type="text" placeholder="Juan Perez" style="width:90%; margin:0 0 15px 0;">
          
          <label style="display:block; margin-bottom: 5px;">Correo electrónico</label>
          <input id="swal-user-email" class="swal2-input" type="email" placeholder="correo@test.com" style="width:90%; margin:0 0 15px 0;">
          
          <label style="display:block; margin-bottom: 5px;">Contraseña</label>
          <input id="swal-user-password" class="swal2-input" type="password" placeholder="Mínimo 6 caracteres" style="width:90%; margin:0 0 15px 0;">
          
          <label style="display:block; margin-bottom: 5px;">Rol</label>
          <select id="swal-user-role" class="swal2-input" style="width:90%; margin:0;">
            <option value="user">Usuario Regular</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      preConfirm: () => {
        const name = document.getElementById('swal-user-name').value.trim();
        const email = document.getElementById('swal-user-email').value.trim().toLowerCase();
        const password = document.getElementById('swal-user-password').value.trim();
        const role = document.getElementById('swal-user-role').value;

        if (!name || !email || !password) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Correo inválido');
          return false;
        }

        if (password.length < 6) {
          Swal.showValidationMessage('Contraseña menor a 6 caracteres');
          return false;
        }

        return { name, email, password, role };
      }
    });

    if (formValues) {
      try {
        const { name, email, password, role } = formValues;

        const users = await userService.get();
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          showError('Error', 'El correo ya existe.');
          return;
        }

        const newUser = {
          name,
          email,
          password: hashPassword(password),
          roles: role === 'admin' ? ['user', 'admin'] : ['user']
        };

        await userService.post(newUser);
        showToast('Usuario creado.', 'success');
        loadUsersTable();
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo crear.');
      }
    }
  };

  const handleEditUser = async (id, users) => {
    const userToEdit = users.find(u => Number(u.id) === Number(id));
    if (!userToEdit) return;

    const isSelf = Number(userToEdit.id) === Number(currentUser.id);
    const hasAdminRole = (userToEdit.roles || userToEdit.role || []).includes('admin');

    const { value: formValues } = await Swal.fire({
      title: 'Editar Usuario',
      html: `
        <div style="text-align: left; font-size: 14px;">
          <label style="display:block; margin-bottom: 5px;">Nombre Completo</label>
          <input id="swal-user-name" class="swal2-input" type="text" value="${userToEdit.name}" style="width:90%; margin:0 0 15px 0;">
          
          <label style="display:block; margin-bottom: 5px;">Correo electrónico</label>
          <input id="swal-user-email" class="swal2-input" type="email" value="${userToEdit.email}" style="width:90%; margin:0 0 15px 0;">
          
          <label style="display:block; margin-bottom: 5px;">Nueva Contraseña (opcional)</label>
          <input id="swal-user-password" class="swal2-input" type="password" placeholder="Vació para no cambiar" style="width:90%; margin:0 0 15px 0;">
          
          <label style="display:block; margin-bottom: 5px;">Rol</label>
          <select id="swal-user-role" class="swal2-input" style="width:90%; margin:0;" ${isSelf ? 'disabled' : ''}>
            <option value="user" ${!hasAdminRole ? 'selected' : ''}>Usuario Regular</option>
            <option value="admin" ${hasAdminRole ? 'selected' : ''}>Administrador</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const name = document.getElementById('swal-user-name').value.trim();
        const email = document.getElementById('swal-user-email').value.trim().toLowerCase();
        const password = document.getElementById('swal-user-password').value.trim();
        const role = isSelf ? 'admin' : document.getElementById('swal-user-role').value;

        if (!name || !email) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/;
        if (!emailRegex.test(email)) {
          Swal.showValidationMessage('Correo inválido');
          return false;
        }

        if (password && password.length < 6) {
          Swal.showValidationMessage('Contraseña menor a 6 caracteres');
          return false;
        }

        return { name, email, password, role };
      }
    });

    if (formValues) {
      try {
        const { name, email, password, role } = formValues;

        const emailConflict = users.some(u => u.email.toLowerCase() === email && Number(u.id) !== Number(userToEdit.id));
        if (emailConflict) {
          showError('Error', 'El correo ya está en uso.');
          return;
        }

        const updatedUser = {
          ...userToEdit,
          name,
          email,
          roles: role === 'admin' ? ['user', 'admin'] : ['user']
        };

        if (password) {
          updatedUser.password = hashPassword(password);
        }

        await userService.put(userToEdit.id, updatedUser);

        if (isSelf) {
          authService.setSession(updatedUser);
        }

        showToast('Usuario actualizado.', 'success');
        
        if (isSelf && email !== currentUser.email) {
          location.reload();
        } else {
          loadUsersTable();
        }

      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo actualizar.');
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (Number(id) === Number(currentUser.id)) {
      showError('Error', 'No puedes eliminarte a ti mismo.');
      return;
    }

    const confirmed = await showConfirm('¿Eliminar Usuario?', 'Esta acción no se puede deshacer.');

    if (confirmed) {
      try {
        await userService.del(id);
        showToast('Usuario borrado.', 'success');
        loadUsersTable();
      } catch (error) {
        console.error(error);
        showError('Error', 'No se pudo eliminar.');
      }
    }
  };

  if (createUserBtn) {
    createUserBtn.addEventListener('click', handleCreateUser);
  }

  loadUsersTable();
};
