import express, { Application } from "express";
import http from "http";
import dotenv from "dotenv";
import WebSocket, { Server as WebSocketServer } from "ws";
import cors from "cors";
import documentRoutes from "./src/routes/document.routes";

dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || "3100", 10);

app.use(cors());
app.use(express.json());
app.use(documentRoutes);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected via WebSocket");
  ws.send(JSON.stringify({ message: "WebSocket connected" }));
});

// Attach WebSocket server instance to the Express app
app.set("wss", wss as any);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
