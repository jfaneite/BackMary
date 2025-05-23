import { Request, Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { processDocumentsWithChatGPT } from "../services/document.service";

export const processDocs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const wss = req.app.get("wss") as WebSocketServer;

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      processDocumentsWithChatGPT(client);
    }
  });

  res.status(200).json({ message: "Streaming started" });
};
