import { useState } from 'react';
import { notify } from '@/lib/toast';
import type { BudgetWithStats } from '@fluxo/shared';
import { useListBudgetsQuery, useDeleteBudgetMutation } from '@/app/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { BudgetCard } from '@/features/budgets/BudgetCard';
import { BudgetForm } from '@/features/budgets/BudgetForm';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetWithStats | null>(null);
  const [deleting, setDeleting] = useState<BudgetWithStats | null>(null);

  const { data, isLoading, isFetching } = useListBudgetsQuery({ month, year });
  const [deleteBudget, { isLoading: isDeleting }] = useDeleteBudgetMutation();

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteBudget(deleting.id).unwrap();
      setDeleting(null);
      notify.success('Budget deleted');
    } catch (err) {
      notify.apiError(err, 'Failed to delete budget');
    }
  };

  const budgets = data?.budgets ?? [];
  const totalBudget = budgets.reduce((sum, b) => sum + Number.parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number.parseFloat(b.spent), 0);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Budgets</h1>
            <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
              Set monthly spending limits by category
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>+ Add budget</Button>
        </div>

        {/* Month switcher */}
        <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Previous month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Next month"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!isLoading && budgets.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-16">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-50 text-3xl">
              💰
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No budgets for {MONTH_NAMES[month - 1]}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Set a spending limit for a category to track your progress.
            </p>
            <Button className="mt-6" onClick={() => setIsAddOpen(true)}>
              + Add your first budget
            </Button>
          </div>
        )}

        {!isLoading && budgets.length > 0 && (
          <>
            {/* Summary */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-500">Total spent this month</span>
                <span className="text-sm text-gray-500">of €{totalBudget.toFixed(2)} budgeted</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                €{totalSpent.toFixed(2)}
              </p>
            </div>

            <div
              className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 ${isFetching ? 'opacity-60' : ''}`}
            >
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add budget"
        description={`Set a limit for ${MONTH_NAMES[month - 1]} ${year}`}
      >
        <BudgetForm
          month={month}
          year={year}
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit budget"
        description="Update the monthly limit"
      >
        {editing && (
          <BudgetForm
            budget={editing}
            month={month}
            year={year}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete budget?"
        message={
          deleting
            ? `This will delete the budget for ${deleting.categoryName}. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
