import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { findUserByEmail } from "../models/User.js";

export async function loginUser(email, password) {

  // buscar usuario
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // comparar password
  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    throw new Error("INVALID_PASSWORD");
  }

  // generar token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}