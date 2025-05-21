require("dotenv").config();
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getHighlights(document) {
  const prompt = `
    understand this document with all its pages then 
    Summarize it in useful metadata detailed descriptive and concised
    return this raw json without \`\`\`json and \`\`\`
    {
      summarize: "this summarize gives a cohesive picture of all pages, with facts, places, people involved, next events, etc",
      highlights: [{ 
        "title":"Give me in 10 words the title of the hightlight",
        "date": "Give me the date of this highlight using the format YYYY-MM-DD",
        "description": "give me a summarize explanation in no more than 150 words of this highlight", 
        "source": "give me the source name of the entire document and must be normalized and repeated in all entries";
        ", 
        "relevance": "give me the relevance of this hightlight" 
      }]
    }

    important to follow The "relevance" attribute could have this possible value: number and here is the meaning [1: "very low", 2: "low", 3: "medium", 4: "high", 5: "very high"]
  `;

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

async function streamSummary(summaries) {
  const systemPrompt = `You will receive multiple summaries from different documents. Create a global summary with this format:
{
  "summary": "Take in mind relevance, facts, people, places if applied and others and create a good explanation and create a global summary write all lines and paragraph you consider",
  "facts"?: ["Important facts if apply, connect with people and/or place"],
  "people"?: ["People involved if apply and connect with facts or place if apply"],
  "places"?: ["Relevant places if apply and connect with the people and fact if apply"],
  "nextEvents?": ["next events use this format YYYY-MM-DD - place - topic if apply and connect with the others fields"]
}`;

  const content = `Here are the document highlights:\n${summaries
    .map((s, i) => `Doc ${i + 1} (${s.doc_id}):\n${s.result}`)
    .join("\n\n")}`;

  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
  });

  return chatResponse.choices[0].message.content;
}

module.exports = {
  getHighlights,
  streamSummary,
};
