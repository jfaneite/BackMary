require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function sendToChatGPT(document) {
  const prompt = `
    understand this content by the doc_id which represent a document with its respectives pages represented by the page_number, 
    Summarize the document in useful metadata as highlights, 
    build a stringify json object with this format: 
    array of hightlights 
    [{ 
      "title":"Give me in 10 words the title of the hightlight",
      "date": "Give me the date of this highlight using the format YYYY-MM-DD",
      "description": "give me a summarize explanation in no more than 50 words of this highlight", 
      "source": "give me the title of the document source if the document does not have a title give it one related of all pages", 
      "relevance": "give me the relevance of this hightlight" 
    }]

    important to follow The "relevance" attribute could have this possible value: number and here is the meaning [1: "very low", 2: "low", 3: "medium", 4: "high", 5: "very high"]`;

  const content = `${prompt}\n\n${JSON.stringify(document)}`;

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
      {
        role: "system",
        content:
          "You are an analyst trained to read, understand and summarize into relevant and important topics",
      },
      { role: "user", content },
    ],
  });

  return chatResponse.choices[0].message.content;
}

module.exports = {
  sendToChatGPT,
};
