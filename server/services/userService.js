import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { findUserByEmail } from "../models/User.js";

function generateToken(user, provider = "local") {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET_NOT_DEFINED");
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      provider,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

export async function loginWithGoogle(user) {
  const token = generateToken(user, "google");

  return { token };
}