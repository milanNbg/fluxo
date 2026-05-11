import { z } from 'zod';

export const healthCheckSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
  environment: z.string(),
  version: z.string(),
});

export type HealthCheckResponse = z.infer<typeof healthCheckSchema>;