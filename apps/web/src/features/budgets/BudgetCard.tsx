import type { BudgetWithStats } from '@fluxo/shared';

interface BudgetCardProps {
  budget: BudgetWithStats;
  onEdit: (budget: BudgetWithStats) => void;
  onDelete: (budget: BudgetWithStats) => void;
}

const statusColors = {
  ok: { bar: 'bg-success', text: 'text-success', label: 'On track' },
  warning: { bar: 'bg-warning', text: 'text-warning', label: 'Getting close' },
  over: { bar: 'bg-danger', text: 'text-danger', label: 'Over budget' },
};

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const colors = statusColors[budget.status];
  const cappedPercentage = Math.min(budget.percentage, 100);
  const remaining = Number.parseFloat(budget.remaining);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xl" aria-hidden="true">
            {budget.categoryIcon ?? '📌'}
          </span>
          <span className="truncate font-semibold text-gray-900">{budget.categoryName}</span>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(budget)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Edit budget"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onDelete(budget)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Delete budget"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-gray-900">€{budget.spent}</span>
        <span className="text-sm text-gray-500">of €{budget.amount}</span>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${colors.bar}`}
          style={{ width: `${cappedPercentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(budget.percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={`font-medium ${colors.text}`}>
          {budget.percentage}% · {colors.label}
        </span>
        <span className="text-gray-500">
          {remaining >= 0 ? `€${budget.remaining} left` : `€${Math.abs(remaining).toFixed(2)} over`}
        </span>
      </div>
    </div>
  );
}
