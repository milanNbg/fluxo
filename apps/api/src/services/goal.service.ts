import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import type {
  CreateGoalInput,
  UpdateGoalInput,
  CreateContributionInput,
  GoalWithStats,
} from '@fluxo/shared';

interface FastifyForError {
  httpErrors: {
    notFound: (msg: string) => Error;
    badRequest: (msg: string) => Error;
  };
}

type GoalWithContributions = Prisma.GoalGetPayload<{
  include: { contributions: true };
}>;

function calculateMonthlyTarget(remaining: Prisma.Decimal, targetDate: Date | null): string | null {
  if (!targetDate || remaining.lessThanOrEqualTo(0)) return null;

  const now = new Date();
  const monthsLeft =
    (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());

  if (monthsLeft <= 0) return null;

  return remaining.dividedBy(monthsLeft).toFixed(2);
}

function toGoalWithStats(goal: GoalWithContributions): GoalWithStats {
  const target = goal.targetAmount;
  const current = goal.currentAmount;
  const remaining = target.minus(current);
  const percentage = target.greaterThan(0)
    ? Number(current.dividedBy(target).times(100).toFixed(1))
    : 0;

  return {
    id: goal.id,
    name: goal.name,
    targetAmount: target.toFixed(2),
    currentAmount: current.toFixed(2),
    targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0]! : null,
    icon: goal.icon,
    color: goal.color,
    status: goal.status,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    percentage: Math.min(percentage, 100),
    remaining: remaining.greaterThan(0) ? remaining.toFixed(2) : '0.00',
    monthlyTarget: calculateMonthlyTarget(remaining, goal.targetDate),
    contributions: goal.contributions.map((c) => ({
      id: c.id,
      amount: c.amount.toFixed(2),
      date: c.date.toISOString().split('T')[0]!,
      note: c.note,
      createdAt: c.createdAt.toISOString(),
    })),
  };
}

export async function listGoals(userId: string): Promise<GoalWithStats[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    include: {
      contributions: { orderBy: { date: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return goals.map(toGoalWithStats);
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  const goal = await prisma.goal.create({
    data: {
      userId,
      name: input.name,
      targetAmount: input.targetAmount,
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
      icon: input.icon,
      color: input.color,
    },
    include: { contributions: true },
  });

  return toGoalWithStats(goal);
}

export async function updateGoal(
  fastify: FastifyForError,
  userId: string,
  id: string,
  input: UpdateGoalInput,
) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw fastify.httpErrors.notFound('Goal not found');

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      name: input.name,
      targetAmount: input.targetAmount,
      targetDate:
        input.targetDate === null
          ? null
          : input.targetDate
            ? new Date(input.targetDate)
            : undefined,
      icon: input.icon,
      color: input.color,
      status: input.status,
    },
    include: { contributions: { orderBy: { date: 'desc' } } },
  });

  return toGoalWithStats(updated);
}

export async function deleteGoal(
  fastify: FastifyForError,
  userId: string,
  id: string,
): Promise<void> {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) throw fastify.httpErrors.notFound('Goal not found');

  await prisma.goal.delete({ where: { id } });
}

export async function addContribution(
  fastify: FastifyForError,
  userId: string,
  goalId: string,
  input: CreateContributionInput,
): Promise<GoalWithStats> {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw fastify.httpErrors.notFound('Goal not found');

  const updated = await prisma.$transaction(async (tx) => {
    await tx.goalContribution.create({
      data: {
        goalId,
        amount: input.amount,
        date: new Date(input.date),
        note: input.note,
      },
    });

    const newCurrent = goal.currentAmount.plus(input.amount);
    const isCompleted = newCurrent.greaterThanOrEqualTo(goal.targetAmount);

    return tx.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: newCurrent,
        status: isCompleted ? 'completed' : 'active',
      },
      include: { contributions: { orderBy: { date: 'desc' } } },
    });
  });

  return toGoalWithStats(updated);
}

export async function deleteContribution(
  fastify: FastifyForError,
  userId: string,
  goalId: string,
  contributionId: string,
): Promise<GoalWithStats> {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw fastify.httpErrors.notFound('Goal not found');

  const contribution = await prisma.goalContribution.findFirst({
    where: { id: contributionId, goalId },
  });
  if (!contribution) {
    throw fastify.httpErrors.notFound('Contribution not found');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.goalContribution.delete({ where: { id: contributionId } });

    const newCurrent = goal.currentAmount.minus(contribution.amount);
    const safeCurrent = newCurrent.greaterThan(0) ? newCurrent : new Prisma.Decimal(0);
    const isCompleted = safeCurrent.greaterThanOrEqualTo(goal.targetAmount);

    return tx.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: safeCurrent,
        status: isCompleted ? 'completed' : 'active',
      },
      include: { contributions: { orderBy: { date: 'desc' } } },
    });
  });

  return toGoalWithStats(updated);
}
