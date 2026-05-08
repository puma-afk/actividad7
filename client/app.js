import { router } from "./utils/router.js";

const socket = new WebSocket('ws://localhost:3000');
const mensajesDiv = document.getElementById('mensajes');
const notificacionesDiv = document.getElementById('notificaciones');
const usuariosLista = document.getElementById('usuarios-conectados');
const inputMensaje = document.getElementById('input-mensaje');
const botonEnviar = document.getElementById('btn-enviar');

let nombreUsuario = 'Usuario_' + Math.floor(Math.random() * 10000);

function initApp() {
  router();
  window.addEventListener("popstate", router);
  inicializarEventos();
}

socket.onopen = () => {
    console.log('Connected to WS server');
};

socket.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
            renderMessage(data.username, data.text, data.timestamp);
        } else if (data.type === 'join') {
            renderNotification(data.username + " joined", 'join');
        } else if (data.type === 'leave') {
            renderNotification(data.username + " left", 'leave');
        } else if (data.type === 'users') {
            updateUserList(data.users);
        }
    } catch(e) {
        console.error('Error processing message:', e);
    }
};

function renderMessage(username, text, timestamp) {
    if (!mensajesDiv) return;
    const mensaje = document.createElement('div');
    mensaje.className = 'mensaje-item';
    const hora = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
    
    mensaje.innerHTML = '<strong>' + escapeHtml(username) + '</strong> <small>' + hora + '</small><div>' + escapeHtml(text) + '</div>';
    
    mensajesDiv.appendChild(mensaje);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}

function renderNotification(text, type) {
    if (!notificacionesDiv) return;
    const note = document.createElement('div');
    note.className = 'notification ' + type;
    note.textContent = text;
    notificacionesDiv.appendChild(note);
    setTimeout(() => { note.remove(); }, 4000);
}

function updateUserList(users) {
    if (!usuariosLista) return;
    usuariosLista.innerHTML = '<h4>Online</h4>';
    users.forEach(user => {
        const item = document.createElement('div');
        item.textContent = '• ' + user;
        usuariosLista.appendChild(item);
    });
}

function sendMessage() {
    if (!inputMensaje) return;
    const text = inputMensaje.value.trim();
    if (text === '') return;

    socket.send(JSON.stringify({
        type: 'message',
        username: nombreUsuario,
        text: text,
        timestamp: new Date().toISOString()
    }));
    inputMensaje.value = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function inicializarEventos() {
    if (botonEnviar) {
        botonEnviar.addEventListener('click', sendMessage);
    }
    if (inputMensaje) {
        inputMensaje.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

initApp();