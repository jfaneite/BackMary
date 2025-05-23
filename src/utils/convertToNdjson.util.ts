import fs from "fs";
import path from "path";

export function convertJsonArrayToNDJSON(): void {
  const inputPath = path.resolve(__dirname, "../../json-file-tech-test.json");
  const outputPath = path.resolve(__dirname, "../../documents.ndjson");

  const fileContent = fs.readFileSync(inputPath, "utf-8");
  const jsonArray: unknown = JSON.parse(fileContent);

  if (!Array.isArray(jsonArray)) {
    throw new Error("Input JSON must be an array");
  }

  const ndjson = jsonArray.map((obj) => JSON.stringify(obj)).join("\n");
  fs.writeFileSync(outputPath, ndjson);

  console.log(`✅ NDJSON written to ${outputPath}`);
}
