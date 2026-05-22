import { z } from 'zod';

export const budgetSchema = z.object({
  id: z.string().uuid(),
  amount: z.string(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  categoryId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createBudgetSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(9999999999.99, 'Amount is too large')
    .or(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format')
        .transform((val) => Number.parseFloat(val))
        .refine((val) => val > 0, 'Amount must be greater than 0'),
    ),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const updateBudgetSchema = z.object({
  amount: z
    .number()
    .positive()
    .max(9999999999.99)
    .or(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/)
        .transform((val) => Number.parseFloat(val))
        .refine((val) => val > 0),
    ),
});

export const budgetWithStatsSchema = budgetSchema.extend({
  categoryName: z.string(),
  categoryIcon: z.string().nullable(),
  categoryColor: z.string().nullable(),
  spent: z.string(),
  remaining: z.string(),
  percentage: z.number(),
  status: z.enum(['ok', 'warning', 'over']),
});

export const budgetListResponseSchema = z.object({
  budgets: z.array(budgetWithStatsSchema),
  month: z.number(),
  year: z.number(),
});

export const budgetFiltersSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export type Budget = z.infer<typeof budgetSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetWithStats = z.infer<typeof budgetWithStatsSchema>;
export type BudgetListResponse = z.infer<typeof budgetListResponseSchema>;
export type BudgetFilters = z.infer<typeof budgetFiltersSchema>;
