import { type ReactNode, useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/app/api';
import { ChatPanel } from '@/features/ai/ChatPanel';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/dashboard/transactions', label: 'Transactions' },
  { to: '/dashboard/budgets', label: 'Budgets' },
  { to: '/dashboard/goals', label: 'Goals' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Logout always clears local state even on error
    } finally {
      navigate('/', { replace: true });
    }
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((part) => part[0] ?? '')
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user.email[0] ?? '?').toUpperCase();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 border-r border-gray-200 bg-white md:flex md:flex-col">
        <div className="border-b border-gray-200 px-6 py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-gray-900">
            <span className="text-primary-600">Fluxo</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            className="mt-4 flex w-full items-center gap-2 rounded-lg bg-linear-to-r from-primary-500 to-primary-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
          >
            <span className="text-base" aria-hidden="true">
              ✨
            </span>
            AI Assistant
          </button>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user.name ?? user.email}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-gray-200 bg-white px-6 py-4 md:hidden">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              <span className="text-primary-600">Fluxo</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="rounded-lg bg-linear-to-r from-primary-500 to-primary-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                aria-label="Open AI Assistant"
              >
                ✨ AI
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoggingOut ? '...' : 'Sign out'}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8">{children}</div>
      </main>

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}