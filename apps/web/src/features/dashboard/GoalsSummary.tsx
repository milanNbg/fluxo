import { Link } from 'react-router';
import { useListGoalsQuery } from '@/app/api';

export function GoalsSummary() {
  const { data, isLoading } = useListGoalsQuery();

  if (isLoading || !data) return null;

  // No goals → don't render
  if (data.goals.length === 0) return null;

  // Show active goals first, then completed; cap at 3 for the widget
  const sorted = [...data.goals].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'active' ? -1 : 1;
  });
  const visible = sorted.slice(0, 3);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-lg" aria-hidden="true">
            🎯
          </span>
          <h3 className="truncate text-base font-semibold text-gray-900">Savings goals</h3>
        </div>
        <Link
          to="/dashboard/goals"
          className="shrink-0 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          View all →
        </Link>
      </div>

      <ul className="divide-y divide-gray-100">
        {visible.map((goal) => {
          const isCompleted = goal.status === 'completed';
          return (
            <li key={goal.id} className="px-4 py-3 sm:px-6">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0" aria-hidden="true">
                    {goal.icon ?? '🎯'}
                  </span>
                  <span className="truncate text-sm font-medium text-gray-900">{goal.name}</span>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${
                    isCompleted ? 'text-success' : 'text-gray-500'
                  }`}
                >
                  {goal.percentage}%{isCompleted ? ' 🎉' : ''}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    isCompleted ? 'bg-success' : 'bg-primary-600'
                  }`}
                  style={{
                    width: `${goal.percentage}%`,
                    backgroundColor: !isCompleted && goal.color ? goal.color : undefined,
                  }}
                  role="progressbar"
                  aria-valuenow={Math.round(goal.percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>
                  €{goal.currentAmount} / €{goal.targetAmount}
                </span>
                {!isCompleted && goal.monthlyTarget && (
                  <span>€{goal.monthlyTarget}/mo to finish</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
