const { streamDocuments } = require("../repositories/document.repository");
const { sendToChatGPT } = require("./chatgpt.service");

async function processDocumentsWithChatGPT(ws) {
  for await (const doc of streamDocuments()) {
    const result = await sendToChatGPT(doc);
    ws.send(
      JSON.stringify({
        doc_id: doc.doc_id,
        response: result,
      }),
    );
  }

  ws.send(JSON.stringify({ done: true }));
}

module.exports = {
  processDocumentsWithChatGPT,
};
