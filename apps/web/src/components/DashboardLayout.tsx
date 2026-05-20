import { type ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, NavLink, useLocation } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useLogoutMutation } from '@/app/api';
import { ChatPanel } from '@/features/ai/ChatPanel';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: '📊' },
  { to: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  { to: '/dashboard/budgets', label: 'Budgets', icon: '💰' },
  { to: '/dashboard/goals', label: 'Goals', icon: '🎯' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useAppSelector(selectCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on ESC
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

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

  const sidebarContent = (
    <>
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
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="text-base" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => {
            setIsChatOpen(true);
            setIsMobileMenuOpen(false);
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-lg bg-linear-to-r from-primary-500 to-primary-700 px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
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
            <p className="truncate text-sm font-medium text-gray-900">{user.name ?? user.email}</p>
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white md:flex md:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm transition-opacity md:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {sidebarContent}
      </aside>

      <main className="flex-1">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="Open navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/dashboard" className="text-xl font-bold text-gray-900">
              <span className="text-primary-600">Fluxo</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="rounded-lg bg-linear-to-r from-primary-500 to-primary-700 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
              aria-label="Open AI Assistant"
            >
              ✨ AI
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">{children}</div>
      </main>

      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
