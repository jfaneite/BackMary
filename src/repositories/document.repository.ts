import fs from "fs";
import path from "path";
import readline from "readline";
import { convertJsonArrayToNDJSON } from "../utils/convertToNdjson.util";

export interface Document {
  doc_id: string;
  [key: string]: any;
}

export async function* streamDocuments(): AsyncGenerator<Document> {
  convertJsonArrayToNDJSON();

  const filePath = path.join(__dirname, "../../documents.ndjson");
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        const parsed: Document = JSON.parse(line);
        yield parsed;
      } catch (err) {
        console.error(`Invalid JSON at line: ${line}\n${(err as Error).message}`);
      }
    }
  }
}

