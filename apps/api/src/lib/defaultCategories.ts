interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Food & Drinks', icon: '🍔', color: '#f59e0b' },
  { name: 'Rent & Utilities', icon: '🏠', color: '#3b82f6' },
  { name: 'Transport', icon: '🚗', color: '#8b5cf6' },
  { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
  { name: 'Shopping', icon: '🛍️', color: '#06b6d4' },
  { name: 'Health', icon: '💊', color: '#10b981' },
  { name: 'Salary', icon: '💼', color: '#22c55e' },
  { name: 'Other', icon: '📌', color: '#6b7280' },
];