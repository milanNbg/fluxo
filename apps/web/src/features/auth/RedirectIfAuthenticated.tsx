import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import {
  selectIsAuthenticated,
  selectIsInitialized,
} from '@/features/auth/authSlice';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RedirectIfAuthenticatedProps {
  children: ReactNode;
}

export function RedirectIfAuthenticated({ children }: RedirectIfAuthenticatedProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}