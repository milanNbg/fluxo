import { buildApp } from './app.js';
import { env } from './config/env.js';

async function start(): Promise<void> {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    const shutdown = async (signal: string): Promise<void> => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await app.close();
        const { disconnectPrisma } = await import('./lib/prisma.js');
        await disconnectPrisma();
        app.log.info('Database disconnected');
        process.exit(0);
      } catch (err) {
        app.log.error({ err }, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void start();