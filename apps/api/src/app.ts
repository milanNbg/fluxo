import Fastify, { type FastifyInstance, type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import authPlugin from './plugins/auth.js';
import { loggerConfig } from './config/logger.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';

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

  await app.register(rateLimit, {
    global: false,
    max: 100,
    timeWindow: '1 minute',
    cache: 10000,
    allowList: env.NODE_ENV === 'development' ? ['127.0.0.1', '::1'] : [],
  });

  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (body === '') {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(body as string));
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  app.addContentTypeParser('*', (_req, _payload, done) => {
    done(null, {});
  });

  await app.register(authPlugin);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/auth' });

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