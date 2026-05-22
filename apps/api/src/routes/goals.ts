import type { FastifyPluginAsync } from 'fastify';
import { createGoalSchema, updateGoalSchema, createContributionSchema } from '@fluxo/shared';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  deleteContribution,
} from '../services/goal.service.js';

export const goalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', async (request) => {
    const goals = await listGoals(request.user.sub);
    return { goals };
  });

  fastify.post('/', async (request, reply) => {
    const parsed = createGoalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }
    const goal = await createGoal(request.user.sub, parsed.data);
    return reply.status(201).send({ goal });
  });

  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = updateGoalSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }
    const goal = await updateGoal(fastify, request.user.sub, request.params.id, parsed.data);
    return { goal };
  });

  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await deleteGoal(fastify, request.user.sub, request.params.id);
    return reply.status(204).send();
  });

  fastify.post<{ Params: { id: string } }>('/:id/contributions', async (request, reply) => {
    const parsed = createContributionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }
    const goal = await addContribution(fastify, request.user.sub, request.params.id, parsed.data);
    return reply.status(201).send({ goal });
  });

  fastify.delete<{ Params: { id: string; contributionId: string } }>(
    '/:id/contributions/:contributionId',
    async (request, reply) => {
      const goal = await deleteContribution(
        fastify,
        request.user.sub,
        request.params.id,
        request.params.contributionId,
      );
      return { goal };
    },
  );
};
