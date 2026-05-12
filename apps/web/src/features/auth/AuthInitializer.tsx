import { useEffect, type ReactNode } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { setInitialized, setCredentials } from '@/features/auth/authSlice';
import { api } from '@/app/api';

interface AuthInitializerProps {
  children: ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const refreshResult = await dispatch(
          api.endpoints.refresh.initiate(),
        ).unwrap();

        dispatch(
          setCredentials({
            user: refreshResult.user,
            accessToken: refreshResult.tokens.accessToken,
          }),
        );
      } catch {
        dispatch(setInitialized());
      }
    };

    void initializeAuth();
  }, [dispatch]);

  return <>{children}</>;
}