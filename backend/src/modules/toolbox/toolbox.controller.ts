import { Request, Response } from 'express';
import { getToolboxRows, saveToolboxRows } from './toolbox.service';
import { toolboxSaveSchema } from './toolbox.schema';

export async function getMyToolbox(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const rows = await getToolboxRows(req.authUser.id);
  res.json({ data: rows });
}

export async function saveMyToolbox(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const parsed = toolboxSaveSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const rows = await saveToolboxRows(req.authUser.id, parsed.data);
  res.json({ data: rows });
}
