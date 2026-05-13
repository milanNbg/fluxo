import { Button } from './Button';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const showNavigation = totalPages > 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 px-6 py-3">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>
          Showing <span className="font-medium text-gray-700">{startItem}</span>
          {endItem !== startItem && (
            <>
              {' to '}
              <span className="font-medium text-gray-700">{endItem}</span>
            </>
          )}
          {' of '}
          <span className="font-medium text-gray-700">{total}</span>
          {' transactions'}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">·</span>
            <label htmlFor="page-size" className="text-gray-500">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-gray-500">per page</span>
          </div>
        )}
      </div>

      {showNavigation && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            ← Previous
          </Button>
          <span className="px-2 text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}