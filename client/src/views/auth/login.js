import { showToast } from "../../components/alerts";
import { sidebarComponent } from "../../components/Sidebar";
import { renderRoute } from "../../router/router";
import { authService } from "../../services/auth.service";
import { userService } from "../../services/users.service";
import { hashPassword } from "../../utils/crypto.util";
import { setButtonLoadingState, showFieldError, validateSync } from "../../utils/forms.util";
import { getEmailRules, getPasswordRules, hasDangerousChars, isValidEmail } from "../../utils/validators.util";

export const renderLogin = () => {
  return `
    <div class="min-h-screen flex justify-center items-center bg-slate-100">

      <div class="bg-white p-8 rounded-lg shadow w-96">

        <h1 class="text-3xl font-bold mb-5">
          Login
        </h1>

        <form id="loginForm">

          <input
            type="email"
            name="email"
            placeholder="Correo"
            class="border w-full p-2 rounded"
          >

          <p id="email-error" class=" text-sm text-red-600 hidden mb-1">
                Por favor, introduce una correo válido.
          </p>

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            class="border w-full p-2 rounded mt-2"
          >
          <p id="password-error" class="mb-1 text-sm text-red-600 hidden">
                Por favor, introduce una contraseña válida.
              </p>
          <button id="login-btn"
            class="mt-3 hover:cursor-pointer bg-blue-600 text-white w-full py-2 rounded"
          >
            Ingresar
          </button>

        </form>

      </div>

    </div>
  `;
}

export function setupLogin(){


  const form = document.getElementById("loginForm")
  const emailInput = form.email
  const emailError = document.getElementById("email-error")
  const passwordInput = form.password
  const passwordError = document.getElementById("password-error");
  const loginBtn = document.getElementById("login-btn")
  if (
    !form ||
    !emailInput ||
    !passwordInput ||
    !emailError ||
    !passwordError
  )
    return;
  
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    loginBtn.click()
  })

  loginBtn.addEventListener("click", async (event) => {
    event.preventDefault()
    const emailValue = emailInput.value;
    const passwordValue = passwordInput.value;
    const isEmailValid = validateSync(emailInput, emailError, getEmailRules());
    const isPasswordValid = validateSync(passwordInput, passwordError, getPasswordRules());

    if (!isEmailValid || !isPasswordValid) return;

    try {
    const users = await userService.get();
    const hashedPassword = passwordValue;
    console.log(users);
    console.log(hashedPassword);
    
    

    const user = users.find((user) => user.email.toLowerCase() === emailValue.toLowerCase() && user.password === hashedPassword);

    if (!user) {
      showToast("Falló el inicio de sesión", "error", "Credenciales incorrectas");
      setButtonLoadingState(loginBtn, false, "", "Entrar al dashboard");
      return 
    }

    authService.setSession(user);
    showToast(`Bienvenido ${user.name}!`, "success");

    window.history.pushState({}, "", "/");
    renderRoute();
  } catch (error) {
    console.log(error);
    
    showToast("Error", "error", "Hubo un problema al iniciar sesión");
    setButtonLoadingState(loginBtn, false, "", "Entrar al dashboard");
  }
});

}