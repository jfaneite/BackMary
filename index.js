const express = require("express");
const app = express();
const http = require("http");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const WebSocket = require("ws");

const documentRoutes = require("./src/routes/document.routes");

app.use(express.json());
app.use(documentRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");
  ws.send(JSON.stringify({ message: "WebSocket connected" }));
});

app.set("wss", wss);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
