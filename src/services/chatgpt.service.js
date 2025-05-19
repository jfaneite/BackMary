require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function sendToChatGPT(document) {
  const prompt = `Summarize this content by the doc_id which represent a document with its respectives pages represented by the page_number, build a json object with: { "title":"where you Give me in 10 words what is the general topic written in all the pages", then an array of highlights, relevant information that you consider important written in all the pages like: [{ "date": "Give me the date of this highlight", "description": "give me a summarize explanation in no more than 30 words of this highlight", "source": "give me the document source", "relevance": "give me the relevance of the event" }], documentSources: [array of string with the names of all the previous added in the source attribute do not repeat the source]} 

important to follow The "relevance" attribute could have this possible values array of numbers [number] the meaning of those numbers are [1: "very low", 2: "low", 3: "medium", 4: "high", 5: "very high"]`;
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
