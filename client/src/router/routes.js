import { renderLogin, setupLogin } from "../views/auth/login";
import { renderHome, setupHome } from "../views/home";
import { renderNotFound, setupNotFound } from "../views/notFound";


export const ROUTES = {
  "/": {
    title: "Home",
    renderView: renderHome,
    initSetup: setupHome,
    requireAuth: true,
    redirectIfAuth: true,
    allowedRoles: ["admin", "user"]
  },
  "/login": {
    title: "Login",
    renderView: renderLogin,
    initSetup: setupLogin,
    requireAuth: false,
    allowedRoles: ["admin", "user"]
  },
  // "/register": {
  //   title: "Register",
  //   renderView: renderRegister,
  //   initSetup: setupRegister,
  //   requireAuth: false,
  //   redirectIfAuth: true,
  //   allowedRoles: ["admin", "user"]
  // },
  // "/dashboard": {
  //   title: "Dashboard | TaskFlowSPA",
  //   renderView: renderDashboard,
  //   initSetup: setupDashboard,
  //   requireAuth: true,
  //   allowedRoles: ["admin", "user"]
  // },
  // "/tasks": {
  //   title: "Mis tareas | TaskFlowSPA",
  //   renderView: renderTasks,
  //   initSetup: setupTasks,
  //   requireAuth: true,
  //   allowedRoles: ["admin", "user"]
  // },
  // "/tasks/new": {
  //   title: "Formulario de tarea | TaskFlowSPA",
  //   renderView: renderNewTask,
  //   initSetup: setupNewTask,
  //   requireAuth: true,
  //   allowedRoles: ["admin", "user"]
  // },
  // "/profile": {
  //   title: "Perfil | TaskFlowSPA",
  //   renderView: renderProfile,
  //   initSetup: setupProfile,
  //   requireAuth: true,
  //   allowedRoles: ["admin", "user"]
  // },
  // "/admin": {
  //   title: "Panel administrativo | TaskFlowSPA",
  //   renderView: renderAdmin,
  //   initSetup: setupAdmin,
  //   requireAuth: true,
  //   allowedRoles: ["admin"]
  // },
  "/404": {
    title: "Página no encontrada | TaskFlowSPA",
    renderView: renderNotFound,
    initSetup: setupNotFound,
    requireAuth: false,
    allowedRoles: ["admin", "user"]
  },
};