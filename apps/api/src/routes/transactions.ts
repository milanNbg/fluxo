import type { FastifyPluginAsync } from 'fastify';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
} from '@fluxo/shared';
import {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transaction.service.js';

export const transactionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = transactionFiltersSchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid filters');
      }

      const result = await listTransactions(request.user.sub, parsed.data);
      return result;
    },
  );

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const transaction = await getTransaction(
        fastify,
        request.user.sub,
        request.params.id,
      );
      return { transaction };
    },
  );

  fastify.post(
    '/',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = createTransactionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const transaction = await createTransaction(
        fastify,
        request.user.sub,
        parsed.data,
      );
      return reply.status(201).send({ transaction });
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = updateTransactionSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const transaction = await updateTransaction(
        fastify,
        request.user.sub,
        request.params.id,
        parsed.data,
      );
      return { transaction };
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      await deleteTransaction(fastify, request.user.sub, request.params.id);
      return reply.status(204).send();
    },
  );
};