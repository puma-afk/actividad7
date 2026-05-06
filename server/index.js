const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const setupWebSocket = require("./ws/handler");

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

setupWebSocket(wss);

app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});

server.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});