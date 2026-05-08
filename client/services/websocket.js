let socket = null;

export function connectWebSocket(onMessage) {
  socket = new WebSocket("ws://localhost:3000");

  socket.onopen = () => {
    console.log("Conectado al servidor WebSocket");
  };

  socket.onmessage = (event) => {
    onMessage(event.data);
  };

  socket.onclose = () => {
    console.log("Desconectado del WebSocket");
  };
}

export function sendMessage(message) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}

export function disconnectWebSocket() {
  if (socket) socket.close();
}