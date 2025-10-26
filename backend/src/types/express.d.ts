import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: number;
        principal: string;
        codename: string | null;
        avatarUrl: string | null;
      };
    }
  }
}

export {};
