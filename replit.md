# CreatorOS AI

An AI-powered SaaS platform for content creators — generates viral titles, hooks, scripts, ideas, captions, hashtags, thumbnails, and full content workflows using Groq LLM + Hugging Face FLUX image generation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/creator-os run dev` — run the frontend (port 18152)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Required Environment Variables

- `DATABASE_URL` — Postgres connection string (auto-set by Replit DB)
- `GROQ_API_KEY` — Groq API key for LLM (llama-3.3-70b-versatile) — **required for all AI tools**
- `HUGGINGFACE_API_KEY` — Hugging Face API key for FLUX image generation
- `VITE_SUPABASE_URL` — Supabase project URL (for auth)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key (for auth)
- `PAYSTACK_SECRET_KEY` — Paystack secret key (for payments)
- `PAYSTACK_PUBLIC_KEY` — Paystack public key (for frontend checkout)
- `FRONTEND_URL` — Production frontend URL (for Paystack callback redirects)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + shadcn/ui + wouter routing
- Backend: Express 5 + Drizzle ORM + PostgreSQL
- Auth: Supabase (email/password)
- AI: Groq (llama-3.3-70b-versatile via OpenAI SDK)
- Images: Hugging Face FLUX.1-schnell
- Payments: Paystack (multi-currency)
- State: Zustand
- Validation: Zod v4 + drizzle-zod

## Where things live

- `artifacts/creator-os/src/` — React frontend
  - `pages/` — route-level pages (landing, auth, dashboard, tools/*, projects, settings, pricing)
  - `components/` — UI components including shadcn/ui
  - `store/` — Zustand stores (auth, user, subscription)
  - `lib/supabase.ts` — Supabase client
- `artifacts/api-server/src/` — Express backend
  - `routes/ai-tools.ts` — All Groq AI generation endpoints
  - `routes/openai-conversations.ts` — AI chat with streaming SSE
  - `routes/paystack.ts` — Paystack payment + subscription management
  - `routes/image.ts` — HuggingFace FLUX image generation
  - `lib/groq.ts` — Groq client (OpenAI SDK pointed at Groq)
  - `lib/paystack.ts` — Paystack API helper
  - `lib/exchangeRates.ts` — Currency conversion
  - `middleware/rateLimit.ts` — In-memory rate limiter
- `lib/db/src/schema/` — Drizzle schema: profiles, subscriptions, payments, projects, conversations, messages
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for codegen)

## Architecture decisions

- Groq replaces OpenAI: uses the `openai` npm SDK pointed at `api.groq.com/openai/v1` for zero-cost migration path
- Supabase handles auth only: user sessions and JWTs come from Supabase; profile/subscription data lives in Replit's Postgres via Drizzle
- Paystack for payments: multi-currency pricing with live exchange rates; `profilesTable` tracks plan/credits
- Rate limiting is in-memory (no Redis): resets on server restart, suitable for single-instance Replit deployment
- Frontend fetches `/api/...` via relative URLs: works in both dev (proxy) and production (same domain)

## Product

- AI Tools: title generator, hook writer, script generator, idea generator, full content workflow, captions, hashtags, thumbnail concepts, content repurposer, YouTube descriptions, ad copy, brand voice analyzer
- AI Chat: streaming conversational assistant for creator strategy
- Image Generation: text-to-image via HuggingFace FLUX
- Projects: save and organize generated content
- Subscriptions: Free / Basic ($20/mo) / Pro ($50/mo) plans via Paystack, multi-currency

## Gotchas

- `GROQ_API_KEY` must be set before AI tools will work — server starts without it but all AI routes return 401
- After adding env vars, restart the API Server workflow
- `pnpm --filter @workspace/db run push` must be run after any schema changes (not needed on first boot — Replit auto-provisions)
- The `lib/db/src/index.ts` throws on startup if `DATABASE_URL` is missing — always provision the DB first
- Paystack webhooks need `PAYSTACK_SECRET_KEY` to validate HMAC signatures
- Vite uses `PORT` env var (provided by workflow) — do not hardcode port in vite.config.ts

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- OpenAPI spec at `lib/api-spec/openapi.yaml` controls generated hooks in `lib/api-client-react/src/generated/`
