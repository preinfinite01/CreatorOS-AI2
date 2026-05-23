import "./lib/env.js"; // validates env at startup — must be first import
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { FRONTEND_URL, NODE_ENV } from "./lib/env.js";

const app: Express = express();

// CORS — support comma-separated FRONTEND_URL for multiple Vercel deployments
// e.g. FRONTEND_URL=https://my-app.vercel.app,https://my-app-git-main.vercel.app
const allowedOrigins = [
  ...(FRONTEND_URL ? FRONTEND_URL.split(",").map((u) => u.trim()).filter(Boolean) : []),
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:18152",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return cb(null, true);
      // In development allow everything
      if (NODE_ENV !== "production") return cb(null, true);
      // Exact match against configured origins
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Allow all Vercel preview deployments (*.vercel.app) as a safety net
      if (origin.endsWith(".vercel.app")) return cb(null, true);
      logger.warn({ origin }, "CORS blocked request");
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
