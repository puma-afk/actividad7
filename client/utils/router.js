import { renderLogin } from "../components/login.js";
import { renderDashboard } from "../components/dashboard.js";

const routes = {
  "/": renderLogin,
  "/login": renderLogin,
  "/dashboard": renderDashboard,
};

const protectedRoutes = ["/dashboard"];

export function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

export function router() {
  const path = window.location.pathname;

  // Verificar token en URL (callback de Google)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  if (tokenFromUrl) {
    localStorage.setItem("token", tokenFromUrl);
    window.history.replaceState({}, "", "/dashboard");
    navigate("/dashboard");
    return;
  }

  const token = localStorage.getItem("token");
  const isAuth = token !== null;

  if (protectedRoutes.includes(path) && !isAuth) {
    navigate("/login");
    return;
  }

  if ((path === "/" || path === "/login") && isAuth) {
    navigate("/dashboard");
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