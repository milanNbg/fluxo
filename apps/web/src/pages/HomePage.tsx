export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-white px-6">
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

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">React 19</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">TypeScript</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Redux Toolkit</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Tailwind CSS 4</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Vite 6</span>
        </div>
      </div>
    </main>
  );
}