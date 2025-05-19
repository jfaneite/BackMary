const { processDocumentsWithChatGPT } = require("../services/document.service");

const processDocs = async (req, res) => {

  const wss = req.app.get("wss");

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      processDocumentsWithChatGPT(client);
    }
  });

  res.status(200).json({ message: "Streaming started" });
};

module.exports = {
  processDocs,
};
