# Architecture Decisions

This document explains the key technology choices made while building Fluxo and the reasoning behind them.

## Monorepo: pnpm Workspaces + Turborepo

**Why pnpm:** Faster installs than npm, uses symlinks to deduplicate dependencies across packages, and has first-class workspace support. Industry standard for monorepos in 2026 (Vercel, Vite, Astro all use it).

**Why Turborepo:** Orchestrates builds, tests, and lint across all packages with intelligent caching. A change in `apps/web` doesn't trigger a rebuild of `apps/api`.

**Why monorepo at all:** The `packages/shared` library is the killer feature — Zod schemas and TypeScript types are shared between frontend and backend. Change a schema once, both sides update. End-to-end type safety.

## Frontend Stack

### React 19 + Vite 6

**Why React 19:** Latest stable, with the new `use()` hook and improved Server Components support. Most demanded framework in the job market.

**Why Vite over Create React App or Next.js:** CRA is deprecated. Next.js would be overkill for an SPA dashboard — we don't need SSR or file-based routing. Vite gives us blazing-fast HMR (under 100ms) and a leaner bundle.

### Redux Toolkit + RTK Query

**Why Redux over Zustand/Jotai:** Redux is still the most-requested state management in job listings, especially in enterprise. Showing modern Redux Toolkit (not the old 2018 style with switch statements) signals up-to-date knowledge.

**Why RTK Query over TanStack Query:** Keeps everything in one store — client state and server state. One mental model, less context switching. Auto-generated React hooks with caching, refetching, and cache invalidation via tags.

### Tailwind CSS 4

**Why Tailwind 4 over Tailwind 3:** New Oxide engine (Rust-based), 5x faster builds, native Vite plugin without PostCSS config, new `@theme` directive for design tokens.

**Why utility-first CSS at all:** Faster development, no naming bikeshedding, consistent design system via design tokens, smaller production bundles via purging.

## Backend Stack

### Fastify 5 over Express

**Why Fastify:** 2-3x faster than Express in benchmarks, built-in JSON schema validation, modern plugin architecture, first-class TypeScript support. Express is showing its age in 2026.

**Why not NestJS:** Too opinionated and heavy for a project this size. The decorator-heavy approach adds boilerplate without proportional benefit for a small team.

### Prisma 7 ORM with Adapter Pattern

**Why Prisma:** Type-safe queries, declarative schema, automatic migrations, excellent DX with Prisma Studio for inspecting data.

**Why Prisma 7 specifically:** New adapter pattern decouples Prisma from database drivers, enabling edge deployments and better TypeScript inference. Future-proof choice.

**Why `@prisma/adapter-pg`:** Uses the standard `pg` driver under the hood — battle-tested for 15+ years, widely supported in hosting providers.

### PostgreSQL over MongoDB

**Why relational:** Financial data is inherently relational — users have transactions, transactions belong to categories, categories belong to budgets. ACID guarantees matter when money is involved. PostgreSQL is the most respected open-source database in fintech.

**Why version 17:** Latest stable, with native UUID type support, performance improvements, and better JSON handling.

## Authentication Strategy

### Argon2id over bcrypt

**Why Argon2id:** Winner of the Password Hashing Competition (2015). Resistant to GPU and side-channel attacks, unlike bcrypt. OWASP recommendation for new projects in 2026. Configurable memory and time cost — we use OWASP's recommended values (19 MiB memory, 2 iterations).

### JWT Access Token + HTTP-Only Refresh Cookie Hybrid

**Why not localStorage for tokens:** Vulnerable to XSS attacks. Any compromised script can steal the token.

**Why not cookies for everything:** Sending JWT in a cookie on every request is fine, but standard mobile clients (React Native, native apps) expect tokens in the Authorization header.

**The hybrid approach:**
- **Access token** (15 min, JWT) returned in JSON response — used in Authorization header
- **Refresh token** (7 days, opaque random string) stored in HTTP-only signed cookie — invisible to JS, signed with secret to prevent tampering

This combination gives mobile-friendly auth + XSS protection + CSRF protection (via `sameSite: 'lax'`).

### Refresh Token Rotation

**Why rotate refresh tokens:** Every time a refresh token is used, it's revoked in the database and a new one is issued. If a token is ever stolen and used, the legitimate user's next refresh will fail — instant breach detection.

This is the pattern used by Auth0, Okta, and modern OAuth 2.0 implementations.

### Rate Limiting on Auth Endpoints

**Why:** Without rate limiting, an attacker can try 1000 login attempts per second with leaked password lists. Limiting to 5 attempts per 15 minutes per IP makes brute force economically unviable.

**Why per-endpoint config:** Different endpoints have different threat models. Login is high-risk (brute force), refresh is medium-risk (token theft), `/me` and `/logout` don't need rate limiting at all.

## Infrastructure

### Docker for Local Postgres

**Why Docker for the database:** Identical environment across all developer machines. No "works on my machine" issues. New developer can clone the repo, run `docker compose up -d`, and have a working database in 30 seconds.

**Why not install Postgres natively:** Polluting the host OS, version conflicts between projects, harder to reset to a clean state.

### Environment Validation with Zod

**Why validate env vars at startup:** Production outages from missing env vars are common and frustrating to debug. Validating with Zod at app startup means the app refuses to boot with bad config — fail fast.

## TypeScript Configuration

**Why strict mode + every additional check:** The cost of strict TypeScript is felt during development (more compile errors to fix). The benefit is felt in production (fewer runtime errors). For a financial app, runtime errors can mean lost money. Strict mode is non-negotiable.

**Key options enabled:**
- `noUncheckedIndexedAccess` — array access returns `T | undefined`, forcing null checks
- `noImplicitOverride` — explicit `override` keyword required
- `strictNullChecks` — `null` and `undefined` are distinct from `T`

## Logging

### Pino over Winston

**Why Pino:** Fastest JSON logger for Node.js (5x faster than Winston). Outputs structured JSON in production, perfect for log aggregators like Datadog or Grafana Loki.

**Why structured logging:** Searching "all 500 errors from user X yesterday" is trivial with JSON logs. Impossible with plain text logs.

**Why `pino-pretty` in development:** JSON logs are hard to read in a terminal. `pino-pretty` colorizes and formats them for humans during local development.

## What's Next

Future architectural decisions to document as they're made:
- Frontend auth state management (Redux slice + RTK Query auth endpoints)
- Protected routes pattern
- Auto-refresh strategy for expired access tokens
- AI assistant integration (Anthropic API)
- Transaction data model with categories and budgets