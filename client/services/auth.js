export async function login(email, password) {

  const response = await fetch(
    "http://localhost:3000/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  if (!response.ok) {
    throw new Error("Login error");
  }

  return await response.json();
}

export async function getProfile() {

  const token =
    localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:3000/profile",
    {
      headers: {
        Authorization:
          `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return await response.json();
}

export async function google(){
  window.location.href = "http://localhost:3000/auth/google";
}