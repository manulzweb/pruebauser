import { getEmailRules, getPasswordRules, hasDangerousChars } from "../../utils/validators";
import { renderRoute } from "../../router/router";
import { userService } from "../../services/users.service";
import { showToast } from "../../components/alerts";
import { hashPassword } from "../../utils/crypto";
import { setButtonLoadingState, createDebouncedValidator, validateSync, showFieldError } from "../../utils/formUtils";
import { dropdownComponent, setupDropdown } from "../../components/dropdown";

export const renderRegister = () => {
  const roleOptions = [
    { value: "user", label: "Usuario Regular" },
    { value: "admin", label: "Administrador" }
  ];
  const roleSelect = dropdownComponent("register-role", roleOptions, "user");

  return `    <main class="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <section class="hidden border-r border-[var(--border-main)] bg-[var(--brand-bg)] p-10 text-[var(--brand-text)] lg:flex lg:flex-col lg:justify-between">
        <a class="text-xl font-black tracking-tight" href="/">TaskFlowSPA</a>
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] opacity-80">Nuevo usuario</p>
          <h1 class="mt-4 text-5xl font-black tracking-tight">Crea tu cuenta y empieza a organizar tu flujo.</h1>
          <p class="mt-5 max-w-md text-lg leading-8 opacity-90">
            Esta vista permite enseñar el registro como parte del alcance funcional antes de llevarlo al flujo SPA definitivo.
          </p>
        </div>
        <p class="text-sm opacity-80">Interfaz base del modulo de autenticacion.</p>
      </section>

      <section class="flex items-center justify-center px-6 py-10">
        <div class="w-full max-w-xl rounded-[2rem] border border-[var(--border-main)] bg-[var(--bg-panel)] p-8 shadow-xl">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-bg)]">Registro</p>
              <h2 class="mt-2 text-3xl font-black text-[var(--text-main)]">Crear cuenta</h2>
            </div>
            <a class="rounded-full border border-[var(--border-main)] px-4 py-2 text-sm font-semibold text-[var(--brand-bg)] hover:bg-[var(--bg-base)]" href="/login">Ya tengo cuenta</a>
          </div>

          <form class="mt-8 grid gap-5">
            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-[var(--text-main)]" for="register-name">Nombre</label>
                <input id="register-name" type="text" placeholder="Ana" class="w-full rounded-2xl border border-[var(--border-main)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-hover)] focus:outline-none" />
                <p id="name-error" class="mt-1 text-sm text-red-600 hidden"></p>              
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-[var(--text-main)]" for="register-lastname">Apellido</label>
                <input id="register-lastname" type="text" placeholder="Torres" class="w-full rounded-2xl border border-[var(--border-main)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-hover)] focus:outline-none" />
                <p id="lastname-error" class="mt-1 text-sm text-red-600 hidden"></p>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-[var(--text-main)]" for="register-email">Correo</label>
              <input id="register-email" type="email" placeholder="usuario@taskflow.com" class="w-full rounded-2xl border border-[var(--border-main)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-hover)] focus:outline-none" />
              <p id="email-error" class="mt-1 text-sm text-red-600 hidden"></p>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-[var(--text-main)]" for="register-password">Contraseña</label>
                <input id="register-password" type="password" placeholder="Crea una contrasena" class="w-full rounded-2xl border border-[var(--border-main)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-hover)] focus:outline-none" />
                <p id="password-error" class="mt-1 text-sm text-red-600 hidden"></p>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-[var(--text-main)]" for="register-password-confirm">Confirmar Contraseña</label>
                <input id="register-password-confirm" type="password" placeholder="Repite tu contrasena" class="w-full rounded-2xl border border-[var(--border-main)] bg-[var(--bg-base)] px-4 py-3 text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-hover)] focus:outline-none" />
                <p id="password-confirm-error" class="mt-1 text-sm text-red-600 hidden"></p>
              </div>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-[var(--text-main)]" for="register-role">Rol</label>
              ${roleSelect}
            </div>

            <button id="register-btn" type="button" class="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-[var(--brand-bg)] px-5 py-3 text-sm font-bold text-[var(--brand-text)] hover:bg-[var(--brand-hover)]">
              Registrarme
            </button>
          </form>
        </div>
      </section>
    </main>`
}

