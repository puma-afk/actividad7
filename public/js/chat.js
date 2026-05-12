/**
 * NexusChat — Cliente WebSocket
 * Con soporte para avatares de Google y logout
 */

'use strict';

const state = {
  ws:       null,
  userId:   null,
  username: null,
  color:    null,
  avatar:   null,   // URL de la foto de Google
  room:     'general',
  reconnectTimer: null,
};

const $  = (id) => document.getElementById(id);
const el = {
  app:            $('app'),
  wsStatus:       $('wsStatus'),
  roomList:       $('roomList'),
  userList:       $('userList'),
  onlineCount:    $('onlineCount'),
  ownAvatar:      $('ownAvatar'),
  ownUsername:    $('ownUsername'),
  memberCount:    $('memberCount'),
  roomTitle:      $('roomTitle'),
  messagesContainer: $('messagesContainer'),
  messagesInner:     $('messagesInner'),
  typingIndicator:   $('typingIndicator'),
  msgInput:       $('msgInput'),
  sendBtn:        $('sendBtn'),
};

// ─── Utilidades ───────────────────────────────────────────────
function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function initials(name) {
  return name.split(/[\s_-]+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function scrollBottom(force = false) {
  const c = el.messagesContainer;
  const atBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 120;
  if (force || atBottom) c.scrollTop = c.scrollHeight;
}

// ─── Renderizado de avatar ────────────────────────────────────
// Si el usuario tiene foto de Google la usamos; si no, mostramos iniciales con color

function avatarHTML(username, color, avatarUrl, size = 34) {
  if (avatarUrl) {
    return `<img
      src="${escapeHtml(avatarUrl)}"
      alt="${escapeHtml(username)}"
      style="width:${size}px;height:${size}px;border-radius:8px;object-fit:cover;flex-shrink:0;"
      onerror="this.outerHTML=fallbackAvatar('${escapeHtml(username)}','${color}',${size})"
    />`;
  }
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${color}">
    ${initials(username)}
  </div>`;
}

// ─── Renderizado de mensajes ──────────────────────────────────
function buildSystemMsg(payload) {
  const div = document.createElement('div');
  div.className = 'msg-system';
  div.innerHTML = `<span>${escapeHtml(payload.text)} · ${fmtTime(payload.timestamp)}</span>`;
  return div;
}

function buildChatMsg(payload, own) {
  const div = document.createElement('div');
  div.className = `msg${own ? ' msg-own' : ''}`;
  div.dataset.msgId = payload.id;

  const av = avatarHTML(payload.username, payload.color, payload.avatar);

  div.innerHTML = `
    ${av}
    <div class="msg-body">
      <div class="msg-header">
        <span class="msg-author">${escapeHtml(payload.username)}</span>
        <span class="msg-time">${fmtTime(payload.timestamp)}</span>
      </div>
      <div class="msg-text">${escapeHtml(payload.text)}</div>
    </div>`;
  return div;
}

function appendMsg(type, payload) {
  const own  = type === 'chat_message' && payload.userId === state.userId;
  const node = type === 'system' ? buildSystemMsg(payload) : buildChatMsg(payload, own);

  node.style.cssText = 'opacity:0;transform:translateY(6px)';
  el.messagesInner.appendChild(node);
  requestAnimationFrame(() => {
    node.style.cssText = 'transition:opacity .2s ease,transform .2s ease;opacity:1;transform:translateY(0)';
  });
  scrollBottom();
}

function loadHistory(history) {
  el.messagesInner.innerHTML = '';
  history.forEach(({ type, payload }) => {
    if (type === 'system' || type === 'chat_message') {
      const own  = type === 'chat_message' && payload.userId === state.userId;
      const node = type === 'system' ? buildSystemMsg(payload) : buildChatMsg(payload, own);
      el.messagesInner.appendChild(node);
    }
  });
  scrollBottom(true);
}

// ─── Lista de usuarios ────────────────────────────────────────
function renderUsers(users) {
  el.onlineCount.textContent = users.length;
  el.memberCount.textContent = `${users.length} miembro${users.length !== 1 ? 's' : ''}`;
  el.userList.innerHTML = users.map(u => {
    const isMe = u.id === state.userId;
    const pic  = u.avatar
      ? `<img src="${escapeHtml(u.avatar)}" style="width:22px;height:22px;border-radius:5px;object-fit:cover;flex-shrink:0;" />`
      : `<span class="user-badge"></span>`;
    return `<li class="user-item">
      ${pic}
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        ${escapeHtml(u.username)}${isMe ? ' <b style="color:#6366f1;font-size:11px">(tú)</b>' : ''}
      </span>
    </li>`;
  }).join('');
}

// ─── Perfil propio ────────────────────────────────────────────
function updateOwnProfile(username, color, avatar) {
  el.ownUsername.textContent = username;
  if (avatar) {
    el.ownAvatar.innerHTML = '';
    el.ownAvatar.style.background = 'transparent';
    const img = document.createElement('img');
    img.src = avatar;
    img.style.cssText = 'width:100%;height:100%;border-radius:8px;object-fit:cover;';
    el.ownAvatar.appendChild(img);
  } else {
    el.ownAvatar.textContent    = initials(username);
    el.ownAvatar.style.background = color;
  }
}

// ─── Indicador de escritura ───────────────────────────────────
let typingTimer = null;
function showTyping(username) {
  el.typingIndicator.innerHTML = `
    ${escapeHtml(username)} está escribiendo
    <span class="typing-dots"><span></span><span></span><span></span></span>`;
  el.typingIndicator.classList.remove('hidden');
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => el.typingIndicator.classList.add('hidden'), 2500);
  scrollBottom();
}

// ─── Estado conexión WS ───────────────────────────────────────
function setConnected(connected) {
  el.wsStatus.className = `ws-pill ${connected ? 'connected' : 'disconnected'}`;
  el.wsStatus.innerHTML = `<span class="ws-dot"></span> WS`;
}

// ─── WebSocket ────────────────────────────────────────────────
function getWsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}`;
}

function connect() {
  if (state.ws) { state.ws.onclose = null; state.ws.close(); }
  clearTimeout(state.reconnectTimer);

  const ws = new WebSocket(getWsUrl());
  state.ws = ws;

  ws.onopen  = () => { setConnected(true); };
  ws.onerror = ()  => { setConnected(false); };
  ws.onclose = ()  => {
    setConnected(false);
    state.reconnectTimer = setTimeout(connect, 3000);
  };
  ws.onmessage = ({ data }) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }
    handleMessage(msg);
  };
}

