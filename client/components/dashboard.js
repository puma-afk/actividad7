import { getProfile }
  from "../services/auth.js";

export async function renderDashboard() {

  const app =
    document.getElementById("app");

  const token =
    localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  try {

    const data =
      await getProfile();

    app.innerHTML = `
      <div>

        <h1>Dashboard</h1>

        <p>
          Bienvenido
          ${data.user.name}
        </p>

      </div>
    `;

  } catch (error) {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");

  }
}
