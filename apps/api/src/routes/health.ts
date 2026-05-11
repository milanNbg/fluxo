import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      version: '0.1.0',
    };
  });

  fastify.get('/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ready',
        checks: {
          server: 'ok',
          database: 'ok',
        },
      };
    } catch (err) {
      fastify.log.error({ err }, 'Database health check failed');
      return reply.status(503).send({
        status: 'not_ready',
        checks: {
          server: 'ok',
          database: 'error',
        },
      });
    }
  });
};