import { Request, Response } from 'express';
import { getOrCreateProfile, updateProfile } from './profile.service';
import { profileUpdateSchema } from './profile.schema';

export async function getMyProfile(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const principal = req.authUser.principal;
  const profile = await getOrCreateProfile(principal);
  res.json({ data: profile });
}

export async function saveMyProfile(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const principal = req.authUser.principal;
  const parsed = profileUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const profile = await updateProfile(principal, parsed.data);
  res.json({ data: profile });
}
