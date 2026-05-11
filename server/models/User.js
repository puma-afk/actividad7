import { db } from "../config/database.js";

export async function findUserByEmail(email) {
  return await db.get(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
}

export async function findUserByNombre(nombre) {
  return await db.get(
    "SELECT * FROM users WHERE name = ?",
    [nombre]
  );
}

export async function createUser(name, email, password) {
  return await db.run(
    `
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
    `,
    [name, email, password]
  );
}