import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type { CreateBudgetInput, UpdateBudgetInput, BudgetWithStats } from '@fluxo/shared';

interface FastifyForError {
  httpErrors: {
    notFound: (msg: string) => Error;
    conflict: (msg: string) => Error;
    badRequest: (msg: string) => Error;
  };
}

function calculateStatus(percentage: number): 'ok' | 'warning' | 'over' {
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'warning';
  return 'ok';
}

export async function listBudgetsForMonth(
  userId: string,
  month: number,
  year: number,
): Promise<BudgetWithStats[]> {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  const budgets = await prisma.budget.findMany({
    where: { userId, month, year },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categoryIds = budgets.map((b) => b.categoryId);

  const spentByCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'expense',
      categoryId: { in: categoryIds },
      date: { gte: startDate, lt: endDate },
    },
    _sum: { amount: true },
  });

  const spentMap = new Map(
    spentByCategory.map((s) => [s.categoryId, s._sum.amount ?? new Prisma.Decimal(0)]),
  );

  return budgets.map((b) => {
    const spent = spentMap.get(b.categoryId) ?? new Prisma.Decimal(0);
    const amount = b.amount;
    const remaining = amount.minus(spent);
    const percentage = amount.greaterThan(0)
      ? Number(spent.dividedBy(amount).times(100).toFixed(1))
      : 0;

    return {
      id: b.id,
      amount: amount.toFixed(2),
      month: b.month,
      year: b.year,
      categoryId: b.categoryId,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      categoryName: b.category.name,
      categoryIcon: b.category.icon,
      categoryColor: b.category.color,
      spent: spent.toFixed(2),
      remaining: remaining.toFixed(2),
      percentage,
      status: calculateStatus(percentage),
    };
  });
}

export async function createBudget(
  fastify: FastifyForError,
  userId: string,
  input: CreateBudgetInput,
) {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId },
  });

  if (!category) {
    throw fastify.httpErrors.notFound('Category not found');
  }

  const existing = await prisma.budget.findUnique({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: input.categoryId,
        month: input.month,
        year: input.year,
      },
    },
  });

  if (existing) {
    throw fastify.httpErrors.conflict('Budget for this category and month already exists');
  }

  const budget = await prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId,
      amount: input.amount,
      month: input.month,
      year: input.year,
    },
  });

  return {
    id: budget.id,
    amount: budget.amount.toFixed(2),
    month: budget.month,
    year: budget.year,
    categoryId: budget.categoryId,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
  };
}

export async function updateBudget(
  fastify: FastifyForError,
  userId: string,
  id: string,
  input: UpdateBudgetInput,
) {
  const budget = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    throw fastify.httpErrors.notFound('Budget not found');
  }

  const updated = await prisma.budget.update({
    where: { id },
    data: { amount: input.amount },
  });

  return {
    id: updated.id,
    amount: updated.amount.toFixed(2),
    month: updated.month,
    year: updated.year,
    categoryId: updated.categoryId,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteBudget(
  fastify: FastifyForError,
  userId: string,
  id: string,
): Promise<void> {
  const budget = await prisma.budget.findFirst({
    where: { id, userId },
  });

  if (!budget) {
    throw fastify.httpErrors.notFound('Budget not found');
  }

  await prisma.budget.delete({ where: { id } });
}
