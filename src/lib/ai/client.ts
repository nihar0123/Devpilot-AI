import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export function hasAiKey() {
  return Boolean(process.env.GEMINI_API_KEY) || Boolean(process.env.GROQ_API_KEY);
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }
  const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  return match ? match[0] : "{}";
}

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash"; // Fallback to a default stable flash model
  return genAI.getGenerativeModel({ model: modelName });
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

async function generateWithGemini(prompt: string) {
  const model = getGeminiModel();
  const response = await model.generateContent(`${prompt}\n\nReturn only valid JSON.`);
  const text = response.response.text();
  
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

async function generateWithGroq(prompt: string) {
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
  return text;
}

export async function generateAiJson(prompt: string) {
  if (!hasAiKey()) {
    throw new Error("No AI Provider configured. Set GEMINI_API_KEY or GROQ_API_KEY in your .env file.");
  }

  let text = "";
  let errorGemini: any = null;

  // 1. Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      text = await generateWithGemini(prompt);
    } catch (error) {
      console.error("Gemini API failure, attempting fallback to Groq:", error);
      errorGemini = error;
    }
  }

  // 2. Fallback to Groq
  if (!text && process.env.GROQ_API_KEY) {
    try {
      text = await generateWithGroq(prompt);
    } catch (error) {
      console.error("Groq fallback failed:", error);
      throw new Error(`AI failure: Gemini Error: [${errorGemini?.message || "N/A"}], Groq Error: [${error instanceof Error ? error.message : "Unknown"}]`);
    }
  }

  // Check if we actually got text
  if (!text) {
    throw new Error("Both Gemini and Groq failed or are unconfigured.");
  }

  try {
    return JSON.parse(extractJson(text));
  } catch (e) {
    console.error("Failed to parse JSON from AI response.", text);
    throw new Error("Failed to parse valid JSON structure from AI response.");
  }
}
