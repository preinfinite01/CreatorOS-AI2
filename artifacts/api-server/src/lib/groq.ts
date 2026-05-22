import OpenAI from "openai";
import { logger } from "./logger.js";

if (!process.env.GROQ_API_KEY) {
  logger.warn(
    "GROQ_API_KEY is not set. AI generation endpoints will return errors until it is configured.",
  );
}

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY ?? "missing",
  baseURL: "https://api.groq.com/openai/v1",
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";
