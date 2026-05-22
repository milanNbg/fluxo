import { createBrowserRouter } from 'react-router';
import { HomePage } from '@/pages/HomePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { RedirectIfAuthenticated } from '@/features/auth/RedirectIfAuthenticated';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/register',
    element: (
      <RedirectIfAuthenticated>
        <RegisterPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/login',
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/dashboard/transactions',
    element: (
      <RequireAuth>
        <TransactionsPage />
      </RequireAuth>
    ),
  },
  {
    path: '/dashboard/budgets',
    element: (
      <RequireAuth>
        <BudgetsPage />
      </RequireAuth>
    ),
  },
]);
