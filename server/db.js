/**
 * NexusChat — Módulo de Base de Datos (SQLite via sql.js)
 * Tablas: usuarios, salas, mensajes
 */

const initSqlJs = require('sql.js');
const fs        = require('fs');
const path      = require('path');

const DB_PATH = path.join(__dirname, '../data/nexuschat.db');

let db = null;

/**
 * Inicializa la base de datos. Crea el archivo si no existe.
 * Crea las tablas si no existen.
 */
async function init() {
  // Crear carpeta /data si no existe
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const SQL = await initSqlJs();

  // Cargar BD existente o crear nueva
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Crear tablas
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id        TEXT PRIMARY KEY,
      username  TEXT NOT NULL,
      email     TEXT,
      avatar    TEXT,
      color     TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS salas (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre    TEXT UNIQUE NOT NULL,
      creado_en TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id         TEXT PRIMARY KEY,
      sala       TEXT NOT NULL,
      usuario_id TEXT NOT NULL,
      username   TEXT NOT NULL,
      color      TEXT,
      avatar     TEXT,
      texto      TEXT NOT NULL,
      enviado_en TEXT NOT NULL
    )
  `);

  // Insertar salas por defecto
  db.run(`INSERT OR IGNORE INTO salas (nombre) VALUES ('general'), ('tech'), ('random')`);

  save();
  console.log('[DB] Base de datos lista:', DB_PATH);
}

/** Guarda el estado actual al archivo .db */
function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ─── Usuarios ─────────────────────────────────────────────────

/** Guarda o actualiza un usuario al hacer login */
function upsertUsuario({ id, username, email, avatar, color }) {
  db.run(
    `INSERT INTO usuarios (id, username, email, avatar, color)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET username=excluded.username, avatar=excluded.avatar`,
    [id, username, email || '', avatar || '', color || '']
  );
  save();
}

// ─── Mensajes ─────────────────────────────────────────────────

/** Guarda un mensaje en la BD */
function guardarMensaje({ id, sala, userId, username, color, avatar, text, timestamp }) {
  db.run(
    `INSERT OR IGNORE INTO mensajes (id, sala, usuario_id, username, color, avatar, texto, enviado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, sala, userId, username, color || '', avatar || '', text, timestamp]
  );
  save();
}

/** Obtiene los últimos N mensajes de una sala */
function getMensajes(sala, limite = 100) {
  const stmt = db.prepare(
    `SELECT * FROM mensajes WHERE sala = ? ORDER BY enviado_en DESC LIMIT ?`
  );
  stmt.bind([sala, limite]);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();

  // Devolver en orden cronológico y con formato estándar del chat
  return rows.reverse().map(r => ({
    type: 'chat_message',
    payload: {
      id:        r.id,
      userId:    r.usuario_id,
      username:  r.username,
      color:     r.color,
      avatar:    r.avatar,
      text:      r.texto,
      timestamp: r.enviado_en,
      room:      r.sala,
    },
  }));
}

module.exports = { init, upsertUsuario, guardarMensaje, getMensajes, save };
