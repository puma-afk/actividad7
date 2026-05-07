import { useState } from "react";
import { login, loginWithGoogle } from "../servicios/authService";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email, password);

      // guardar sesión (simulado)
      localStorage.setItem("auth", "true");
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login exitoso:", data);

      // aquí luego navegas a dashboard
      // navigate("/dashboard");

    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    try {
      setLoading(true);

      // 🔴 aquí normalmente viene el token de Google
      const fakeGoogleToken = "google-token-demo";

      const data = await loginWithGoogle(fakeGoogleToken);

      localStorage.setItem("auth", "true");
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login Google exitoso:", data);

    } catch (err) {
      setError("Error con Google Login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <form className="login-form" onSubmit={handleSubmit}>

        <h1>Login</h1>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Entrar"}
        </button>

        <div className="divider">
          <span>o</span>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continuar con Google
        </button>

      </form>

    </div>
  );
}

export default Login;