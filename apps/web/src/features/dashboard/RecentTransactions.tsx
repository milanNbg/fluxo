import { Link } from 'react-router';
import { useListTransactionsQuery } from '@/app/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function RecentTransactions() {
  const { data, isLoading } = useListTransactionsQuery({
    page: 1,
    pageSize: 5,
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">Recent transactions</h3>
          <p className="text-xs text-gray-500">Your 5 most recent entries</p>
        </div>
        <Link
          to="/dashboard/transactions"
          className="shrink-0 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          View all →
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {data && data.transactions.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-3 text-3xl" aria-hidden="true">
            💸
          </div>
          <p className="text-sm text-gray-600">No transactions yet</p>
          <Link
            to="/dashboard/transactions"
            className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Add your first transaction →
          </Link>
        </div>
      )}

      {data && data.transactions.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {data.transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:gap-4 sm:px-6"
            >
              {tx.category && (
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{
                    backgroundColor: tx.category.color ? `${tx.category.color}20` : '#f3f4f6',
                  }}
                  aria-hidden="true"
                >
                  {tx.category.icon ?? '📌'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {tx.description ?? tx.category?.name ?? 'Transaction'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {tx.category?.name} ·{' '}
                  {new Date(tx.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold ${
                  tx.type === 'income' ? 'text-success' : 'text-gray-900'
                }`}
              >
                {tx.type === 'income' ? '+' : '−'}€{Number(tx.amount).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
