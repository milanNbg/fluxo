import type { FastifyPluginAsync } from 'fastify';
import { chatRequestSchema } from '@fluxo/shared';
import {
  streamChatResponse,
  getSuggestedQuestions,
} from '../services/ai.service.js';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/suggestions',
    { onRequest: [fastify.authenticate] },
    async () => {
      return { questions: getSuggestedQuestions() };
    },
  );

  fastify.post(
    '/chat',
    {
      onRequest: [fastify.authenticate],
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parsed = chatRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(
          parsed.error.errors[0]?.message ?? 'Invalid request',
        );
      }

      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('X-Accel-Buffering', 'no');

      try {
        const stream = streamChatResponse(request.user.sub, parsed.data.messages);

        for await (const chunk of stream) {
          const data = JSON.stringify({ type: 'chunk', text: chunk });
          reply.raw.write(`data: ${data}\n\n`);
        }

        reply.raw.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        reply.raw.end();
      } catch (err) {
        fastify.log.error({ err }, 'AI chat stream failed');
        const isConnectionError =
          err instanceof Error &&
          (err.message.includes('fetch failed') ||
            err.message.includes('Connection error'));

        const errorMessage = isConnectionError
          ? 'Unable to reach the AI service. Please check your connection and try again.'
          : 'Failed to generate response. Please try again.';

        const errorData = JSON.stringify({
          type: 'error',
          message: errorMessage,
        });
        reply.raw.write(`data: ${errorData}\n\n`);
        reply.raw.end();
      }
    },
  );
};