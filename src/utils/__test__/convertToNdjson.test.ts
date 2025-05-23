import fs from "fs";
import path from "path";
import { convertJsonArrayToNDJSON } from "../convertToNdjson.util";

jest.mock("fs");

describe("convertJsonArrayToNDJSON", () => {
  const mockInputPath = path.resolve(
    __dirname,
    "../../../json-file-tech-test.json",
  );
  const mockOutputPath = path.resolve(__dirname, "../../../documents.ndjson");

  beforeEach(() => {
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify([
        { id: 1, name: "Test" },
        { id: 2, name: "Second" },
      ]),
    );
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
  });

  it("should convert JSON array to NDJSON and write output", () => {
    convertJsonArrayToNDJSON();

    expect(fs.readFileSync).toHaveBeenCalledWith(mockInputPath, "utf-8");
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      mockOutputPath,
      `{"id":1,"name":"Test"}\n{"id":2,"name":"Second"}`,
    );
  });
});
