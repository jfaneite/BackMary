import request from "supertest";
import express from "express";
import documentRoutes from "../../routes/document.routes";

jest.mock("../../controllers/document.controller", () => ({
  processDocs: (_req: express.Request, res: express.Response) =>
    res.status(200).json({ message: "Streaming started" }),
}));

describe("GET /documents", () => {
  const app = express();
  app.use(express.json());
  app.use("/", documentRoutes);

  it("should return 200 and a success message", async () => {
    const res = await request(app).get("/documents");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Streaming started" });
  });
});
