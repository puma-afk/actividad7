import { router } from "./utils/router.js";
// IMPORTAMOS TUS COMPONENTES
import { initUsersComponent } from "./components/users.js";
import { initNotificationsComponent } from "./components/notifications.js";

// Inicializar SPA
function initApp() {
    // Primera carga
    router();

    // INICIALIZAMOS TUS TAREAS (US-06 y US-09)
    // Estos IDs deben existir en el HTML de Noel (luego los revisamos)
    initUsersComponent('usuarios-conectados');
    initNotificationsComponent('notificaciones');

    // Manejar navegación
    window.addEventListener("popstate", router);
}

// Iniciar app
initApp();