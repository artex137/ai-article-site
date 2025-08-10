// lib/openai.ts
import OpenAI from "openai";

// Warn at boot if the key is missing rather than failing mid-request
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.trim()) {
  console.warn("OPENAI_API_KEY is missing or blank in the environment.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // If you ever need a custom base URL, set OPENAI_BASE_URL in Vercel
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});
