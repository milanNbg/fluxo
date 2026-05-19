import type { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  TransactionListResponse,
} from '@fluxo/shared';

type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;

function sanitizeTransaction(tx: TransactionWithCategory): Transaction {
  return {
    id: tx.id,
    amount: tx.amount.toString(),
    type: tx.type,
    description: tx.description,
    date: tx.date.toISOString().split('T')[0]!,
    categoryId: tx.categoryId,
    category: tx.category
      ? {
          id: tx.category.id,
          name: tx.category.name,
          icon: tx.category.icon,
          color: tx.category.color,
          isDefault: tx.category.isDefault,
          createdAt: tx.category.createdAt.toISOString(),
          updatedAt: tx.category.updatedAt.toISOString(),
        }
      : undefined,
    createdAt: tx.createdAt.toISOString(),
    updatedAt: tx.updatedAt.toISOString(),
  };
}

export async function listTransactions(
  userId: string,
  filters: TransactionFilters,
): Promise<TransactionListResponse> {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }
  if (filters.search) {
    where.description = {
      contains: filters.search,
      mode: 'insensitive',
    };
  }

  const skip = (filters.page - 1) * filters.pageSize;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: filters.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map(sanitizeTransaction),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getTransaction(
  app: FastifyInstance,
  userId: string,
  transactionId: string,
): Promise<Transaction> {
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: { category: true },
  });

  if (!tx) {
    throw app.httpErrors.notFound('Transaction not found');
  }

  return sanitizeTransaction(tx);
}

export async function createTransaction(
  app: FastifyInstance,
  userId: string,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId },
  });

  if (!category) {
    throw app.httpErrors.badRequest('Category not found or does not belong to you');
  }

  const tx = await prisma.transaction.create({
    data: {
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      description: input.description ?? null,
      date: new Date(input.date),
      userId,
      categoryId: input.categoryId,
    },
    include: { category: true },
  });

  return sanitizeTransaction(tx);
}

export async function updateTransaction(
  app: FastifyInstance,
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput,
): Promise<Transaction> {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!existing) {
    throw app.httpErrors.notFound('Transaction not found');
  }

  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, userId },
    });
    if (!category) {
      throw app.httpErrors.badRequest('Category not found or does not belong to you');
    }
  }

  const tx = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      amount: input.amount !== undefined ? new Prisma.Decimal(input.amount) : undefined,
      type: input.type,
      description: input.description,
      date: input.date ? new Date(input.date) : undefined,
      categoryId: input.categoryId,
    },
    include: { category: true },
  });

  return sanitizeTransaction(tx);
}

export async function deleteTransaction(
  app: FastifyInstance,
  userId: string,
  transactionId: string,
): Promise<void> {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!existing) {
    throw app.httpErrors.notFound('Transaction not found');
  }

  await prisma.transaction.delete({ where: { id: transactionId } });
}

export async function getTransactionStats(
  userId: string,
): Promise<{
  totalBalance: string;
  totalIncome: string;
  totalExpense: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlyBalance: string;
  transactionCount: number;
  expenseBreakdown: Array<{
    categoryId: string;
    categoryName: string;
    categoryIcon: string | null;
    categoryColor: string | null;
    total: string;
    percentage: number;
    transactionCount: number;
  }>;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const allTransactions = await prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
  });

  let totalIncome = new Prisma.Decimal(0);
  let totalExpense = new Prisma.Decimal(0);
  let monthlyIncome = new Prisma.Decimal(0);
  let monthlyExpense = new Prisma.Decimal(0);

  const categoryTotals = new Map<
    string,
    {
      total: Prisma.Decimal;
      categoryName: string;
      categoryIcon: string | null;
      categoryColor: string | null;
      transactionCount: number;
    }
  >();

  for (const tx of allTransactions) {
    const isMonthly = tx.date >= startOfMonth && tx.date < startOfNextMonth;

    if (tx.type === 'income') {
      totalIncome = totalIncome.plus(tx.amount);
      if (isMonthly) {
        monthlyIncome = monthlyIncome.plus(tx.amount);
      }
    } else {
      totalExpense = totalExpense.plus(tx.amount);
      if (isMonthly) {
        monthlyExpense = monthlyExpense.plus(tx.amount);
      }

      const existing = categoryTotals.get(tx.categoryId);
      if (existing) {
        existing.total = existing.total.plus(tx.amount);
        existing.transactionCount += 1;
      } else {
        categoryTotals.set(tx.categoryId, {
          total: new Prisma.Decimal(tx.amount),
          categoryName: tx.category.name,
          categoryIcon: tx.category.icon,
          categoryColor: tx.category.color,
          transactionCount: 1,
        });
      }
    }
  }

  const totalBalance = totalIncome.minus(totalExpense);
  const monthlyBalance = monthlyIncome.minus(monthlyExpense);

  const expenseBreakdown = Array.from(categoryTotals.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.categoryName,
      categoryIcon: data.categoryIcon,
      categoryColor: data.categoryColor,
      total: data.total.toString(),
      percentage: totalExpense.greaterThan(0)
        ? data.total.dividedBy(totalExpense).times(100).toNumber()
        : 0,
      transactionCount: data.transactionCount,
    }))
    .sort((a, b) => Number.parseFloat(b.total) - Number.parseFloat(a.total));

  return {
    totalBalance: totalBalance.toString(),
    totalIncome: totalIncome.toString(),
    totalExpense: totalExpense.toString(),
    monthlyIncome: monthlyIncome.toString(),
    monthlyExpense: monthlyExpense.toString(),
    monthlyBalance: monthlyBalance.toString(),
    transactionCount: allTransactions.length,
    expenseBreakdown,
  };
}