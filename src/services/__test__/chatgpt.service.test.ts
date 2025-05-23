import { encode } from "gpt-3-encoder";
import * as chatgptService from "../chatgpt.service";
import { OpenAI } from "openai";

jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

describe("chatgpt.service", () => {
  const mockCreate = jest.fn();

  beforeAll(() => {
    (chatgptService.openai.chat.completions.create as jest.Mock) = mockCreate;
  });

  beforeEach(() => {
    mockCreate.mockReset();
  });

  describe("chunkDocumentPages", () => {
    it("should chunk pages based on token limit", () => {
      const pages = [
        { words: [{ content: "hello world" }] }, 
        { words: [{ content: "a".repeat(5000) }] }, 
        { words: [{ content: "b".repeat(5000) }] }, 
      ];

      const chunks = chatgptService.chunkDocumentPages(pages);

      expect(chunks.length).toBeGreaterThan(0);
      expect(Array.isArray(chunks[0])).toBe(true);
    });
  });

  describe("summarizeChunk", () => {
    it("should call OpenAI chat completion with correct prompt and return content", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "mocked summary" } }],
      });

      const texts = ["text chunk 1", "text chunk 2"];
      const sourceName = "testSource";

      const result = await chatgptService.summarizeChunk(texts, sourceName);

      expect(mockCreate).toHaveBeenCalledTimes(1);

      const messages = mockCreate.mock.calls[0][0].messages;
      expect(messages.some((m: any) => m.content.includes(texts[0]))).toBe(
        true,
      );
      expect(result).toBe("mocked summary");
    });
  });

  describe("getHighlights", () => {
    it("should get highlights by calling summarizeChunk and merging results", async () => {
      jest
        .spyOn(chatgptService, "chunkDocumentPages")
        .mockReturnValue([["page1 text"], ["page2 text"]]);

      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "merged summary" } }],
      });

      const document = {
        content: [
          { words: [{ content: "some content 1" }] },
          { words: [{ content: "some content 2" }] },
        ],
        source: "test doc",
        doc_id: "doc1",
      };

      const result = await chatgptService.getHighlights(document);

      expect(result).toBe("merged summary");
    });
  });

  describe("streamSummary", () => {
    it("should call OpenAI chat completion and return final summary content", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "global summary" } }],
      });

      const summaries = [
        { doc_id: "doc1", result: "result1" },
        { doc_id: "doc2", result: "result2" },
      ];

      const result = await chatgptService.streamSummary(summaries);

      expect(mockCreate).toHaveBeenCalledTimes(1);

      const userMessage =
        mockCreate.mock.calls[0][0].messages.find((m: any) => m.role === "user")
          ?.content || "";

      expect(userMessage).toContain("Doc 1 (doc1):");
      expect(userMessage).toContain("Doc 2 (doc2):");

      expect(result).toBe("global summary");
    });
  });
});
