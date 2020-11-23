const http = require("http");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ server })
const clients = new Set();

let lastMessage = "";

wss.on("connection", (ws, req) => {
    console.log("connection", req.socket.remoteAddress);
    ws.send(lastMessage);

    clients.add(ws);
    ws.on("message", message => {
        lastMessage = message;
        clients.forEach(client => client.readyState === WebSocket.OPEN && client.send(message));
    });
    ws.on("close", () => clients.delete(ws));
});

const port = +process.env.PORT + 1;
server.listen(port, console.log("ws server running on port", port));
