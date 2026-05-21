import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: {
    label: string;
    variant?: 'success' | 'danger' | 'neutral';
  };
  helpText?: string;
  children?: ReactNode;
}

export function StatCard({ label, value, icon, trend, helpText, children }: StatCardProps) {
  const trendColors = {
    success: 'text-success',
    danger: 'text-danger',
    neutral: 'text-gray-500',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
        {icon && (
          <span className="shrink-0 text-xl sm:text-2xl" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <p className="mt-2 break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {value}
      </p>

      {trend && (
        <p className={`mt-2 text-xs font-medium ${trendColors[trend.variant ?? 'neutral']}`}>
          {trend.label}
        </p>
      )}

      {helpText && !trend && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}

      {children}
    </div>
  );
}
