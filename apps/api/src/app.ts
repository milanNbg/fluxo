import Fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { loggerConfig } from './config/logger.js';
import { healthRoutes } from './routes/health.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: loggerConfig,
    trustProxy: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(sensible);

  await app.register(healthRoutes, { prefix: '/health' });

  app.setNotFoundHandler((request, reply) => {
    reply.notFound(`Route ${request.method}:${request.url} not found`);
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error({ err: error }, 'Request error');

    if (error.validation) {
      return reply.badRequest(error.message);
    }

    const statusCode = error.statusCode ?? 500;

    return reply.status(statusCode).send({
      error: error.name || 'InternalServerError',
      message:
        statusCode === 500 && env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : error.message,
      statusCode,
    });
  });

  return app;
}