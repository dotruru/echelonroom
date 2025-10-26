import { z } from 'zod';

export const profileUpdateSchema = z.object({
  codename: z.string().min(2).max(64).optional(),
  avatarUrl: z.string().url().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
