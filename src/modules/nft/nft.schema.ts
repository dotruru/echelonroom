import { z } from 'zod';

export const mintNftSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  imageData: z.string().url().or(z.string().regex(/^data:image\//)).optional(),
});
