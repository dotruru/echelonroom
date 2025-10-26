import jwt, { JwtPayload } from 'jsonwebtoken';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ENV } from '../../config/env';

const JWT_SECRET = ENV.JWT_SECRET;
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const authUserSelect = {
  id: true,
  principal: true,
  codename: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type AuthUser = Prisma.UserGetPayload<{ select: typeof authUserSelect }>;

function defaultCodename(principal: string) {
  return `AGENT-${principal.slice(-4).toUpperCase()}`;
}

function signAuthToken(user: AuthUser) {
  return jwt.sign(
    {
      sub: user.id,
      principal: user.principal,
      codename: user.codename,
    },
    JWT_SECRET,
    {
      expiresIn: TOKEN_TTL_SECONDS,
    }
  );
}

export async function ensureUserByPrincipal(principal: string, codename?: string | null) {
  return prisma.user.upsert({
    where: { principal },
    update: {
      codename: codename ?? undefined,
    },
    create: {
      principal,
      codename: codename ?? defaultCodename(principal),
    },
    select: authUserSelect,
  });
}

export function buildAuthResponse(user: AuthUser) {
  return {
    token: signAuthToken(user),
    user,
    expiresIn: TOKEN_TTL_SECONDS,
  };
}

export interface AuthenticatedUser {
  id: number;
  principal: string;
  codename: string | null;
  avatarUrl: string | null;
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      sub: number;
      principal: string;
      codename?: string | null;
      avatarUrl?: string | null;
    };

    if (!payload || typeof payload.sub !== 'number' || typeof payload.principal !== 'string') {
      return null;
    }

    return {
      id: payload.sub,
      principal: payload.principal,
      codename: payload.codename ?? null,
      avatarUrl: payload.avatarUrl ?? null,
    };
  } catch (error) {
    return null;
  }
}
