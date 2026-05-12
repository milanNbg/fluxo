import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { DashboardLayout } from '@/components/DashboardLayout';

export function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name ?? 'there'}
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your finances.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Balance</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">€0.00</p>
            <p className="mt-1 text-xs text-gray-500">No data yet</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">This Month</p>
            <p className="mt-2 text-3xl font-bold text-success">+€0.00</p>
            <p className="mt-1 text-xs text-gray-500">Income vs expenses</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Active Budgets</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
            <p className="mt-1 text-xs text-gray-500">All within limits</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Your dashboard is ready
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Once you add transactions, you'll see insights, charts, and AI-powered
            recommendations here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}