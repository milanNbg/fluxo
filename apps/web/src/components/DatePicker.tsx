import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import 'react-day-picker/style.css';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Select date',
  error,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const validDate = selectedDate && isValid(selectedDate) ? selectedDate : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const displayValue = validDate ? format(validDate, 'dd MMM yyyy') : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-base shadow-sm transition-colors focus:outline-none focus:ring-2 sm:text-sm ${
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
        } ${displayValue ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-2 size-4 flex-shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fluxo-datepicker absolute left-0 z-50 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
          <DayPicker
            mode="single"
            selected={validDate}
            onSelect={handleSelect}
            showOutsideDays
            weekStartsOn={1}
          />
        </div>
      )}

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