function handleMessage({ type, payload }) {
  switch (type) {
    case 'welcome':
      state.userId   = payload.userId;
      state.username = payload.username;
      state.color    = payload.color;
      state.avatar   = payload.avatar;
      state.room     = payload.room;
      updateOwnProfile(state.username, state.color, state.avatar);
      renderUsers(payload.users);
      loadHistory(payload.history);
      el.app.classList.remove('hidden');
      break;

    case 'chat_message':
      appendMsg('chat_message', payload);
      break;

    case 'system':
      appendMsg('system', payload);
      break;

    case 'users_update':
      renderUsers(payload.users);
      break;

    case 'room_joined':
      state.room = payload.room;
      setActiveRoom(payload.room);
      loadHistory(payload.history);
      renderUsers(payload.users);
      break;

    case 'typing':
      if (payload.userId !== state.userId) showTyping(payload.username);
      break;

    case 'error':
      alert(payload.text);
      break;
  }
}

function send(data) {
  if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(data));
}

// ─── Envío de mensajes ────────────────────────────────────────
function sendMessage() {
  const text = el.msgInput.innerText.trim();
  if (!text) return;
  send({ type: 'chat_message', payload: { text } });
  el.msgInput.innerHTML = '';
  el.msgInput.focus();
}

let typingSent = false;
el.msgInput.addEventListener('input', () => {
  if (!typingSent) {
    send({ type: 'typing' });
    typingSent = true;
    setTimeout(() => { typingSent = false; }, 1200);
  }
});
el.msgInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
el.sendBtn.addEventListener('click', sendMessage);

// ─── Cambio de sala ───────────────────────────────────────────
function setActiveRoom(roomId) {
  el.roomTitle.textContent = roomId;
  el.msgInput.dataset.placeholder = `Mensaje en #${roomId}…`;
  document.querySelectorAll('.nav-item').forEach(li =>
    li.classList.toggle('active', li.dataset.room === roomId)
  );
}

el.roomList.addEventListener('click', (e) => {
  const item = e.target.closest('.nav-item');
  if (!item || item.dataset.room === state.room) return;
  send({ type: 'join_room', payload: { room: item.dataset.room } });
});

// ─── Logout ───────────────────────────────────────────────────
$('logoutBtn')?.addEventListener('click', () => {
  location.href = '/logout';
});

// ─── Arrancar ─────────────────────────────────────────────────
connect();
