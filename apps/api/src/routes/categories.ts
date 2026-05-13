import type { FastifyPluginAsync } from 'fastify';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@fluxo/shared';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/category.service.js';

export const categoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const categories = await listCategories(request.user.sub);
      return { categories };
    },
  );

  fastify.post(
    '/',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = createCategorySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const category = await createCategory(fastify, request.user.sub, parsed.data);
      return reply.status(201).send({ category });
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const parsed = updateCategorySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      const category = await updateCategory(
        fastify,
        request.user.sub,
        request.params.id,
        parsed.data,
      );
      return { category };
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      await deleteCategory(fastify, request.user.sub, request.params.id);
      return reply.status(204).send();
    },
  );
};