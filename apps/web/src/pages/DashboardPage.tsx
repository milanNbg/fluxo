import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetTransactionStatsQuery } from '@/app/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { StatCard } from '@/components/StatCard';
import { RecentTransactions } from '@/features/dashboard/RecentTransactions';
import { CategoryBreakdown } from '@/features/dashboard/CategoryBreakdown';
import { BudgetAlerts } from '@/features/dashboard/BudgetAlerts';
import { GoalsSummary } from '@/features/dashboard/GoalsSummary';

function formatAmount(value: string): string {
  const num = Number.parseFloat(value);
  return num.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMonth(): string {
  return new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const { data: stats, isLoading } = useGetTransactionStatsQuery();

  if (!user) return null;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const balance = stats ? Number.parseFloat(stats.totalBalance) : 0;
  const monthlyBalance = stats ? Number.parseFloat(stats.monthlyBalance) : 0;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {getGreeting()}, {user.name ?? 'there'}
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Here's an overview of your finances.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total balance"
            value={`€${stats ? formatAmount(stats.totalBalance) : '0.00'}`}
            icon="💰"
            trend={
              stats && balance !== 0
                ? {
                    label: balance > 0 ? 'Net positive' : 'Net negative',
                    variant: balance > 0 ? 'success' : 'danger',
                  }
                : undefined
            }
            helpText={stats?.transactionCount === 0 ? 'No transactions yet' : undefined}
          />

          <StatCard
            label={formatMonth()}
            value={`${monthlyBalance >= 0 ? '+' : '−'}€${stats ? formatAmount(Math.abs(monthlyBalance).toString()) : '0.00'}`}
            icon="📅"
            trend={
              stats
                ? {
                    label: `Income €${formatAmount(stats.monthlyIncome)} · Expenses €${formatAmount(stats.monthlyExpense)}`,
                    variant: monthlyBalance >= 0 ? 'success' : 'danger',
                  }
                : undefined
            }
          />

          <StatCard
            label="Total transactions"
            value={String(stats?.transactionCount ?? 0)}
            icon="📊"
            helpText={
              stats && stats.transactionCount > 0
                ? `Income: €${formatAmount(stats.totalIncome)} · Expenses: €${formatAmount(stats.totalExpense)}`
                : 'Start tracking your finances'
            }
          />
        </div>

        <div className="mb-6">
          <BudgetAlerts />
          <GoalsSummary />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentTransactions />
          <CategoryBreakdown breakdown={stats?.expenseBreakdown ?? []} />
        </div>
      </div>
    </DashboardLayout>
  );
}
