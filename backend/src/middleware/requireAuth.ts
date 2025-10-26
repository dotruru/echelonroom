import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/auth.service';
import { prisma } from '../lib/prisma';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Missing authorization bearer token',
    });
  }

  const token = header.slice('Bearer '.length).trim();

  const verified = verifyToken(token);

  if (!verified) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.id },
    select: {
      id: true,
      principal: true,
      codename: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'User not found',
    });
  }

  req.authUser = user;
  next();
}
