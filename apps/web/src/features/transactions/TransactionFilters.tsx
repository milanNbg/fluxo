import { useState, useEffect } from 'react';
import type { TransactionType } from '@fluxo/shared';
import { useListCategoriesQuery } from '@/app/api';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { DatePicker } from '@/components/DatePicker';

export interface FilterState {
  type: TransactionType | '';
  categoryId: string;
  startDate: string;
  endDate: string;
  search: string;
}

export const initialFilters: FilterState = {
  type: '',
  categoryId: '',
  startDate: '',
  endDate: '',
  search: '',
};

interface TransactionFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const { data: categoriesData } = useListCategoriesQuery();
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const categories = categoriesData?.categories ?? [];

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Search"
          type="text"
          placeholder="Search by description..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />

        <Select
          label="Type"
          value={filters.type}
          onChange={(e) => updateFilter('type', e.target.value as TransactionType | '')}
        >
          <option value="">All types</option>
          <option value="expense">💸 Expenses</option>
          <option value="income">💰 Income</option>
        </Select>

        <Select
          label="Category"
          value={filters.categoryId}
          onChange={(e) => updateFilter('categoryId', e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon ? `${cat.icon} ` : ''}
              {cat.name}
            </option>
          ))}
        </Select>

        <DatePicker
          label="From date"
          value={filters.startDate}
          onChange={(value) => updateFilter('startDate', value)}
          placeholder="Any start date"
        />

        <DatePicker
          label="To date"
          value={filters.endDate}
          onChange={(value) => updateFilter('endDate', value)}
          placeholder="Any end date"
        />
      </div>
    </div>
  );
}
