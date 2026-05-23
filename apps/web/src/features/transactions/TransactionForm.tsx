import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notify } from '@/lib/toast';
import { z } from 'zod';
import { transactionTypeSchema, type Transaction } from '@fluxo/shared';
import {
  useListCategoriesQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '@/app/api';
import { Input } from '@/components/Input';
import { DatePicker } from '@/components/DatePicker';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const formSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .refine((val: string) => Number.parseFloat(val) > 0, 'Amount must be greater than 0'),
  type: transactionTypeSchema,
  description: z.string().max(255, 'Description is too long').optional(),
  date: z
    .string()
    .min(1, 'Date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  categoryId: z.string().uuid('Please select a category'),
});

type FormInput = z.infer<typeof formSchema>;

interface FetchBaseQueryError {
  data?: { message?: string };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const err = error as FetchBaseQueryError;
    const message = err.data?.message;
    if (typeof message === 'string') return message;
  }
  return 'Failed to save transaction. Please try again.';
}

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const isEditMode = Boolean(transaction);
  const today = new Date().toISOString().split('T')[0]!;

  const { data: categoriesData, isLoading: isLoadingCategories } = useListCategoriesQuery();
  const [createTransaction, { isLoading: isCreating, error: createError }] =
    useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating, error: updateError }] =
    useUpdateTransactionMutation();

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
      type: transaction?.type ?? 'expense',
      amount: transaction?.amount ?? '',
      description: transaction?.description ?? '',
      date: transaction?.date ?? today,
      categoryId: transaction?.categoryId ?? '',
    },
  });

  const onSubmit = async (data: FormInput) => {
    try {
      if (isEditMode && transaction) {
        await updateTransaction({
          id: transaction.id,
          input: {
            amount: Number.parseFloat(data.amount),
            type: data.type,
            description: data.description,
            date: data.date,
            categoryId: data.categoryId,
          },
        }).unwrap();
      } else {
        await createTransaction({
          amount: Number.parseFloat(data.amount),
          type: data.type,
          description: data.description,
          date: data.date,
          categoryId: data.categoryId,
        }).unwrap();
      }
      notify.success(isEditMode ? 'Transaction updated' : 'Transaction added');
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
      <Select label="Type" error={errors.type?.message} {...register('type')}>
        <option value="expense">💸 Expense</option>
        <option value="income">💰 Income</option>
      </Select>

      <Input
        label="Amount (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <Select
        label="Category"
        defaultValue={transaction?.categoryId ?? ''}
        error={errors.categoryId?.message}
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

      <Controller
        control={control}
        name="date"
        render={({ field }) => (
          <DatePicker
            label="Date"
            value={field.value}
            onChange={field.onChange}
            placeholder="Select date"
            error={errors.date?.message}
          />
        )}
      />

      <Input
        label="Description (optional)"
        type="text"
        placeholder="e.g. Lunch at the office"
        error={errors.description?.message}
        {...register('description')}
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
          {isEditMode ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  );
}
