import { z } from 'zod';

export const toolboxRowSchema = z.object({
  id: z.number().int().positive().optional(),
  label: z.string().trim().min(1).max(120),
  content: z.string().trim().max(10_000),
});

export const toolboxSaveSchema = z.array(toolboxRowSchema);

export type ToolboxRowInput = z.infer<typeof toolboxRowSchema>;
