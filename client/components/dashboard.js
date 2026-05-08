import { navigate } from "../utils/router.js";
import { connectWebSocket, sendMessage, disconnectWebSocket } from "../services/websocket.js";
import { appendMessage } from "./messages.js";

export function renderDashboard() {
  const app = document.getElementById("app");
  const user = JSON.parse(localStorage.getItem("user"));

  app.innerHTML = `
    <div class="dashboard-container">

      <div class="sidebar">
        <h2>SyncTalk 💬</h2>
        <div class="user-info">
          <p><b>${user?.email || "Usuario"}</b></p>
        </div>
        <button id="logoutBtn">Cerrar sesión</button>
      </div>

      <div class="chat-container">
        <div class="chat-header">
          <h3>Chat General</h3>
        </div>
        <div class="messages-box" id="messagesBox"></div>
        <div class="chat-input-area">
          <input id="msgInput" placeholder="Escribe un mensaje..." />
          <button id="sendBtn">Enviar</button>
        </div>
      </div>

    </div>
  `;

  const messagesBox = document.getElementById("messagesBox");
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  // conectar WebSocket
  connectWebSocket((text) => {
    appendMessage(messagesBox, text, false);
  });

  // enviar mensaje
  sendBtn.addEventListener("click", () => {
    const text = msgInput.value.trim();
    if (!text) return;
    appendMessage(messagesBox, text, true);
    sendMessage(text);
    msgInput.value = "";
  });

  // enviar con Enter
  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  // logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    disconnectWebSocket();
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    navigate("/login");
  });
}