const getViewElements = () => ({
  form: document.querySelector("form"),
  nameInput: document.getElementById("register-name"),
  lastnameInput: document.getElementById("register-lastname"),
  emailInput: document.getElementById("register-email"),
  passwordInput: document.getElementById("register-password"),
  passwordConfirmInput: document.getElementById("register-password-confirm"),
  roleInput: document.getElementById("register-role"),
  registerBtn: document.getElementById("register-btn"),
  emailError: document.getElementById("email-error"),
  passwordError: document.getElementById("password-error"),
  passwordConfirmError: document.getElementById("password-confirm-error"),
  nameError: document.getElementById("name-error"),
  lastnameError: document.getElementById("lastname-error")
});

const getFormData = (elements) => ({
  name: elements.nameInput.value.trim(),
  lastname: elements.lastnameInput.value.trim(),
  email: elements.emailInput.value.trim(),
  password: elements.passwordInput.value.trim(),
  passwordConfirm: elements.passwordConfirmInput.value.trim(),
  role: elements.roleInput.value
});

const handleRegisterSubmit = (elements) => async () => {
  if (elements.registerBtn.disabled) return;

  const isEmailValid = validateSync(elements.emailInput, elements.emailError, getEmailRules());
  const isPasswordValid = validateSync(elements.passwordInput, elements.passwordError, getPasswordRules());

  if (!isEmailValid || !isPasswordValid) return;

  const { email, password, passwordConfirm, name, lastname, role } = getFormData(elements);

  if (password !== passwordConfirm) {
    return showFieldError(elements.passwordConfirmInput, "Las contraseñas no coinciden", elements.passwordConfirmError);
  }

  if (!name || !lastname) {
    return showFieldError(elements.nameInput, "Todos los campos son obligatorios", elements.nameError);
  }
  if (hasDangerousChars(name)) return showFieldError(elements.nameInput, "Caracteres no permitidos", elements.nameError);
  if (hasDangerousChars(lastname)) return showFieldError(elements.lastnameInput, "Caracteres no permitidos", elements.lastnameError);

  setButtonLoadingState(elements.registerBtn, true, "Registrando...", "Registrarme");

  try {
    const users = await userService.get();
    if (users.some(u => String(u.email).toLowerCase() === String(email).toLowerCase())) {
      showToast("Registro fallido", "error", "El correo ya está registrado");
      setButtonLoadingState(elements.registerBtn, false, "", "Registrarme");
      return;
    }

    const hashedPassword = hashPassword(password);

    const newUser = {
      name: `${name} ${lastname}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      roles: role === "admin" ? ["user", "admin"] : ["user"]
    };

    await userService.post(newUser);
    showToast("Registro exitoso", "success", "Ahora puedes iniciar sesión");
    window.history.pushState({}, "", "/login");
    renderRoute();
  } catch (error) {
    console.error(error);
    setButtonLoadingState(elements.registerBtn, false, "", "Registrarme");
    showToast("Error", "error", "Error al registrar el usuario");
  }
};

export const setupRegister = () => {
  const elements = getViewElements();
  if (!elements.registerBtn) return;
  if (!elements.emailInput || !elements.passwordInput || !elements.nameInput || !elements.lastnameInput || !elements.roleInput) return;

  elements.emailInput.addEventListener("input", createDebouncedValidator(elements.emailInput, elements.emailError, getEmailRules()));
  elements.passwordInput.addEventListener("input", createDebouncedValidator(elements.passwordInput, elements.passwordError, getPasswordRules()));
  
  elements.passwordConfirmInput.addEventListener("input", () => {
    if (elements.passwordConfirmInput.value.trim() !== elements.passwordInput.value.trim()) {
      showFieldError(elements.passwordConfirmInput, "Las contraseñas no coinciden", elements.passwordConfirmError);
    } else {
      elements.passwordConfirmError.classList.add("hidden");
      elements.passwordConfirmInput.classList.remove("border-[var(--danger-border)]");
    }
  });

  elements.registerBtn.addEventListener("click", handleRegisterSubmit(elements));
  setupDropdown("register-role");

  if (elements.form) {
    elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      elements.registerBtn.click();
    });
  }
};