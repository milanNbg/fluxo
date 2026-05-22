import { Link } from 'react-router';
import { useListBudgetsQuery } from '@/app/api';

export function BudgetAlerts() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, isLoading } = useListBudgetsQuery({ month, year });

  if (isLoading || !data) return null;

  const alerts = data.budgets.filter((b) => b.status === 'warning' || b.status === 'over');

  // No budgets at all → don't render
  if (data.budgets.length === 0) return null;

  // All on track → positive message
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/5 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            ✅
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">All budgets on track</h3>
            <p className="text-xs text-gray-600">
              You're within your limits this month. Keep it up!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-lg" aria-hidden="true">
            ⚠️
          </span>
          <h3 className="truncate text-base font-semibold text-gray-900">Budget alerts</h3>
        </div>
        <Link
          to="/dashboard/budgets"
          className="shrink-0 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Manage →
        </Link>
      </div>

      <ul className="divide-y divide-gray-100">
        {alerts.map((budget) => {
          const isOver = budget.status === 'over';
          return (
            <li key={budget.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <span className="shrink-0 text-lg" aria-hidden="true">
                {budget.categoryIcon ?? '📌'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{budget.categoryName}</p>
                <p className={`text-xs font-medium ${isOver ? 'text-danger' : 'text-warning'}`}>
                  {budget.percentage}% · {isOver ? 'Over budget' : 'Getting close'}
                </p>
              </div>
              <p className="shrink-0 text-sm text-gray-500">
                €{budget.spent} / €{budget.amount}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
