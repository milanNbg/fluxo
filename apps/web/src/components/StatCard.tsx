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
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && (
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>

      {trend && (
        <p className={`mt-2 text-xs font-medium ${trendColors[trend.variant ?? 'neutral']}`}>
          {trend.label}
        </p>
      )}

      {helpText && !trend && (
        <p className="mt-2 text-xs text-gray-500">{helpText}</p>
      )}

      {children}
    </div>
  );
}