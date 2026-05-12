import { Link } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import {
  selectIsAuthenticated,
  selectIsInitialized,
} from '@/features/auth/authSlice';
import { Navigate } from 'react-router';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function HomePage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-primary-50 to-white px-6">
      <div className="max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-medium text-primary-700">
          <span className="size-2 rounded-full bg-success" />
          Now in active development
        </div>

        <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">
          Welcome to <span className="text-primary-600">Fluxo</span>
        </h1>

        <p className="mb-8 text-xl leading-relaxed text-gray-600">
          Your personal finance dashboard, powered by AI. Track expenses,
          manage budgets, and get intelligent insights — all in one place.
        </p>

        <div className="mb-12 flex justify-center gap-3">
          <Link
            to="/register"
            className="rounded-lg bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            Get started for free
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">React 19</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">TypeScript</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Redux Toolkit</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Tailwind 4</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Fastify</span>
          <span className="rounded-md bg-gray-100 px-3 py-1 font-mono">Prisma</span>
        </div>
      </div>
    </main>
  );
}