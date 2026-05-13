import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, children, className = '', ...props }, ref) => {
    const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';