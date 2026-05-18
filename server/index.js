require('dotenv').config();

/**
 * NEXUS CHAT — Servidor Principal
 * WebSocket + Google OAuth 2.0 + Invitado + SQLite
 */

const express        = require('express');
const http           = require('http');
const WebSocket      = require('ws');
const session        = require('express-session');
const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path           = require('path');
const { v4: uuidv4 } = require('uuid');
const db             = require('./db');

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     || 'TU_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'TU_GOOGLE_CLIENT_SECRET';
const SESSION_SECRET       = process.env.SESSION_SECRET       || 'nexuschat_secreto';
const PORT                 = process.env.PORT                 || 3000;
const BASE_URL             = process.env.BASE_URL             || `http://localhost:${PORT}`;

// ─── Estado en memoria ────────────────────────────────────────
const rooms = new Map();

function ensureRoom(id) {
  if (!rooms.has(id)) rooms.set(id, { clients: new Map() });
  return rooms.get(id);
}
['general', 'tech', 'random'].forEach(ensureRoom);

const COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7'];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const genUsername = () => `Usuario_${Math.random().toString(36).slice(2,6).toUpperCase()}`;

function sendTo(ws, data) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
}
function broadcast(roomId, data, skip = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.clients.forEach((_, ws) => { if (ws !== skip) sendTo(ws, data); });
}
function userList(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return [...room.clients.values()].map(({ id, username, color, avatar }) => ({ id, username, color, avatar }));
}

// ─── Express ──────────────────────────────────────────────────
const app = express();

const sessionMiddleware = session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// ─── Google OAuth ─────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL:  `${BASE_URL}/auth/google/callback`,
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id:       profile.id,
      username: profile.displayName,
      email:    profile.emails?.[0]?.value || '',
      avatar:   profile.photos?.[0]?.value || null,
      color:    randomColor(),
      isGuest:  false,
    };
    db.upsertUsuario(user);
    console.log(`[AUTH] Google: ${user.username} (${user.email})`);
    return done(null, user);
  }
));

passport.serializeUser((user, done)   => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// ─── Rutas públicas ───────────────────────────────────────────
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Inicio OAuth Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback Google
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=1' }),
  (req, res) => { res.redirect('/'); }
);

// ── Ruta de invitado ──────────────────────────────────────────
app.get('/auth/guest', (req, res) => {
  const nombre = (req.query.name || '').trim().slice(0, 24);
  const user   = {
    id:       `guest_${uuidv4()}`,          // ID único temporal
    username: nombre || genUsername(),       // Nombre o auto-generado
    email:    '',
    avatar:   null,
    color:    randomColor(),
    isGuest:  true,
  };
  console.log(`[AUTH] Invitado: ${user.username}`);
  req.login(user, (err) => {
    if (err) return res.redirect('/login?error=1');
    res.redirect('/');
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.error('[AUTH] Error logout:', err);
    res.redirect('/login');
  });
});

app.get('/api/me', requireAuth, (req, res) => {
  const { id, username, email, avatar, color, isGuest } = req.user;
  res.json({ id, username, email, avatar, color, isGuest });
});

// Estáticos CSS y JS
app.use('/css', express.static(path.join(__dirname, '../public/css')));
app.use('/js',  express.static(path.join(__dirname, '../public/js')));

// Raíz protegida
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── Servidor HTTP + WebSocket ────────────────────────────────
const server = http.createServer(app);
const wss    = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  sessionMiddleware(req, {}, () => {
    passport.initialize()(req, {}, () => {
      passport.session()(req, {}, () => {
        if (!req.user) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      });
    });
  });
});

wss.on('connection', (ws, req) => {
  const u        = req.user;
  const userId   = u.id;
  const username = u.username;
  const color    = u.color;
  const avatar   = u.avatar;
  const isGuest  = u.isGuest;
  let   roomId   = 'general';

  console.log(`[CONNECT] ${username} (${isGuest ? 'invitado' : 'Google'})`);

  ensureRoom(roomId).clients.set(ws, { id: userId, username, color, avatar, isGuest });

  const history = db.getMensajes(roomId, 100);

  sendTo(ws, {
    type: 'welcome',
    payload: { userId, username, color, avatar, isGuest, room: roomId, history, users: userList(roomId) },
  });

  const joinMsg = {
    type: 'system',
    payload: { text: `${username}${isGuest ? ' (invitado)' : ''} se unió al chat`, timestamp: new Date().toISOString(), room: roomId },
  };
  broadcast(roomId, joinMsg, ws);
  broadcast(roomId, { type: 'users_update', payload: { users: userList(roomId) } });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const { type, payload } = msg;

    if (type === 'chat_message') {
      const text = (payload?.text || '').trim();
      if (!text) return;
      const info      = rooms.get(roomId)?.clients.get(ws);
      const msgId     = uuidv4();
      const timestamp = new Date().toISOString();

      // Solo guardar en BD si no es invitado
      if (!isGuest) {
        db.guardarMensaje({
          id: msgId, sala: roomId, userId,
          username: info?.username || username,
          color:    info?.color    || color,
          avatar:   info?.avatar   || avatar,
          text, timestamp,
        });
      }

      broadcast(roomId, {
        type: 'chat_message',
        payload: {
          id: msgId, userId,
          username: info?.username || username,
          color:    info?.color    || color,
          avatar:   info?.avatar   || avatar,
          text, timestamp, room: roomId, isGuest,
        },
      });

    } else if (type === 'join_room') {
      const newRoom = (payload?.room || '').trim().toLowerCase();
      if (!newRoom || newRoom === roomId) return;

      const oldRoomData = rooms.get(roomId);
      if (oldRoomData) {
        const info = oldRoomData.clients.get(ws);
        oldRoomData.clients.delete(ws);
        broadcast(roomId, { type: 'system', payload: { text: `${info?.username || username} salió de la sala`, timestamp: new Date().toISOString(), room: roomId } });
        broadcast(roomId, { type: 'users_update', payload: { users: userList(roomId) } });
      }

      roomId = newRoom;
      ensureRoom(roomId).clients.set(ws, { id: userId, username, color, avatar, isGuest });

      const newHistory = db.getMensajes(roomId, 100);
      sendTo(ws, { type: 'room_joined', payload: { room: roomId, history: newHistory, users: userList(roomId) } });

      broadcast(roomId, { type: 'system', payload: { text: `${username} se unió a la sala`, timestamp: new Date().toISOString(), room: roomId } }, ws);
      broadcast(roomId, { type: 'users_update', payload: { users: userList(roomId) } });

    } else if (type === 'typing') {
      broadcast(roomId, { type: 'typing', payload: { userId, username } }, ws);
    }
  });

  ws.on('close', () => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.clients.delete(ws);
    broadcast(roomId, { type: 'system', payload: { text: `${username} salió del chat`, timestamp: new Date().toISOString(), room: roomId } });
    broadcast(roomId, { type: 'users_update', payload: { users: userList(roomId) } });
    console.log(`[DISCONNECT] ${username}`);
  });

  ws.on('error', (err) => console.error(`[WS ERROR] ${err.message}`));
});

// ─── Arrancar ─────────────────────────────────────────────────
db.init().then(() => {
  server.listen(PORT, () => {
    console.log(`\n  NexusChat corriendo en ${BASE_URL}`);
    console.log(`  Google OAuth → ${BASE_URL}/auth/google\n`);
  });
}).catch(err => {
  console.error('[DB] Error:', err);
  process.exit(1);
});