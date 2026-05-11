import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const userSchema = z.object({
  id: z.string().uuid(),
  email: emailSchema,
  name: z.string().min(1).max(100).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const registerUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1, 'Name is required').max(100).optional(),
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type User = z.infer<typeof userSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;