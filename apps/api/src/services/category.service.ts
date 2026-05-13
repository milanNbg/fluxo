import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@fluxo/shared';

function sanitizeCategory(cat: {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Category {
  return {
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: cat.isDefault,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  };
}

export async function listCategories(userId: string): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
  return categories.map(sanitizeCategory);
}

export async function createCategory(
  app: FastifyInstance,
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> {
  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId, name: input.name } },
  });

  if (existing) {
    throw app.httpErrors.conflict('Category with this name already exists');
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      userId,
    },
  });

  return sanitizeCategory(category);
}

export async function updateCategory(
  app: FastifyInstance,
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw app.httpErrors.notFound('Category not found');
  }

  if (input.name && input.name !== existing.name) {
    const duplicate = await prisma.category.findUnique({
      where: { userId_name: { userId, name: input.name } },
    });
    if (duplicate) {
      throw app.httpErrors.conflict('Category with this name already exists');
    }
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name,
      icon: input.icon,
      color: input.color,
    },
  });

  return sanitizeCategory(updated);
}

export async function deleteCategory(
  app: FastifyInstance,
  userId: string,
  categoryId: string,
): Promise<void> {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw app.httpErrors.notFound('Category not found');
  }

  const transactionCount = await prisma.transaction.count({
    where: { categoryId },
  });

  if (transactionCount > 0) {
    throw app.httpErrors.conflict(
      `Cannot delete category with ${transactionCount} transaction(s). Move or delete them first.`,
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
}