import { login, google } from "../services/auth.js";
import { navigate } from "../utils/router.js";

export function renderLogin() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="login-container">
      <div>
        <h1>Login</h1>

        <input id="email" placeholder="Email" />
        <input id="password" type="password" placeholder="Password" />

        <button id="loginBtn">Entrar</button>

        <button id="googleBtn">Google</button>

        <p id="error"></p>
      </div>
    </div>
  `;

  const btn = document.getElementById("loginBtn");
  const error = document.getElementById("error");
  const googleBtn = document.getElementById("googleBtn");
  googleBtn.addEventListener("click", () => {
  google();
});

  btn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const user = await login(email, password);

      // guardar sesión
      localStorage.setItem("auth", "true");
      localStorage.setItem("user", JSON.stringify(user));

      // redirigir SPA
      navigate("/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));

    } catch (err) {
      error.textContent = "Credenciales inválidas";
    }
  });
}