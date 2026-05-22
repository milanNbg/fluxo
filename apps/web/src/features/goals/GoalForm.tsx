import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { GoalWithStats } from '@fluxo/shared';
import { useCreateGoalMutation, useUpdateGoalMutation } from '@/app/api';
import { Input } from '@/components/Input';
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/Button';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  targetAmount: z
    .string()
    .min(1, 'Target is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .refine((val: string) => Number.parseFloat(val) > 0, 'Must be greater than 0'),
  targetDate: z.string().optional(),
  icon: z.string().max(20).optional(),
});

type FormInput = z.infer<typeof formSchema>;

interface FetchBaseQueryError {
  data?: { message?: string };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const err = error as FetchBaseQueryError;
    if (typeof err.data?.message === 'string') return err.data.message;
  }
  return 'Failed to save goal. Please try again.';
}

interface GoalFormProps {
  goal?: GoalWithStats;
  onSuccess: () => void;
  onCancel: () => void;
}

export function GoalForm({ goal, onSuccess, onCancel }: GoalFormProps) {
  const isEditMode = Boolean(goal);

  const [createGoal, { isLoading: isCreating, error: createError }] = useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating, error: updateError }] = useUpdateGoalMutation();

  const isSubmitting = isCreating || isUpdating;
  const error = createError ?? updateError;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      name: goal?.name ?? '',
      targetAmount: goal?.targetAmount ?? '',
      targetDate: goal?.targetDate ?? '',
      icon: goal?.icon ?? '',
    },
  });

  const onSubmit = async (data: FormInput) => {
    const payload = {
      name: data.name,
      targetAmount: Number.parseFloat(data.targetAmount),
      targetDate: data.targetDate ? data.targetDate : null,
      icon: data.icon || undefined,
    };

    try {
      if (isEditMode && goal) {
        await updateGoal({ id: goal.id, input: payload }).unwrap();
      } else {
        await createGoal(payload).unwrap();
      }
      onSuccess();
    } catch {
      // Error displayed via RTK Query state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Goal name"
        type="text"
        placeholder="e.g. Vacation in Japan"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Icon (emoji, optional)"
        type="text"
        placeholder="✈️"
        error={errors.icon?.message}
        {...register('icon')}
      />

      <Input
        label="Target amount (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="5000.00"
        error={errors.targetAmount?.message}
        {...register('targetAmount')}
      />

      <Controller
        control={control}
        name="targetDate"
        render={({ field }) => (
          <DatePicker
            label="Target date (optional)"
            value={field.value ?? ''}
            onChange={field.onChange}
            placeholder="No deadline"
            error={errors.targetDate?.message}
          />
        )}
      />

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {getErrorMessage(error)}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditMode ? 'Save changes' : 'Create goal'}
        </Button>
      </div>
    </form>
  );
}
