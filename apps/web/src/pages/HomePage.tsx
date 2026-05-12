import { useGetHealthQuery } from '@/app/api';

export function HomePage() {
  const { data, isLoading, isError } = useGetHealthQuery();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-primary-50 to-white px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
          <span className="size-2 rounded-full bg-success" />
          Coming soon
        </div>

        <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">
          Welcome to <span className="text-primary-600">Fluxo</span>
        </h1>

        <p className="mb-8 text-xl leading-relaxed text-gray-600">
          Your personal finance dashboard, powered by AI. Track expenses,
          manage budgets, and get intelligent insights — all in one place.
        </p>

        <div className="mb-6 flex justify-center gap-3">
          <a href="/register" className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700">
            Create account
          </a>
          <a href="/login" className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
            Sign in
          </a>
        </div>

        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-500">
            Backend Status
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="size-2 animate-pulse rounded-full bg-warning" />
              Connecting...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 text-danger">
              <span className="size-2 rounded-full bg-danger" />
              Backend unreachable
            </div>
          )}
          {data && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-success">
                <span className="size-2 rounded-full bg-success" />
                <span className="font-medium">Connected</span>
              </div>
              <div className="text-xs text-gray-500">
                Environment: <span className="font-mono">{data.environment}</span> ·
                Version: <span className="font-mono">{data.version}</span> ·
                Uptime: <span className="font-mono">{data.uptime.toFixed(1)}s</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">React 19</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">TypeScript</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Redux Toolkit</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Tailwind CSS 4</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Fastify</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Prisma</span>
        </div>
      </div>
    </main>
  );
}