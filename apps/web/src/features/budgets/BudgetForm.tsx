import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notify } from '@/lib/toast';
import { z } from 'zod';
import type { BudgetWithStats } from '@fluxo/shared';
import {
  useListCategoriesQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
} from '@/app/api';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const formSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .refine((val: string) => Number.parseFloat(val) > 0, 'Amount must be greater than 0'),
  categoryId: z.string().uuid('Please select a category'),
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
  return 'Failed to save budget. Please try again.';
}

interface BudgetFormProps {
  budget?: BudgetWithStats;
  month: number;
  year: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BudgetForm({ budget, month, year, onSuccess, onCancel }: BudgetFormProps) {
  const isEditMode = Boolean(budget);

  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategoriesQuery();
  const [createBudget, { isLoading: isCreating, error: createError }] = useCreateBudgetMutation();
  const [updateBudget, { isLoading: isUpdating, error: updateError }] = useUpdateBudgetMutation();

  const isSubmitting = isCreating || isUpdating;
  const error = createError ?? updateError;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      amount: budget?.amount ?? '',
      categoryId: budget?.categoryId ?? '',
    },
  });

  const onSubmit = async (data: FormInput) => {
    try {
      if (isEditMode && budget) {
        await updateBudget({
          id: budget.id,
          input: { amount: Number.parseFloat(data.amount) },
        }).unwrap();
      } else {
        await createBudget({
          amount: Number.parseFloat(data.amount),
          categoryId: data.categoryId,
          month,
          year,
        }).unwrap();
      }
      notify.success(isEditMode ? 'Budget updated' : 'Budget created');
      onSuccess();
    } catch {
      // Error displayed via RTK Query state
    }
  };

  if (isLoadingCategories) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const categories = categoriesData?.categories ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Category"
        defaultValue={budget?.categoryId ?? ''}
        error={errors.categoryId?.message}
        disabled={isEditMode}
        {...register('categoryId')}
      >
        <option value="" disabled>
          Select a category
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.icon ? `${cat.icon} ` : ''}
            {cat.name}
          </option>
        ))}
      </Select>

      <Input
        label="Monthly limit (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount')}
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
          {isEditMode ? 'Save changes' : 'Create budget'}
        </Button>
      </div>
    </form>
  );
}
