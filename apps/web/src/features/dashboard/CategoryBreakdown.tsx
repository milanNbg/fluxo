import type { CategoryBreakdownItem } from '@fluxo/shared';

interface CategoryBreakdownProps {
  breakdown: CategoryBreakdownItem[];
}

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-base font-semibold text-gray-900">Expense breakdown</h3>
        <p className="text-xs text-gray-500">Where your money goes, by category</p>
      </div>

      {breakdown.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-3 text-3xl" aria-hidden="true">📊</div>
          <p className="text-sm text-gray-600">No expenses yet</p>
          <p className="mt-1 text-xs text-gray-500">
            Add some expenses to see your spending breakdown
          </p>
        </div>
      ) : (
        <ul className="space-y-4 p-6">
          {breakdown.map((item) => (
            <li key={item.categoryId}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true">{item.categoryIcon ?? '📌'}</span>
                  <span className="truncate font-medium text-gray-700">
                    {item.categoryName}
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-500">
                    ({item.transactionCount})
                  </span>
                </div>
                <div className="flex flex-shrink-0 items-baseline gap-2">
                  <span className="font-semibold text-gray-900">
                    €{Number(item.total).toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.categoryColor ?? '#6b7280',
                  }}
                  role="progressbar"
                  aria-valuenow={Math.round(item.percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.categoryName}: ${item.percentage.toFixed(1)}%`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}