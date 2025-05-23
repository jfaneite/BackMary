import fs from "fs";
import readline from "readline";
import { streamDocuments } from "../../repositories/document.repository";
import * as ndjsonUtil from "../../utils/convertToNdjson.util";

jest.mock("fs");
jest.mock("readline");
jest.mock("../../utils/convertToNdjson.util");

describe("streamDocuments", () => {
  const mockJson = [
    JSON.stringify({ id: 1, name: "doc1" }),
    JSON.stringify({ id: 2, name: "doc2" }),
    "invalid-json",
    JSON.stringify({ id: 3, name: "doc3" }),
  ];

  const mockCreateReadStream = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (fs.createReadStream as jest.Mock).mockImplementation(mockCreateReadStream);

    const fakeRl = {
      [Symbol.asyncIterator]: function* () {
        for (const line of mockJson) {
          yield line;
        }
      },
    };

    (readline.createInterface as jest.Mock).mockReturnValue(fakeRl);

    (ndjsonUtil.convertJsonArrayToNDJSON as jest.Mock).mockImplementation(
      () => {
      },
    );
  });

  it("should yield valid JSON documents and skip invalid lines", async () => {
    const results = [];

    for await (const doc of streamDocuments()) {
      results.push(doc);
    }

    expect(ndjsonUtil.convertJsonArrayToNDJSON).toHaveBeenCalled();
    expect(results).toHaveLength(3); 
    expect(results[0]).toEqual({ id: 1, name: "doc1" });
    expect(results[1]).toEqual({ id: 2, name: "doc2" });
    expect(results[2]).toEqual({ id: 3, name: "doc3" });
  });
});
