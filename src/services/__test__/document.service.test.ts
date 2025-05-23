import { WebSocket } from "ws";
import * as docRepo from "../../repositories/document.repository";
import * as chatgptService from "../chatgpt.service";
import { processDocumentsWithChatGPT } from "../document.service";

describe("processDocumentsWithChatGPT", () => {
  let mockWs: WebSocket & { send: jest.Mock };
  const sampleDocs = [
    { doc_id: "doc1", content: "content1" },
    { doc_id: "doc2", content: "content2" },
  ];

  beforeEach(() => {
    mockWs = {
      send: jest.fn(),
    } as any;

    jest.clearAllMocks();
  });

  it("should stream documents, get highlights, send them and final summary", async () => {
    jest
      .spyOn(docRepo, "streamDocuments")
      .mockImplementation(async function* () {
        for (const doc of sampleDocs) {
          yield doc;
        }
      });

    jest
      .spyOn(chatgptService, "getHighlights")
      .mockImplementation(async (doc) => {
        return `summary for ${doc.doc_id}`;
      });

    jest
      .spyOn(chatgptService, "streamSummary")
      .mockImplementation(async (summaries) => {
        return "final global summary";
      });

    await processDocumentsWithChatGPT(mockWs);

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "highlights",
        content: {
          doc_id: "doc1",
          response: "summary for doc1",
        },
      }),
    );

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "highlights",
        content: {
          doc_id: "doc2",
          response: "summary for doc2",
        },
      }),
    );

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "global_summary_done",
        content: "final global summary",
      }),
    );

    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ done: true }));
  });

  it("should handle errors in getHighlights and send error message", async () => {
    jest
      .spyOn(docRepo, "streamDocuments")
      .mockImplementation(async function* () {
        yield sampleDocs[0];
      });

    jest.spyOn(chatgptService, "getHighlights").mockImplementation(async () => {
      throw new Error("some error");
    });

    jest
      .spyOn(chatgptService, "streamSummary")
      .mockImplementation(async () => "final summary");

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await processDocumentsWithChatGPT(mockWs);

    expect(mockWs.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"highlights_error"'),
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to process doc"),
      expect.any(Error),
    );

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "global_summary_done", content: "final summary" }),
    );
    expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify({ done: true }));

    consoleErrorSpy.mockRestore();
  });
});
