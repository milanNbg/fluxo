import type { GoalWithStats } from '@fluxo/shared';
import { Button } from '@/components/Button';

interface GoalCardProps {
  goal: GoalWithStats;
  onAddContribution: (goal: GoalWithStats) => void;
  onEdit: (goal: GoalWithStats) => void;
  onDelete: (goal: GoalWithStats) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function GoalCard({ goal, onAddContribution, onEdit, onDelete }: GoalCardProps) {
  const isCompleted = goal.status === 'completed';
  const barColor = isCompleted ? 'bg-success' : goal.color ? '' : 'bg-primary-600';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xl" aria-hidden="true">
            {goal.icon ?? '🎯'}
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-900">{goal.name}</h3>
            {goal.targetDate && (
              <p className="text-xs text-gray-500">Target: {formatDate(goal.targetDate)}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Edit goal"
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
            onClick={() => onDelete(goal)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Delete goal"
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
        <span className="text-2xl font-bold tracking-tight text-gray-900">
          €{goal.currentAmount}
        </span>
        <span className="text-sm text-gray-500">of €{goal.targetAmount}</span>
      </div>

      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
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

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={`font-medium ${isCompleted ? 'text-success' : 'text-gray-600'}`}>
          {goal.percentage}% {isCompleted ? '· Completed 🎉' : 'saved'}
        </span>
        {!isCompleted && <span className="text-gray-500">€{goal.remaining} to go</span>}
      </div>

      {goal.monthlyTarget && !isCompleted && (
        <p className="mt-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
          Save <strong>€{goal.monthlyTarget}/month</strong> to reach your goal on time
        </p>
      )}

      {!isCompleted && (
        <Button variant="secondary" className="mt-3 w-full" onClick={() => onAddContribution(goal)}>
          + Add contribution
        </Button>
      )}

      {goal.contributions.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700">
            {goal.contributions.length} contribution
            {goal.contributions.length > 1 ? 's' : ''}
          </summary>
          <ul className="mt-2 space-y-1">
            {goal.contributions.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {formatDate(c.date)}
                  {c.note ? ` · ${c.note}` : ''}
                </span>
                <span className="font-medium text-gray-900">€{c.amount}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
