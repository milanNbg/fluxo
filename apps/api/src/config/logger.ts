import type { LoggerOptions } from 'pino';
import { env } from './env.js';

const isDevelopment = env.NODE_ENV === 'development';

export const loggerConfig: LoggerOptions = {
  level: env.LOG_LEVEL,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
    censor: '[REDACTED]',
  },
};