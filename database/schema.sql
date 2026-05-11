/*Tabla usuarios*/
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  googleId TEXT UNIQUE
);