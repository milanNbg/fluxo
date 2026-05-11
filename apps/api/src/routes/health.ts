import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      version: '0.1.0',
    };
  });

  fastify.get('/ready', async () => {
    return {
      status: 'ready',
      checks: {
        server: 'ok',
      },
    };
  });
};