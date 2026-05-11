import { loginUser } from "../services/userService.js";

export async function login(req, res) {

  try {

    const { email, password } = req.body;

    const data = await loginUser(email, password);

    res.json(data);

  } catch (error) {

    res.status(401).json({
      error: "Credenciales inválidas"
    });

  }
}