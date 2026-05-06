const clients = new Set();

module.exports = {
    add: (ws) => clients.add(ws),

    remove: (ws) => clients.delete(ws),

    broadcast: (message) => {
        clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    },
};