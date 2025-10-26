import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { ENV } from '../../config/env';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const devLoginSchema = z.object({
  principal: z
    .string()
    .trim()
    .min(3)
    .max(128)
    .regex(/^[a-z0-9-_]+$/i, 'Principal may only contain alphanumeric, dash, underscore'),
  codename: z.string().trim().min(2).max(64).optional(),
});

export async function performDevLogin(input: z.infer<typeof devLoginSchema>) {
  const principal = input.principal.toLowerCase();

  const user = await prisma.user.upsert({
    where: { principal },
    update: {
      codename: input.codename ?? undefined,
    },
    create: {
      principal,
      codename: input.codename ?? `AGENT-${principal.slice(-4).toUpperCase()}`,
    },
    select: {
      id: true,
      principal: true,
      codename: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = jwt.sign(
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

  return {
    token,
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
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: number;
      principal: string;
      codename?: string | null;
      avatarUrl?: string | null;
    };

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
