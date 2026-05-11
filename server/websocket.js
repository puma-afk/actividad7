const WebSocket = require("ws");

const clients = new Set();

let guestCount = 1;

function broadcast(data) {

    const message = JSON.stringify(data);

    clients.forEach((client) => {

        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }

    });

}

function setupWebSocket(wss) {

    wss.on("connection", (ws) => {

        console.log("Cliente conectado");

        clients.add(ws);

        ws.on("message", (message) => {

            try {

                const data = JSON.parse(message);

                // Autenticación
                if (data.type === "auth") {

                    // Usuario invitado
                    if (data.guest === true) {

                        ws.username =
                            `Invitado_${guestCount++}`;

                    }

                    // Usuario con Google OAuth
                    else {

                        ws.username =
                            data.username || "Usuario";

                    }

                    console.log(
                        `${ws.username} autenticado`
                    );

                    broadcast({
                        type: "system",
                        text:
                            `${ws.username} se unió al chat`
                    });

                    return;
                }

                // Mensajes del chat
                if (data.type === "message") {

                    console.log(
                        `${ws.username}: ${data.text}`
                    );

                    broadcast({
                        type: "message",
                        username: ws.username,
                        text: data.text
                    });

                }

            } catch (error) {

                console.error(
                    "Error procesando mensaje:",
                    error
                );

            }

        });

        ws.on("close", () => {

            clients.delete(ws);

            if (ws.username) {

                broadcast({
                    type: "system",
                    text:
                        `${ws.username} salió del chat`
                });

            }

            console.log("Cliente desconectado");

        });

    });

}

module.exports = setupWebSocket;