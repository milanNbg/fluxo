import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { loginUserSchema, type LoginUserInput } from '@fluxo/shared';
import { useLoginMutation } from '@/app/api';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

interface FetchBaseQueryError {
  data?: { message?: string };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const err = error as FetchBaseQueryError;
    if (err.data?.message) return err.data.message;
  }
  return 'Something went wrong. Please try again.';
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loginUser, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
  });

  const onSubmit = async (data: LoginUserInput) => {
    try {
      await loginUser(data).unwrap();
      navigate('/', { replace: true });
    } catch {
      // Error displayed via RTK Query error state
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Fluxo account"
      footer={
        <>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register('password')}
        />

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            {getErrorMessage(error)}
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}