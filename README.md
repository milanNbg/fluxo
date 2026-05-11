# Fluxo

Modern personal finance dashboard with AI-powered insights. Track expenses, manage budgets, set savings goals, and get intelligent recommendations powered by Claude.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 6
- Redux Toolkit + RTK Query
- Tailwind CSS 4 + shadcn/ui
- React Hook Form + Zod
- Recharts

**Backend**
- Node.js 22 + Fastify
- PostgreSQL + Prisma ORM
- JWT authentication with refresh tokens
- Zod validation
- Anthropic API integration

**Infrastructure**
- pnpm workspaces + Turborepo monorepo
- Docker (local development)
- GitHub Actions (CI/CD)
- Vercel (frontend hosting)
- Railway / Neon (backend + database)

## Project Structure

\`\`\`
fluxo/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Node.js backend
├── packages/
│   └── shared/       # Shared types, Zod schemas, constants
└── ...
\`\`\`

## Getting Started

> 🚧 Project is in active development. Setup instructions coming soon.

## License

MIT © [milanNbg](https://github.com/milanNbg)