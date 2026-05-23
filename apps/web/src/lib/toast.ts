import { toast } from 'sonner';

interface FetchBaseQueryError {
  data?: { message?: string; error?: string };
  status?: number | string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as FetchBaseQueryError;
    if (err.data?.message) return err.data.message;
    if (err.data?.error) return err.data.error;
    if (err.status === 'FETCH_ERROR') return 'Cannot reach server. Check your connection.';
  }
  return fallback;
}

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),

  // For RTK Query errors — extracts the backend message automatically
  apiError: (error: unknown, fallback = 'Something went wrong') => {
    toast.error(extractErrorMessage(error, fallback));
  },
};
