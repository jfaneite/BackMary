const { streamDocuments } = require("../repositories/document.repository");
const { getHighlights, streamSummary } = require("./chatgpt.service");

async function getHighlightsWithChatGPT(ws) {
  const summaries = [];

  for await (const doc of streamDocuments()) {
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
  }

  const finalSummary = await streamSummary(summaries);

  ws.send(
    JSON.stringify({ type: "global_summary_done", content: finalSummary }),
  );

  ws.send(JSON.stringify({ done: true }));
}

module.exports = {
  processDocumentsWithChatGPT: getHighlightsWithChatGPT,
};
