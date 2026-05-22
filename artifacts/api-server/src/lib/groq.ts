import OpenAI from "openai";
import { GROQ_API_KEY } from "./env.js";

export const groq = new OpenAI({
  apiKey: GROQ_API_KEY ?? "missing",
  baseURL: "https://api.groq.com/openai/v1",
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";
