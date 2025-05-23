import { WebSocket } from "ws";
import { streamDocuments } from "../repositories/document.repository";
import { getHighlights, streamSummary } from "./chatgpt.service";
import type { Document } from "./chatgpt.service";

export async function processDocumentsWithChatGPT(
  ws: WebSocket,
): Promise<void> {
  const documents: Document[] = [];

  for await (const doc of streamDocuments()) {
    documents.push(doc as Document);
  }

  const summaries: { doc_id: string | undefined; result: any }[] = [];

  await Promise.allSettled(
    documents.map(async (doc: Document) => {
      try {
        const result = await getHighlights(doc);

        summaries.push({ doc_id: doc.doc_id, result });

        ws.send(
          JSON.stringify({
            type: "highlights",
            content: {
              doc_id: doc.doc_id,
              response: result,
            },
          }),
        );
      } catch (err) {
        console.error(`❌ Failed to process doc ${doc.doc_id}`, err);

        ws.send(
          JSON.stringify({
            type: "highlights_error",
            content: {
              doc_id: doc.doc_id,
              error: err instanceof Error ? err.message : String(err),
            },
          }),
        );
      }
    }),
  );

  const finalSummary = await streamSummary(summaries);

  ws.send(
    JSON.stringify({ type: "global_summary_done", content: finalSummary }),
  );
  ws.send(JSON.stringify({ done: true }));
}
