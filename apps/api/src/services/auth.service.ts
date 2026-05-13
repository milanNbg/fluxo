import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { env } from '../config/env.js';
import crypto from 'node:crypto';
import { DEFAULT_CATEGORIES } from '../lib/defaultCategories.js';
import type {
  RegisterUserInput,
  LoginUserInput,
  User,
} from '@fluxo/shared';

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

function sanitizeUser(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function getRefreshTokenExpiry(): Date {
  const expiry = new Date();
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([dhms])$/);
  if (!match) {
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
  }
  const [, amount, unit] = match;
  const num = Number.parseInt(amount!, 10);
  switch (unit) {
    case 'd':
      expiry.setDate(expiry.getDate() + num);
      break;
    case 'h':
      expiry.setHours(expiry.getHours() + num);
      break;
    case 'm':
      expiry.setMinutes(expiry.getMinutes() + num);
      break;
    case 's':
      expiry.setSeconds(expiry.getSeconds() + num);
      break;
  }
  return expiry;
}

async function generateTokens(
  app: FastifyInstance,
  userId: string,
  email: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = app.jwt.sign({ sub: userId, email });
  const refreshToken = crypto.randomBytes(64).toString('hex');

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
}

export async function registerUser(
  app: FastifyInstance,
  input: RegisterUserInput,
): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw app.httpErrors.conflict('Email already in use');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name ?? null,
      categories: {
        create: DEFAULT_CATEGORIES.map((cat) => ({
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        })),
      },
    },
  });

  const { accessToken, refreshToken } = await generateTokens(
    app,
    user.id,
    user.email,
  );

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function loginUser(
  app: FastifyInstance,
  input: LoginUserInput,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw app.httpErrors.unauthorized('Invalid email or password');
  }

  const isValid = await verifyPassword(user.passwordHash, input.password);

  if (!isValid) {
    throw app.httpErrors.unauthorized('Invalid email or password');
  }

  const { accessToken, refreshToken } = await generateTokens(
    app,
    user.id,
    user.email,
  );

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(
  app: FastifyInstance,
  refreshToken: string,
): Promise<AuthResult> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw app.httpErrors.unauthorized('Invalid refresh token');
  }

  if (tokenRecord.revokedAt) {
    throw app.httpErrors.unauthorized('Refresh token has been revoked');
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw app.httpErrors.unauthorized('Refresh token has expired');
  }

  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  });

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    app,
    tokenRecord.user.id,
    tokenRecord.user.email,
  );

  return {
    user: sanitizeUser(tokenRecord.user),
    accessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getCurrentUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  return sanitizeUser(user);
}