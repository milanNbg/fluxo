import type { ReactNode } from 'react';
import { Link } from 'react-router';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-block text-3xl font-bold tracking-tight text-gray-900 hover:text-primary-600 transition-colors"
          >
            <span className="text-primary-600">Fluxo</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          {footer}
        </div>
      </div>
    </main>
  );
}