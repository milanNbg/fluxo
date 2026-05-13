import { useState } from 'react';
import { useListTransactionsQuery } from '@/app/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { TransactionForm } from '@/features/transactions/TransactionForm';

export function TransactionsPage() {
  const [page] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data, isLoading, isError } = useListTransactionsQuery({
    page,
    pageSize: 20,
  });

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="mt-2 text-gray-600">
              Track your income and expenses
            </p>
          </div>
          <Button onClick={openAddModal}>+ Add transaction</Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 p-8 text-center">
            <p className="text-danger">Failed to load transactions. Please try again.</p>
          </div>
        )}

        {data && data.transactions.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-50 text-3xl">
              💸
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No transactions yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Add your first transaction to start tracking your finances.
            </p>
            <Button className="mt-6" onClick={openAddModal}>
              + Add your first transaction
            </Button>
          </div>
        )}

        {data && data.transactions.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {tx.category && (
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: tx.category.color
                              ? `${tx.category.color}15`
                              : '#f3f4f6',
                            color: tx.category.color ?? '#374151',
                          }}
                        >
                          {tx.category.icon && <span>{tx.category.icon}</span>}
                          {tx.category.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tx.description ?? '—'}
                    </td>
                    <td
                      className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${
                        tx.type === 'income' ? 'text-success' : 'text-gray-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '−'}€{Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button className="text-gray-400 hover:text-gray-600">
                        ⋯
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-xs text-gray-500">
              Showing {data.transactions.length} of {data.total} transactions
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title="Add transaction"
        description="Record a new income or expense"
      >
        <TransactionForm onSuccess={closeAddModal} onCancel={closeAddModal} />
      </Modal>
    </DashboardLayout>
  );
}