# Interview Talking Points — Fluxo

Cheat sheet for discussing Fluxo in job interviews, LinkedIn profiles, and CV descriptions. Use these as starting points and adapt to your audience.

---

## The 30-Second Pitch

"Fluxo is a full-stack personal finance dashboard I built to demonstrate modern TypeScript development. It features a streaming AI assistant powered by Anthropic's Claude that analyzes your transactions and provides personalized financial insights. The whole stack is type-safe — React 19 frontend, Fastify backend, Prisma + PostgreSQL — connected through shared Zod schemas in a pnpm monorepo. I built it to showcase end-to-end type safety, production-grade auth patterns, and real AI integration beyond simple chatbots."

**Use this when:**
- Recruiter screening calls
- First-round interviews
- LinkedIn project description (shorter version)

---

## Architecture Talking Points

### Monorepo Structure
- **What:** pnpm workspaces + Turborepo with apps/web, apps/api, and packages/shared
- **Why:** Shared Zod schemas between frontend and backend — change a validation rule once, both sides update with type safety
- **Trade-off:** More setup complexity vs. eliminating an entire class of bugs (frontend-backend type drift)

### End-to-End Type Safety
- **What:** Zod schemas in packages/shared validate forms on the frontend AND requests on the backend
- **Why:** Single source of truth for data shapes
- **Example:** passwordSchema enforces same rules in React Hook Form and Fastify route handler
- **Impact:** Refactoring is safer because TypeScript catches breaking changes across the entire stack

### Authentication Strategy
- **Approach:** Hybrid JWT access token + HTTP-only refresh cookie
- **Reasoning:**
  - Access token in Authorization header (mobile-friendly)
  - Refresh token in HTTP-only signed cookie (XSS-protected)
  - Refresh token rotation — old token revoked on every refresh (breach detection)
- **Production patterns:** Argon2id hashing (OWASP recommendation), rate limiting on auth endpoints
- **Mutex for token refresh:** Prevents race condition when multiple simultaneous 401s would trigger parallel refresh attempts

### AI Integration
- **Stack:** Anthropic Claude (Haiku 4.5) via official SDK
- **Pattern:** Server-Sent Events (SSE) for streaming responses
- **Context injection:** Backend fetches user's transaction stats and injects into system prompt before calling Claude
- **Result:** Personalized responses based on actual user data, not generic financial advice
- **Streaming:** Frontend uses ReadableStream + TextDecoder with buffer for partial chunks

### Multi-Tenant Security
- **Pattern:** Every database query includes userId constraint
- **Layer 1:** JWT middleware extracts userId from token
- **Layer 2:** Service layer enforces ownership using findFirst with userId in where clause
- **Layer 3:** RTK Query cache reset on login/logout (prevents data leak between users in same browser)
- **Discovery:** I caught a cache-leak bug myself during testing — fixed by resetting RTK Query state on auth changes

---

## Tech Stack Reasoning (For When They Ask "Why X?")

### "Why React 19?"
- Latest stable with use() hook and improved Server Components support
- Best ecosystem for finding solutions and libraries
- High demand in 2026 job market

### "Why Vite over Next.js?"
- This is an SPA dashboard — no SSR needed
- Vite is faster (HMR under 100ms)
- Lighter bundle, simpler config
- Next.js would be overkill for this use case

### "Why Redux Toolkit over Zustand/Jotai?"
- Still the most-requested state management in enterprise
- Modern RTK is nothing like 2018 Redux — no switch statements, automatic immutability
- RTK Query keeps server and client state in one place

### "Why Fastify over Express?"
- 2-3x faster in benchmarks
- Built-in JSON schema validation
- Modern plugin architecture
- Express is showing its age in 2026

### "Why PostgreSQL over MongoDB?"
- Financial data is inherently relational (users → transactions → categories)
- ACID guarantees matter when dealing with money
- PostgreSQL is the gold standard in fintech

### "Why Prisma 7 with adapter pattern?"
- New adapter pattern decouples Prisma from database drivers
- Enables edge deployment in the future
- Better TypeScript inference than older Prisma versions

