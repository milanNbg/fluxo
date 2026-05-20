import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-base text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 sm:text-sm ${
            error
              ? 'border-danger focus:border-danger focus:ring-danger/20'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
