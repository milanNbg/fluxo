import { useState } from 'react';
import type { Transaction } from '@fluxo/shared';
import {
  useListTransactionsQuery,
  useListCategoriesQuery,
  useDeleteTransactionMutation,
} from '@/app/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Pagination } from '@/components/Pagination';
import { TransactionForm } from '@/features/transactions/TransactionForm';
import { TransactionActions } from '@/features/transactions/TransactionActions';
import {
  TransactionFilters,
  initialFilters,
  type FilterState,
} from '@/features/transactions/TransactionFilters';
import { ActiveFilterPills } from '@/features/transactions/ActiveFilterPills';

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const queryParams = {
    page,
    pageSize,
    ...(filters.type && { type: filters.type }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.search && { search: filters.search }),
  };

  const { data, isLoading, isFetching, isError } = useListTransactionsQuery(queryParams);
  const { data: categoriesData } = useListCategoriesQuery();
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRemoveFilter = (key: keyof FilterState) => {
    setFilters({ ...filters, [key]: '' });
    setPage(1);
  };

  const handleClearAll = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleEdit = (tx: Transaction) => setEditingTransaction(tx);
  const closeEditModal = () => setEditingTransaction(null);

  const handleDelete = (tx: Transaction) => setDeletingTransaction(tx);
  const closeDeleteDialog = () => setDeletingTransaction(null);

  const confirmDelete = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteTransaction(deletingTransaction.id).unwrap();
      closeDeleteDialog();
    } catch {
      // Error handling could be improved with toast notifications later
    }
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');
  const categories = categoriesData?.categories ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Transactions</h1>
            <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
              Track your income and expenses
            </p>
          </div>
          <Button onClick={openAddModal} className="sm:w-auto">
            + Add transaction
          </Button>
        </div>

        <TransactionFilters filters={filters} onFiltersChange={handleFiltersChange} />

        <ActiveFilterPills
          filters={filters}
          categories={categories}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAll}
        />

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

        {data && data.transactions.length === 0 && !hasActiveFilters && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-16">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-50 text-3xl">
              💸
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No transactions yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Add your first transaction to start tracking your finances.
            </p>
            <Button className="mt-6" onClick={openAddModal}>
              + Add your first transaction
            </Button>
          </div>
        )}

        {data && data.transactions.length === 0 && hasActiveFilters && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-16">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
              🔍
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No matching transactions</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting your filters or clearing them to see all transactions.
            </p>
            <Button variant="secondary" className="mt-6" onClick={handleClearAll}>
              Clear all filters
            </Button>
          </div>
        )}

        {data && data.transactions.length > 0 && (
          <div
            className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-opacity ${
              isFetching && !isLoading ? 'opacity-60' : ''
            }`}
          >
            {/* Desktop: Table view */}
            <div className="hidden md:block">
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
                      <td className="px-6 py-4 text-sm text-gray-600">{tx.description ?? '—'}</td>
                      <td
                        className={`whitespace-nowrap px-6 py-4 text-right text-sm font-semibold ${
                          tx.type === 'income' ? 'text-success' : 'text-gray-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '−'}€{Number(tx.amount).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <TransactionActions
                          transaction={tx}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card view */}
            <div className="divide-y divide-gray-100 md:hidden">
              {data.transactions.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {tx.category && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
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
                      </div>
                      {tx.description && (
                        <p className="mt-2 text-sm text-gray-900">{tx.description}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(tx.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`whitespace-nowrap text-sm font-semibold ${
                          tx.type === 'income' ? 'text-success' : 'text-gray-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '−'}€{Number(tx.amount).toFixed(2)}
                      </span>
                      <TransactionActions
                        transaction={tx}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              pageSize={pageSize}
              total={data.total}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
            />
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

      <Modal
        isOpen={editingTransaction !== null}
        onClose={closeEditModal}
        title="Edit transaction"
        description="Update the details below"
      >
        {editingTransaction && (
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={closeEditModal}
            onCancel={closeEditModal}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deletingTransaction !== null}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete transaction?"
        message={
          deletingTransaction
            ? `This will permanently delete the transaction for €${Number(deletingTransaction.amount).toFixed(2)}. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
