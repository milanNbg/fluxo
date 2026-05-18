import { z } from 'zod';

export const chatMessageRoleSchema = z.enum(['user', 'assistant']);
export type ChatMessageRole = z.infer<typeof chatMessageRoleSchema>;

export const chatMessageSchema = z.object({
  role: chatMessageRoleSchema,
  content: z.string().min(1).max(4000),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, 'At least one message is required')
    .max(20, 'Too many messages in conversation'),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const suggestedQuestionsSchema = z.array(z.string());
export type SuggestedQuestions = z.infer<typeof suggestedQuestionsSchema>;