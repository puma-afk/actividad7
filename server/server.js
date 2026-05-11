const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const setupWebSocket = require("./websocket");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

setupWebSocket(wss);

server.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});