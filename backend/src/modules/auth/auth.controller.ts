import { Request, Response } from 'express';
import { devLoginSchema, performDevLogin } from './auth.service';

export async function devLogin(req: Request, res: Response) {
  const parsed = devLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const result = await performDevLogin(parsed.data);
  res.json({ data: result });
}
