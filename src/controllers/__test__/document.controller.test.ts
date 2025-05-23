import express from "express";
import request from "supertest";
import { WebSocket, WebSocketServer } from "ws";
import { processDocs } from "../../controllers/document.controller";
import * as documentService from "../../services/document.service";

describe("document.controller - processDocs", () => {
  let app: express.Express;
  let mockWss: WebSocketServer;
  let mockClient: WebSocket;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockClient = {
      readyState: WebSocket.OPEN,
      send: jest.fn(),
    } as unknown as WebSocket;

    mockWss = {
      clients: new Set([mockClient]),
    } as unknown as WebSocketServer;

    app.set("wss", mockWss);

    app.post("/documents", (req, res) => processDocs(req, res));
  });

  it("should start processing and return 200", async () => {
    const spy = jest
      .spyOn(documentService, "processDocumentsWithChatGPT")
      .mockImplementation(async () => {});

    const res = await request(app).post("/documents");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Streaming started" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(mockClient);
  });

  it("should skip clients that are not open", async () => {
    const CLOSED = WebSocket.CLOSED ?? 3;

    mockClient = {
      readyState: CLOSED,
      send: jest.fn(),
    } as unknown as WebSocket;

    mockWss = {
      clients: new Set([mockClient]),
    } as unknown as WebSocketServer;

    app.set("wss", mockWss);

    const res = await request(app).post("/documents");

    expect(res.status).toBe(200);
  });
});
