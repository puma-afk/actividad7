
import { router } from "./utils/router.js";

// inicializar SPA
function initApp() {
  // primera carga
  router();

  // manejar navegación del navegador (back/forward)
  window.addEventListener("popstate", router);
}

// iniciar app
initApp();