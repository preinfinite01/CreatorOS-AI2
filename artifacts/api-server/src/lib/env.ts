/**
 * Centralized environment validation.
 * Import this module once at startup (app.ts) to get early, clear errors.
 * Every process.env access in the rest of the server goes through these typed exports.
 */
import { logger } from "./logger.js";

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    logger.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

function warn(key: string, hint: string): string | undefined {
  const value = process.env[key];
  if (!value) logger.warn(`${key} not set — ${hint}`);
  return value;
}

// ── Required at startup ────────────────────────────────────────────
export const DATABASE_URL = required("DATABASE_URL");

// ── AI providers (warn, not crash — server still starts without them) ─
export const GROQ_API_KEY       = warn("GROQ_API_KEY",       "all AI generation endpoints will return errors");
export const HUGGINGFACE_API_KEY = warn("HUGGINGFACE_API_KEY", "image generation endpoint will return errors");

// ── Payments ──────────────────────────────────────────────────────
export const PAYSTACK_SECRET_KEY = warn("PAYSTACK_SECRET_KEY", "payment routes will return errors");
export const PAYSTACK_PUBLIC_KEY = optional("PAYSTACK_PUBLIC_KEY");

// ── Supabase (server-side admin operations) ───────────────────────
export const SUPABASE_SERVICE_ROLE_KEY = warn("SUPABASE_SERVICE_ROLE_KEY", "server-side Supabase operations will fail");
export const VITE_SUPABASE_URL = optional("VITE_SUPABASE_URL"); // readable by server for JWT validation

// ── Deployment ────────────────────────────────────────────────────
export const FRONTEND_URL = optional(
  "FRONTEND_URL",
  process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:3000",
);

export const NODE_ENV  = optional("NODE_ENV", "development");
export const PORT      = optional("PORT", "8080");
export const LOG_LEVEL = optional("LOG_LEVEL", NODE_ENV === "production" ? "info" : "debug");
