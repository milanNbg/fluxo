import type { FastifyPluginAsync } from 'fastify';
import {
  registerUserSchema,
  loginUserSchema,
} from '@fluxo/shared';
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getCurrentUser,
} from '../services/auth.service.js';
import { env } from '../config/env.js';

const REFRESH_TOKEN_COOKIE = 'fluxo_refresh_token';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
    const parsed = registerUserSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const result = await registerUser(fastify, parsed.data);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      signed: true,
    });

    return reply.status(201).send({
      user: result.user,
      tokens: { accessToken: result.accessToken },
    });
  });

  fastify.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes',
        },
      },
    },
    async (request, reply) => {
    const parsed = loginUserSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const result = await loginUser(fastify, parsed.data);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      signed: true,
    });

    return reply.send({
      user: result.user,
      tokens: { accessToken: result.accessToken },
    });
  });

  fastify.post('/refresh', async (request, reply) => {
    const cookie = request.cookies[REFRESH_TOKEN_COOKIE];
    if (!cookie) {
      return reply.unauthorized('Missing refresh token');
    }

    const unsigned = request.unsignCookie(cookie);
    if (!unsigned.valid || !unsigned.value) {
      return reply.unauthorized('Invalid refresh token');
    }

    const result = await refreshTokens(fastify, unsigned.value);

    reply.setCookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      signed: true,
    });

    return reply.send({
      user: result.user,
      tokens: { accessToken: result.accessToken },
    });
  });

  fastify.post('/logout', async (request, reply) => {
    const cookie = request.cookies[REFRESH_TOKEN_COOKIE];
    if (cookie) {
      const unsigned = request.unsignCookie(cookie);
      if (unsigned.valid && unsigned.value) {
        await logoutUser(unsigned.value);
      }
    }

    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
    return reply.send({ success: true });
  });

  fastify.get(
    '/me',
    { onRequest: [fastify.authenticate] },
    async (request) => {
      const user = await getCurrentUser(request.user.sub);
      return { user };
    },
  );
};