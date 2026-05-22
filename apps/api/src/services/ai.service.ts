import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { getTransactionStats } from './transaction.service.js';
import { listBudgetsForMonth } from './budget.service.js';
import { prisma } from '../lib/prisma.js';
import type { ChatMessage } from '@fluxo/shared';

const client = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 800;

interface UserContext {
  name: string | null;
  email: string;
  stats: Awaited<ReturnType<typeof getTransactionStats>>;
  budgets: Awaited<ReturnType<typeof listBudgetsForMonth>>;
}

async function buildUserContext(userId: string): Promise<UserContext> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [user, stats, budgets] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { name: true, email: true },
    }),
    getTransactionStats(userId),
    listBudgetsForMonth(userId, month, year),
  ]);

  return {
    name: user.name,
    email: user.email,
    stats,
    budgets,
  };
}

function formatCurrency(value: string): string {
  return `€${Number.parseFloat(value).toFixed(2)}`;
}

function buildSystemPrompt(context: UserContext): string {
  const { name, stats, budgets } = context;

  const breakdown = stats.expenseBreakdown
    .slice(0, 5)
    .map(
      (b) =>
        `  - ${b.categoryName}: ${formatCurrency(b.total)} (${b.percentage.toFixed(1)}%, ${b.transactionCount} transactions)`,
    )
    .join('\n');

  const budgetLines = budgets
    .map((b) => {
      const statusLabel =
        b.status === 'over'
          ? 'OVER BUDGET'
          : b.status === 'warning'
            ? 'close to limit'
            : 'on track';
      return `  - ${b.categoryName}: spent ${formatCurrency(b.spent)} of ${formatCurrency(b.amount)} limit (${b.percentage}%, ${statusLabel})`;
    })
    .join('\n');

  const monthName = new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return `You are "Fluxo AI Assistant" — a friendly, helpful personal finance assistant.

USER:
- Name: ${name ?? 'User'}
- Has ${stats.transactionCount} total transactions

FINANCIAL SNAPSHOT:
- Total balance: ${formatCurrency(stats.totalBalance)}
- Total income (all time): ${formatCurrency(stats.totalIncome)}
- Total expenses (all time): ${formatCurrency(stats.totalExpense)}
- This month income: ${formatCurrency(stats.monthlyIncome)}
- This month expenses: ${formatCurrency(stats.monthlyExpense)}
- This month balance: ${formatCurrency(stats.monthlyBalance)}

TOP EXPENSE CATEGORIES (all time):
${breakdown.length > 0 ? breakdown : '  (no expenses recorded yet)'}

BUDGETS FOR ${monthName.toUpperCase()}:
${budgetLines.length > 0 ? budgetLines : '  (no budgets set for this month)'}

RULES:
- Respond in the same language as the user's question (English or Serbian).
- Be concise — aim for 2–4 sentences unless asked for more detail.
- Use the actual numbers from the snapshot above. Never make up figures.
- When asked about budgets, use the BUDGETS section above. Mention which categories are over budget or close to the limit.
- If the user has no budgets set, gently suggest creating one on the Budgets page.
- If asked about data you don't have (e.g. specific transactions), say so politely and suggest visiting the Transactions page.
- For advice, be specific and actionable (e.g., "Set a €200 monthly budget for Food" not "spend less").
- Use markdown formatting sparingly — bullet points for lists, bold for emphasis.
- Never give legal, tax, or investment advice. Stick to budgeting and spending patterns.
- Be encouraging but honest. If the user has a negative balance or is over budget, acknowledge it kindly and suggest steps forward.`;
}

export async function* streamChatResponse(
  userId: string,
  messages: ChatMessage[],
): AsyncGenerator<string, void, unknown> {
  const context = await buildUserContext(userId);
  const systemPrompt = buildSystemPrompt(context);

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}

export function getSuggestedQuestions(): string[] {
  return [
    'Where am I spending the most this month?',
    'Am I over budget on anything?',
    'How can I reduce my expenses?',
    'How am I doing on my budgets?',
    'Give me a quick financial health check',
  ];
}
