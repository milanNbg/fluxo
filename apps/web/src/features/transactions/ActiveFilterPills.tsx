import type { Category } from '@fluxo/shared';
import type { FilterState } from './TransactionFilters';

interface ActiveFilterPillsProps {
  filters: FilterState;
  categories: Category[];
  onRemove: (key: keyof FilterState) => void;
  onClearAll: () => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ActiveFilterPills({
  filters,
  categories,
  onRemove,
  onClearAll,
}: ActiveFilterPillsProps) {
  const activeFilters: Array<{ key: keyof FilterState; label: string }> = [];

  if (filters.type) {
    activeFilters.push({
      key: 'type',
      label: `Type: ${filters.type === 'expense' ? '💸 Expenses' : '💰 Income'}`,
    });
  }

  if (filters.categoryId) {
    const category = categories.find((c) => c.id === filters.categoryId);
    if (category) {
      activeFilters.push({
        key: 'categoryId',
        label: `Category: ${category.icon ?? ''} ${category.name}`,
      });
    }
  }

  if (filters.startDate) {
    activeFilters.push({
      key: 'startDate',
      label: `From: ${formatDate(filters.startDate)}`,
    });
  }

  if (filters.endDate) {
    activeFilters.push({
      key: 'endDate',
      label: `To: ${formatDate(filters.endDate)}`,
    });
  }

  if (filters.search) {
    activeFilters.push({
      key: 'search',
      label: `Search: "${filters.search}"`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Active filters:</span>
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove(filter.key)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
        >
          {filter.label}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-3"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-gray-500 underline transition-colors hover:text-gray-700"
      >
        Clear all
      </button>
    </div>
  );
}