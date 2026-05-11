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

        <button id="googleBtn">Continaur con Google</button>
        <button id="loginsinBtn">Entrar sin login </button>
        <p id="error"></p>
      </div>
    </div>
  `;

  const btn = document.getElementById("loginBtn");
  const btnsin = document.getElementById("loginsinBtn")
  const error = document.getElementById("error");
  const googleBtn = document.getElementById("googleBtn");
  googleBtn.addEventListener("click", () => {
  google();
});

  btn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      
      // guardar sesión
      const data = await login(email, password);

      localStorage.setItem("token", data.token);

      localStorage.setItem(
      "user",
      JSON.stringify(data.user)
      );
      

      // redirigir SPA
      navigate("/dashboard");
      window.dispatchEvent(new PopStateEvent("popstate"));

    } catch (err) {
      error.textContent = "Credenciales inválidas";
    }
  });

  //btnsin.addEventListener("click", () =>{

  //});
}