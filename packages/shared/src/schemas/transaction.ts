import { z } from 'zod';

export const transactionTypeSchema = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long').trim(),
  icon: z.string().max(20).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex code like #3b82f6')
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const transactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.string(),
  type: transactionTypeSchema,
  description: z.string().nullable(),
  date: z.string(),
  categoryId: z.string().uuid(),
  category: categorySchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createTransactionSchema = z.object({
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
  type: transactionTypeSchema,
  description: z.string().max(255).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  categoryId: z.string().uuid('Invalid category ID'),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionListResponseSchema = z.object({
  transactions: z.array(transactionSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const transactionFiltersSchema = z.object({
  type: transactionTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionListResponse = z.infer<typeof transactionListResponseSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;