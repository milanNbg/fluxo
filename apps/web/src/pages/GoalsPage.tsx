import { useState } from 'react';
import type { GoalWithStats } from '@fluxo/shared';
import { useListGoalsQuery, useDeleteGoalMutation } from '@/app/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { GoalCard } from '@/features/goals/GoalCard';
import { GoalForm } from '@/features/goals/GoalForm';
import { ContributionForm } from '@/features/goals/ContributionForm';

export function GoalsPage() {
  const { data, isLoading } = useListGoalsQuery();
  const [deleteGoal, { isLoading: isDeleting }] = useDeleteGoalMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<GoalWithStats | null>(null);
  const [deleting, setDeleting] = useState<GoalWithStats | null>(null);
  const [contributing, setContributing] = useState<GoalWithStats | null>(null);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteGoal(deleting.id).unwrap();
      setDeleting(null);
    } catch {
      // Could add toast later
    }
  };

  const goals = data?.goals ?? [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Goals</h1>
            <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
              Track your savings goals and progress
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>+ Add goal</Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {!isLoading && goals.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-16">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-50 text-3xl">
              🎯
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No goals yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Set a savings goal and track your progress over time.
            </p>
            <Button className="mt-6" onClick={() => setIsAddOpen(true)}>
              + Add your first goal
            </Button>
          </div>
        )}

        {!isLoading && goals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddContribution={setContributing}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add goal"
        description="Set a new savings goal"
      >
        <GoalForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit goal"
        description="Update your goal details"
      >
        {editing && (
          <GoalForm
            goal={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={contributing !== null}
        onClose={() => setContributing(null)}
        title="Add contribution"
        description={contributing ? `Towards "${contributing.name}"` : ''}
      >
        {contributing && (
          <ContributionForm
            goalId={contributing.id}
            onSuccess={() => setContributing(null)}
            onCancel={() => setContributing(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete goal?"
        message={
          deleting
            ? `This will delete "${deleting.name}" and all its contributions. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
