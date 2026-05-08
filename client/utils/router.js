import { renderLogin } from "../components/login.js";
import { renderDashboard } from "../components/dashboard.js";


const routes = {
  "/": renderLogin,
  "/login": renderLogin,
  "/dashboard": renderDashboard,

};

// rutas protegidas
const protectedRoutes = ["/dashboard"];

export function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

export function router() {
  const path = window.location.pathname;

  const isAuth = localStorage.getItem("auth") === "true";

  // protección de rutas
  if (protectedRoutes.includes(path) && !isAuth) {
    navigate("/login");
    return;
  }

  const view = routes[path];

  if (view) {
    view();
  } else {
    document.getElementById("app").innerHTML = "<h1>404</h1>";
  }
}

window.addEventListener("popstate", router);

// inicializar SPA
router();