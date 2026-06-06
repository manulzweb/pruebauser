import { renderLogin, setupLogin } from "../views/auth/login";
import { renderRegister, setupRegister } from "../views/auth/register";
import { renderHome, setupHome } from "../views/home";
import { renderNotFound, setupNotFound } from "../views/notFound";
import { renderDashboard, setupDashboard } from "../views/dashboard";
import { renderMovies, setupMovies } from "../views/movies/index";
import { renderNewMovie, setupNewMovie } from "../views/movies/new";
import { renderProfile, setupProfile } from "../views/profile";
import { renderAdmin, setupAdmin } from "../views/admin";

export const ROUTES = {
  "/": {
    title: "Home",
    renderView: renderHome,
    initSetup: setupHome,
    requireAuth: true,
    redirectIfAuth: false,
    allowedRoles: ["admin", "user"]
  },
  "/login": {
    title: "Login",
    renderView: renderLogin,
    initSetup: setupLogin,
    requireAuth: false,
    redirectIfAuth: true,
    allowedRoles: ["admin", "user"]
  },
  "/register": {
    title: "Register",
    renderView: renderRegister,
    initSetup: setupRegister,
    requireAuth: false,
    redirectIfAuth: true,
    allowedRoles: ["admin", "user"]
  },
  "/dashboard": {
    title: "Dashboard | MovieSPA",
    renderView: renderDashboard,
    initSetup: setupDashboard,
    requireAuth: true,
    allowedRoles: ["admin", "user"]
  },
  "/movies": {
    title: "Mis películas | MovieSPA",
    renderView: renderMovies,
    initSetup: setupMovies,
    requireAuth: true,
    allowedRoles: ["admin", "user"]
  },
  "/movies/new": {
    title: "Nueva película | MovieSPA",
    renderView: renderNewMovie,
    initSetup: setupNewMovie,
    requireAuth: true,
    allowedRoles: ["admin"]
  },
  "/profile": {
    title: "Perfil | MovieSPA",
    renderView: renderProfile,
    initSetup: setupProfile,
    requireAuth: true,
    allowedRoles: ["admin", "user"]
  },
  "/admin": {
    title: "Panel administrativo | MovieSPA",
    renderView: renderAdmin,
    initSetup: setupAdmin,
    requireAuth: true,
    allowedRoles: ["admin"]
  },
  "/404": {
    title: "Página no encontrada | MovieSPA",
    renderView: renderNotFound,
    initSetup: setupNotFound,
    requireAuth: false,
    allowedRoles: ["admin", "user"]
  },
};