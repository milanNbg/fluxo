import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notify } from '@/lib/toast';
import { z } from 'zod';
import { useAddContributionMutation } from '@/app/api';
import { Input } from '@/components/Input';
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/Button';

const formSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
    .refine((val: string) => Number.parseFloat(val) > 0, 'Must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(255).optional(),
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
  return 'Failed to add contribution. Please try again.';
}

interface ContributionFormProps {
  goalId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ContributionForm({ goalId, onSuccess, onCancel }: ContributionFormProps) {
  const today = new Date().toISOString().split('T')[0]!;
  const [addContribution, { isLoading, error }] = useAddContributionMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: { amount: '', date: today, note: '' },
  });

  const onSubmit = async (data: FormInput) => {
    try {
      await addContribution({
        goalId,
        input: {
          amount: Number.parseFloat(data.amount),
          date: data.date,
          note: data.note || undefined,
        },
      }).unwrap();
      notify.success('Contribution added');
      onSuccess();
    } catch {
      // Error displayed via RTK Query state
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Amount (€)"
        type="number"
        step="0.01"
        min="0"
        placeholder="200.00"
        error={errors.amount?.message}
        {...register('amount')}
      />

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
        label="Note (optional)"
        type="text"
        placeholder="e.g. Monthly savings"
        error={errors.note?.message}
        {...register('note')}
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
        <Button type="submit" isLoading={isLoading}>
          Add contribution
        </Button>
      </div>
    </form>
  );
}
