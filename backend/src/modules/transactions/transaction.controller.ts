import { Request, Response } from 'express';
import { getFeedEvents } from './transaction.service';

export async function getTransactionFeed(_req: Request, res: Response) {
  const events = await getFeedEvents();
  res.json({ data: events });
}
