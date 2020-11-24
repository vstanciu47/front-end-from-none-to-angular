const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");
const ws = require("ws");
const express = require("express");

// index, md
const app = express();
const files = [];
app.use((req, res) => {
    req.url = req.url.split("?")[0];
    const file = /^(\/|index\.html)$/.test(req.url) ? "index.html" : /\.md$/.test(req.url) ? req.url : "";
    if (!file) return res.status(404).send();
    if (!files[file]) files[file] = fs.readFileSync(path.join(__dirname, file)).toString();
    return res.header({ "Content-Type": /\.md$/.test(file) ? "text/markdown; charset=UTF-8" : "text/html" }).send(files[file]);
});
const server = http.createServer(app);

// ws
const wss = new ws.Server({ server })
let lastMessage = "";
const clients = new Set();
wss.on("connection", (ws, req) => {
    console.log("\x1b[36m", "connection", req.socket.remoteAddress, "\x1b[0m");
    clients.add(ws);
    ws.send(lastMessage);
    ws.on("message", message => {
        lastMessage = message;
        clients.forEach(client => client !== ws && client.readyState === ws.OPEN && client.send(message));
    });
    ws.on("close", () => clients.delete(ws));
});

// host
const port = !isNaN(+process.argv[2]) ? +process.argv[2] : 80;
const urls = Object.values(os.networkInterfaces())
    .reduce((all, as) => (as.forEach(a => all.push(a.address.replace("::1", "localhost"))), all), [])
    .map(u => `\n\thttp://${u}` + (port !== 80 ? `:${port}` : ""));
server.listen(port, console.log("\x1b[33m", "presentation server running", "\x1b[32m", urls.join(""), "\x1b[0m"));
