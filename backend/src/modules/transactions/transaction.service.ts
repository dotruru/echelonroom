import { TransactionEventType } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export async function recordTransaction(params: {
  eventType: TransactionEventType;
  nftId?: number;
  priceLamports?: bigint | null;
  fromUserId?: number | null;
  toUserId?: number | null;
  message?: string | null;
  txSig?: string | null;
}) {
  const txSig = params.txSig ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const transaction = await prisma.transaction.create({
    data: {
      txSig,
      eventType: params.eventType,
      nftId: params.nftId ?? null,
      priceLamports: params.priceLamports ?? null,
      fromUserId: params.fromUserId ?? null,
      toUserId: params.toUserId ?? null,
      blockTime: new Date(),
      message: params.message ?? null,
    },
  });

  return transaction;
}

export async function appendFeedEvent(event: {
  eventCode: string;
  message: string;
  txSig?: string | null;
}) {
  await prisma.transactionFeedEvent.create({
    data: {
      eventCode: event.eventCode,
      message: event.message,
      txSig: event.txSig ?? null,
    },
  });

  const count = await prisma.transactionFeedEvent.count();
  if (count > 200) {
    const excess = await prisma.transactionFeedEvent.findMany({
      orderBy: { createdAt: 'asc' },
      take: count - 200,
      select: { id: true },
    });

    if (excess.length > 0) {
      await prisma.transactionFeedEvent.deleteMany({
        where: {
          id: { in: excess.map((item) => item.id) },
        },
      });
    }
  }
}

export async function getFeedEvents(limit = 100) {
  const events = await prisma.transactionFeedEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return events;
}