### "Why Anthropic Claude over OpenAI?"
- Better at "long context" — can include full user history without truncation
- "Constitutional AI" approach — fewer hallucinations, refuses to give bad financial advice
- Better SDK and developer experience
- Different model tiers for different needs (Haiku for cheap/fast, Opus for complex)

### "Why Tailwind 4?"
- Oxide engine (Rust-based) — 5x faster builds
- Native Vite plugin without PostCSS config
- New @theme directive for design tokens

---

## Problems I Solved (Great Interview Stories)

### 1. The Multi-Tenant Cache Bug
**Problem:** When User A logged out and User B logged in on the same browser, User B briefly saw User A's data due to RTK Query cache persistence.

**Investigation:** Discovered during careful end-to-end testing. Verified the backend was correctly returning User B's data, so the issue had to be frontend cache.

**Solution:** Added api.util.resetApiState() dispatch on login/logout mutations.

**Takeaway:** Security bugs aren't always in the backend. Frontend state management can leak data. Always test the full user journey.

### 2. The Token Refresh Race Condition
**Problem:** When multiple API requests simultaneously hit a 401 (expired token), each would trigger its own refresh request. Token rotation means each refresh invalidates the others — cascade of failures.

**Solution:** Implemented mutex pattern with async-mutex library. First 401 acquires lock and refreshes; subsequent 401s wait for lock release then retry with fresh token.

**Takeaway:** Concurrency bugs hide in async code. Token rotation is more secure but requires careful coordination.

### 3. The CORS + SSE Mismatch
**Problem:** Fastify CORS plugin works for regular routes but doesn't apply to SSE endpoints because we use reply.raw.write() which bypasses Fastify lifecycle hooks.

**Solution:** Manually set Access-Control-Allow-Origin and Access-Control-Allow-Credentials headers in the SSE handler before writing the stream.

**Takeaway:** Understanding the framework's lifecycle matters. "Just enable CORS" doesn't always work — you need to know why.

### 4. The Secret in Git History
**Problem:** Committed an Anthropic API key in .env.example (forgot to replace with placeholder). GitHub secret scanning blocked the push.

**Solution:**
1. Immediately revoked the leaked key on Anthropic Console
2. Generated new key
3. Used git rebase -i with fixup to squash the leak commit into a clean one
4. Force-pushed cleaned history

**Takeaway:** Modern Git workflows assume secrets WILL leak. GitHub's protection layers are a feature, not an obstacle. Knowing how to rewrite history professionally is essential.

---

## Numbers to Memorize

- **Test coverage:** End-to-end manual testing of all critical paths
- **Bundle size:** Optimized with Vite — production build under 300KB gzipped
- **API response time:** Local dev under 50ms p99
- **AI streaming latency:** First token under 1s with Claude Haiku 4.5
- **Database:** PostgreSQL 17 with indexed queries
- **Auth tokens:** 15min access + 7-day refresh with rotation
- **Lines of code:** 5,000+ TypeScript across monorepo
- **Architectural decisions documented:** 25+ in ARCHITECTURE.md

---

## Questions You Might Get Asked

### "Walk me through the auth flow"
1. User submits credentials → Fastify validates with Zod
2. Argon2id hashes password, compares to DB
3. On success: generate JWT access token (15min) + opaque refresh token (7 days)
4. Refresh token stored in DB and sent as HTTP-only signed cookie
5. Access token returned in JSON for Authorization header use
6. On 401: mutex-locked refresh request — old token revoked, new pair issued
7. On logout: refresh token marked as revoked, RTK Query cache reset

### "How does the AI Assistant work?"
1. User opens chat panel, types question
2. Frontend POST to /ai/chat with conversation history
3. Backend: fetch user's transaction stats in parallel using Promise.all
4. Build system prompt with personalized financial context
5. Stream from Anthropic API via messages.stream() method
6. Backend yields chunks via async generator → SSE format
7. Frontend reads ReadableStream, parses chunks, updates state
8. User sees response stream character-by-character

