import { getDb } from "../config/database.js";

export async function findUserByEmail(email) {
  const db = getDb();
  return await db.get("SELECT * FROM users WHERE email = ?", [email]);
}

export async function findUserByGoogleId(googleId) {
  const db = getDb();
  return await db.get("SELECT * FROM users WHERE googleId = ?", [googleId]);
}

export async function findUserById(id) {
  const db = getDb();
  return await db.get("SELECT id, name, email FROM users WHERE id = ?", [id]);
}

export async function findUserByNombre(nombre) {
  const db = getDb();
  return await db.get("SELECT * FROM users WHERE name = ?", [nombre]);
}

export async function createUser(name, email, password) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
    [name, email, password]
  );
  return { id: result.lastID, name, email };
}

export async function createUserWithGoogle(googleId, name, email) {
  const db = getDb();
  const result = await db.run(
    `INSERT INTO users (name, email, googleId) VALUES (?, ?, ?)`,
    [name, email, googleId]
  );
  return { id: result.lastID, name, email, googleId };
}

export async function findOrCreateByGoogleId(googleId, name, email) {
  let user = await findUserByGoogleId(googleId);
  
  if (!user) {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      const db = getDb();
      await db.run(`UPDATE users SET googleId = ? WHERE id = ?`, [googleId, existingUser.id]);
      user = { ...existingUser, googleId };
    } else {
      user = await createUserWithGoogle(googleId, name, email);
    }
  }
  return user;
}

export async function getAllUsers() {
  const db = getDb();
  return await db.all("SELECT id, name, email FROM users ORDER BY name ASC");
}