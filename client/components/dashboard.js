import { navigate } from "../utils/router.js";

export function renderDashboard() {
  const app = document.getElementById("app");

  // obtener usuario
  const user = JSON.parse(localStorage.getItem("user"));

  app.innerHTML = `
    <div class="dashboard-container">

      <h1>Dashboard</h1>

      <p>Bienvenido 👋</p>

      <div class="user-card">
        <p><b>Email:</b> ${user?.email || "No disponible"}</p>
      </div>

      <button id="logoutBtn">Cerrar sesión</button>

    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    // limpiar sesión
    localStorage.removeItem("auth");
    localStorage.removeItem("user");

    // usar router (NO window.location)
    navigate("/login");
  });
}
