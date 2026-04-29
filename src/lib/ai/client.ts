import OpenAI from "openai";

export function hasAiKey() {
  return Boolean(process.env.GROQ_API_KEY);
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }
  const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return match ? match[0] : "{}";
}

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function generateAiJson(prompt: string) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured. Set it in your .env file.");
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const response = await getGroqClient().chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 4096,
    messages: [{ role: "user", content: `${prompt}\n\nReturn only valid JSON.` }],
  });

  const text = response.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return JSON.parse(extractJson(text));
}
