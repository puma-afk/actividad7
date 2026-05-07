const API_URL = "http://localhost:3000"; 
// luego esto será tu backend real

// LOGIN normal
export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    throw new Error("Error en login");
  }

  return await response.json();
}

// REGISTER (si lo necesitas después)
export async function register(email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return await response.json();
}

// LOGIN con Google (solo frontend placeholder por ahora)
export async function loginWithGoogle(token) {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token })
  });

  return await response.json();
}