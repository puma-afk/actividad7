# NexusChat 💬

**Sistema de Chat Colaborativo en Tiempo Real — WebSocket + Google OAuth 2.0**

Chat corporativo con Node.js, Express, WebSocket nativo y autenticación mediante Google OAuth 2.0. Solo usuarios autenticados con su cuenta de Google pueden acceder al chat.

---

## Características

- **Autenticación con Google** — login seguro con cuenta Google (IAM corporativo)
- **WebSocket puro** — sin polling, comunicación bidireccional persistente
- **Foto de perfil de Google** — avatar real del usuario, no iniciales aleatorias
- **Múltiples conexiones simultáneas** — todos reciben mensajes al instante
- **Historial** — últimos 100 mensajes por sala al unirse
- **Múltiples salas** — `#general`, `#tech`, `#random`
- **Notificaciones de entrada/salida** a todos los clientes
- **Indicador de escritura** en tiempo real
- **Protección del WebSocket** — rechaza conexiones sin sesión válida (HTTP 401)
- **Reconexión automática** del cliente si se pierde la conexión

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Servidor HTTP | Node.js + Express |
| Autenticación | Passport.js + Google OAuth 2.0 |
| Sesiones | express-session |
| WebSocket | `ws` v8 |
| IDs únicos | `uuid` v9 |
| Cliente | HTML5 + CSS3 + JavaScript Vanilla |

---

## Requisitos

- Node.js v18+
- npm v9+
- Cuenta de Google y acceso a [Google Cloud Console](https://console.cloud.google.com)

---


## Paso 1 — Configurar variables de entorno

```bash
git clone https://github.com/tu-equipo/nexus-chat.git
cd nexus-chat
cp .env.example .env
```

Edita `.env`:

```env
GOOGLE_CLIENT_ID=811285540411-d5rhcpmtudesiartcgr0r7g0hm79uv1b.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=SESSION_SECRET=nexuschat2024_clave_super_secreta_abc123xyz
PORT=3000
BASE_URL=http://localhost:3000
```

---

## Paso 2 — Instalar y ejecutar

```bash
npm install
npm start
# → http://localhost:3000
```

El servidor redirige automáticamente al login de Google si no hay sesión activa.

---

## Flujo de autenticación

```
GET /               → sin sesión → redirect /login
GET /login          → página con botón "Continuar con Google"
GET /auth/google    → redirect a Google OAuth
GET /auth/google/callback  ← Google devuelve el código
                    → Passport valida, crea sesión
                    → redirect /  (chat)

ws://localhost:3000 → servidor valida req.user antes de aceptar
                    → sin sesión: HTTP 401, socket destruido
```

---

## Estructura del proyecto

```
nexus-chat/
├── server/
│   └── index.js          # WebSocket + Express + Google OAuth
├── public/
│   ├── login.html         # Página de login (pública)
│   ├── index.html         # Chat SPA (protegido)
│   ├── css/style.css
│   └── js/chat.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Tipos de mensajes WebSocket

**Cliente → Servidor**

| Tipo | Descripción |
|------|-------------|
| `chat_message` | Enviar texto |
| `join_room` | Cambiar de sala |
| `typing` | Indicador de escritura |

**Servidor → Cliente**

| Tipo | Descripción |
|------|-------------|
| `welcome` | Datos del usuario + historial + lista de usuarios |
| `chat_message` | Nuevo mensaje |
| `system` | Notificación (entrada/salida) |
| `users_update` | Lista de usuarios actualizada |
| `room_joined` | Historial de nueva sala |
| `typing` | Alguien está escribiendo |

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `GOOGLE_CLIENT_ID` | si | Client ID de Google OAuth |
| `GOOGLE_CLIENT_SECRET` | si | Client Secret de Google OAuth |
| `SESSION_SECRET` | si | Secreto para firmar cookies |
| `PORT` | No | Puerto (default: 3000) |
| `BASE_URL` | No | URL base (default: http://localhost:3000) |

---

