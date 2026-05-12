import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { registerUserSchema, type RegisterUserInput } from '@fluxo/shared';
import { useRegisterMutation } from '@/app/api';
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

export function RegisterPage() {
  const navigate = useNavigate();
  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data: RegisterUserInput) => {
    try {
      await registerUser(data).unwrap();
      navigate('/dashboard', { replace: true });
    } catch {
      // Error displayed via RTK Query error state
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your finances with Fluxo"
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name')}
        />

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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
            {getErrorMessage(error)}
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}