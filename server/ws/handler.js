const clients = require("./rooms");

module.exports = (wss) => {
    wss.on("connection", (ws) => {
        console.log("Cliente conectado");

        clients.add(ws);

        ws.on("message", (message) => {
            clients.broadcast(message.toString());
        });

        ws.on("close", () => {
            clients.remove(ws);
        });

        ws.send("Bienvenido 🚀");
    });
};