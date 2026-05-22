/**
 * Vercel serverless entry point.
 * Exports the Express app as the default handler so Vercel's Node.js runtime
 * can route requests to it. The `listen()` call in src/index.ts is skipped
 * in this context — Vercel manages the HTTP layer.
 */
import app from "../src/app.js";

export default app;