### "What would you do differently if scaling to 10,000 users?"
- **Database:** Connection pooling (PgBouncer), read replicas for analytics queries
- **Backend:** Horizontal scaling behind load balancer, separate AI service
- **Frontend:** CDN for static assets (already on Vercel), code splitting per route
- **AI Costs:** Cache common questions, implement user-level rate limits
- **Monitoring:** OpenTelemetry instrumentation, Sentry for error tracking
- **CI/CD:** GitHub Actions with automated tests, preview deployments per PR

### "What was the hardest part?"

**For backend role:** The mutex-based token refresh — debugging race conditions taught me a lot about async coordination in JavaScript.

**For frontend role:** Implementing SSE streaming with proper buffer management for partial chunks. SSE looks simple in tutorials but reality is messy.

**For full-stack role:** Designing the shared types layer — finding the right level of abstraction so backend and frontend stay in sync without coupling.

**For AI/ML role:** Prompt engineering the system prompt to inject real user data while keeping the LLM focused on actionable advice (not giving legal/tax disclaimers).

---

## LinkedIn Project Description

Fluxo — AI-Powered Personal Finance Dashboard

Full-stack TypeScript application demonstrating production-grade patterns:

- Production-grade auth: JWT + refresh rotation, Argon2id hashing, mutex-based token refresh, rate limiting

- Real AI integration: Streaming chat with Anthropic Claude, personalized context injection from user data

- End-to-end type safety: Shared Zod schemas across React frontend and Fastify backend via pnpm monorepo

- Modern stack: React 19, TypeScript 5.7, Vite 6, Tailwind 4, Redux Toolkit, Prisma 7, PostgreSQL 17

- Architectural decisions: All technology choices documented with reasoning in ARCHITECTURE.md

- Live demo: [URL after deploy]
- GitHub: github.com/milanNbg/fluxo

---

## CV Bullet Points

For your CV, adapt these based on the role:

**Generic full-stack:**
- Built Fluxo, a full-stack personal finance dashboard with AI integration using React 19, TypeScript, Fastify, and PostgreSQL
- Implemented production-grade authentication: JWT with refresh rotation, Argon2id hashing, HTTP-only cookies, rate limiting
- Integrated Anthropic Claude API with Server-Sent Events streaming and user-context injection for personalized responses
- Architected pnpm monorepo with shared Zod schemas providing end-to-end type safety between frontend and backend

**Backend-focused:**
- Designed multi-tenant Fastify API with Prisma ORM, enforcing ownership constraints at the service layer
- Implemented JWT access tokens + HTTP-only refresh cookies with database-tracked rotation for breach detection
- Built streaming AI chat endpoint using Server-Sent Events and async generators for backpressure handling
- Configured production-grade security: Argon2id hashing, signed cookies, Helmet, CORS, environment validation

**Frontend-focused:**
- Built React 19 SPA with Redux Toolkit + RTK Query for state management and data fetching
- Implemented automatic token refresh with mutex coordination to prevent race conditions on simultaneous 401 responses
- Created streaming AI chat interface using fetch + ReadableStream with proper SSE chunk buffering
- Designed component library with Tailwind CSS 4 utility-first patterns and accessibility-focused interactions

---

## Goal-Specific Pitch Variations

### For startup roles:
"I wanted to show I can ship features end-to-end without waiting for someone else. Fluxo demonstrates I can design schemas, build APIs, integrate third-party services like Anthropic, and ship a polished frontend — all while making sound architectural decisions and documenting why."

### For enterprise roles:
"I focused on production-grade patterns: type safety, refresh token rotation, rate limiting, structured logging, schema validation at every boundary. Fluxo isn't just a demo — it's built with the same security and reliability concerns that enterprise apps require."

### For AI/ML roles:
"Fluxo is my deep-dive into LLM integration. I worked through real challenges: streaming via SSE, context injection from database queries, prompt engineering for personalized responses, rate limiting to control costs, and choosing the right model tier (Haiku for production cost efficiency)."

### For freelance/contract:
"Fluxo proves I can deliver a complete product. Database design, authentication, business logic, AI integration, UI, deployment — I did all of it. If you need someone who can own a feature or even a whole project end-to-end, my work speaks for itself."