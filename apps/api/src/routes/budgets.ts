import type { FastifyPluginAsync } from 'fastify';
import { createBudgetSchema, updateBudgetSchema, budgetFiltersSchema } from '@fluxo/shared';
import {
  listBudgetsForMonth,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../services/budget.service.js';

export const budgetRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    const parsed = budgetFiltersSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid filters');
    }

    const { month, year } = parsed.data;
    const budgets = await listBudgetsForMonth(request.user.sub, month, year);

    return { budgets, month, year };
  });

  fastify.post('/', async (request, reply) => {
    const parsed = createBudgetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const budget = await createBudget(fastify, request.user.sub, parsed.data);
    return reply.status(201).send({ budget });
  });

  fastify.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const parsed = updateBudgetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const budget = await updateBudget(fastify, request.user.sub, request.params.id, parsed.data);
    return { budget };
  });

  fastify.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    await deleteBudget(fastify, request.user.sub, request.params.id);
    return reply.status(204).send();
  });
};
