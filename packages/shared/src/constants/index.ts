export const API_PATHS = {
  HEALTH: '/health',
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  TRANSACTIONS: '/transactions',
  CATEGORIES: '/categories',
  BUDGETS: '/budgets',
} as const;

export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];