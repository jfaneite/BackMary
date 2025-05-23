import { encode } from "gpt-3-encoder";
import { OpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const TOKENS_LIMIT = 100000;

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Page {
  words: { content: string }[];
}

export interface Document {
  content: Page[];
  source: string;
  doc_id?: string;
}

export interface Summary {
  doc_id?: string;
  result: string;
}

export function chunkDocumentPages(pages: Page[]): string[][] {
  const chunks: string[][] = [];
  let currentChunk: string[] = [];
  let tokenCount = 0;

  for (const page of pages) {
    const text = page.words.map((w) => w.content).join(" ");
    const tokens = encode(text).length;

    if (tokenCount + tokens > TOKENS_LIMIT) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      currentChunk = [text];
      tokenCount = tokens;
    } else {
      currentChunk.push(text);
      tokenCount += tokens;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export async function summarizeChunk(
  texts: string[],
  sourceName: string,
): Promise<string | null> {
  const prompt = `
Summarize this part of the document. Use the same structure as before:
dont't use this \`\`\`json \`\`\`
{
  "summarize": "..."
  
}

Only include highlights that are actually meaningful.`.trim();

  const fullPrompt = `${prompt}\n\n${texts.join("\n\n")}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an analyst trained to read, understand and summarize into relevant and important topics",
      },
      {
        role: "user",
        content: fullPrompt,
      },
    ],
  });

  return response.choices[0].message.content;
}

export async function getHighlights(
  document: Document,
): Promise<string | null> {
  const { content: pages, source } = document;

  const chunks = chunkDocumentPages(pages);

  const partialSummaries = await Promise.all(
    chunks.map((chunk) => summarizeChunk(chunk, source)),
  );

  const mergePrompt = `
You will receive multiple partial summaries. Merge them into a single coherent summary using this format:

dont't use this \`\`\`json \`\`\`
{
  "summarize": "...",
  "highlights": [{
    "title": "title of the highlight",
    "date": "date of the highlight YYYY-MM-DD",
    "description": "description of the highlight",
    "source": "title of the document normalize it and use it in all future highlights for the same document",
    "relevance": 1 to 5 "is number from very low to very high"
  }]
}

Here are the parts:
${partialSummaries.join("\n\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a skilled summarizer and synthesizer of document parts.",
      },
      { role: "user", content: mergePrompt },
    ],
  });

  return response.choices[0].message.content;
}

export async function streamSummary(
  summaries: Summary[],
): Promise<string | null> {
  const systemPrompt = `You will receive multiple summaries from different documents. Create a global summary with this format:
dont't use this \`\`\`json \`\`\`
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
