import { z } from 'zod';

export const goalStatusSchema = z.enum(['active', 'completed']);
export type GoalStatus = z.infer<typeof goalStatusSchema>;

const amountField = z
  .number()
  .positive('Amount must be greater than 0')
  .max(9999999999.99, 'Amount is too large')
  .or(
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
      .transform((val) => Number.parseFloat(val))
      .refine((val) => val > 0, 'Amount must be greater than 0'),
  );

export const goalContributionSchema = z.object({
  id: z.string().uuid(),
  amount: z.string(),
  date: z.string(),
  note: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export const goalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  targetAmount: z.string(),
  currentAmount: z.string(),
  targetDate: z.string().nullable(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  status: goalStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const goalWithStatsSchema = goalSchema.extend({
  percentage: z.number(),
  remaining: z.string(),
  contributions: z.array(goalContributionSchema),
  monthlyTarget: z.string().nullable(),
});

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').trim(),
  targetAmount: amountField,
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .nullable(),
  icon: z.string().max(20).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex code like #3b82f6')
    .optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  targetAmount: amountField.optional(),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  icon: z.string().max(20).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  status: goalStatusSchema.optional(),
});

export const createContributionSchema = z.object({
  amount: amountField,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  note: z.string().max(255).optional(),
});

export type GoalContribution = z.infer<typeof goalContributionSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type GoalWithStats = z.infer<typeof goalWithStatsSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type CreateContributionInput = z.infer<typeof createContributionSchema>;
