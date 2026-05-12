# Fluxo

> Modern personal finance dashboard with AI-powered insights. Track expenses, manage budgets, set savings goals, and get intelligent recommendations powered by Claude.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-22.x-green.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.7-3178c6.svg)

## Overview

Fluxo is a full-stack personal finance application built with a modern TypeScript stack. It demonstrates end-to-end type safety, production-grade authentication, and a scalable monorepo architecture.

**Status:** 🚧 Active development — backend foundation and authentication complete, frontend UI in progress.

## Tech Stack

### Frontend
- **React 19** + **TypeScript 5.7** with strict mode
- **Vite 6** for blazing-fast development
- **Redux Toolkit** + **RTK Query** for state and data fetching
- **Tailwind CSS 4** for styling
- **React Router 7** for routing
- **React Hook Form** + **Zod** for validation (planned)
- **Recharts** for data visualization (planned)

### Backend
- **Node.js 22** + **Fastify 5** for high-performance HTTP server
- **PostgreSQL 17** + **Prisma 7** with adapter pattern
- **JWT** access tokens + **HTTP-only signed cookies** for refresh tokens
- **Argon2id** password hashing (OWASP recommended)
- **Pino** for structured logging
- **Zod** for runtime validation

### Infrastructure
- **pnpm workspaces** + **Turborepo** for monorepo management
- **Docker Compose** for local PostgreSQL
- **GitHub Actions** for CI/CD (planned)

## Project Structure

```
fluxo/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Node.js backend
├── packages/
│   └── shared/       # Shared Zod schemas, TypeScript types, constants
├── docs/
│   └── ARCHITECTURE.md
├── docker-compose.yml
└── ...
```

## Key Features

### Implemented
- ✅ Monorepo with shared types between frontend and backend
- ✅ End-to-end type safety via Zod schemas
- ✅ Full authentication system: register, login, logout, token refresh
- ✅ Refresh token rotation with database revocation
- ✅ Rate limiting on auth endpoints
- ✅ Health checks (server + database)
- ✅ Graceful shutdown handling
- ✅ Security headers (Helmet), CORS, signed cookies

### Planned
- 🔜 Transaction tracking with categories
- 🔜 Budget management with alerts
- 🔜 Savings goals with progress tracking
- 🔜 AI assistant powered by Claude (Anthropic API)
- 🔜 Data visualization (charts and dashboards)
- 🔜 Dark mode and i18n (English/Serbian)
- 🔜 PWA support

## Architecture & Decisions

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for a detailed explanation of technology choices and the reasoning behind them.

## Getting Started

### Prerequisites
- Node.js 22 or higher
- pnpm 10 or higher
- Docker Desktop (for local PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/milanNbg/fluxo.git
cd fluxo

# Install dependencies
pnpm install

# Start PostgreSQL
docker compose up -d

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run database migrations
pnpm --filter @fluxo/api exec prisma migrate dev
```

### Development

```bash
# Start backend (http://localhost:3000)
pnpm --filter @fluxo/api dev

# Start frontend (http://localhost:5173)
pnpm --filter @fluxo/web dev
```

### Health Check

After starting, verify everything works:

```bash
curl http://localhost:3000/health/ready
```

Expected response:

```json
{
  "status": "ready",
  "checks": { "server": "ok", "database": "ok" }
}
```

## License

MIT © [milanNbg](https://github.com/milanNbg)