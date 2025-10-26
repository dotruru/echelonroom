import { TransactionEventType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { appendFeedEvent, recordTransaction } from '../transactions/transaction.service';

function serializeNft(nft: any, puzzleStatus: any) {
  return {
    id: nft.id,
    mintAddress: nft.mintAddress,
    name: nft.name,
    description: nft.description,
    imageUri: nft.imageUri,
    metadataUri: nft.metadataUri,
    collection: nft.collection,
    sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
    isCompressed: nft.isCompressed,
    createdAt: nft.createdAt,
    updatedAt: nft.updatedAt,
    owner: nft.owner,
    creator: nft.creator,
    listings: nft.listings.map((listing: any) => ({
      id: listing.id,
      priceLamports: listing.priceLamports.toString(),
      status: listing.status,
      createdAt: listing.createdAt,
    })),
    puzzleStatus,
  };
}

export async function getNftsForOwner(userId: number) {
  const nfts = await prisma.nft.findMany({
    where: { ownerId: userId },
    include: {
      owner: { select: { principal: true, codename: true } },
      creator: { select: { principal: true, codename: true } },
      listings: { where: { status: 'ACTIVE' } },
      puzzleRuns: {
        where: { userId },
        select: {
          solved: true,
          bestTimeMs: true,
          attempts: true,
          hintsUsed: true,
          lastRunAt: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return nfts.map((nft) => {
    const puzzleStatus = nft.puzzleRuns[0]
      ? {
          ...nft.puzzleRuns[0],
          lastRunAt: nft.puzzleRuns[0].lastRunAt ?? null,
        }
      : null;

    return serializeNft(nft, puzzleStatus);
  });
}

export async function mintNftForUser(params: {
  userId: number;
  name: string;
  description?: string;
  imageData?: string | null;
}) {
  const nft = await prisma.$transaction(async (tx) => {
    const created = await tx.nft.create({
      data: {
        name: params.name,
        description: params.description ?? null,
        imageUri: params.imageData ?? null,
        ownerId: params.userId,
        creatorId: params.userId,
      },
      include: {
        owner: { select: { principal: true, codename: true } },
        creator: { select: { principal: true, codename: true } },
        listings: true,
        puzzleRuns: true,
      },
    });

    await recordTransaction({
      eventType: TransactionEventType.MINT,
      nftId: created.id,
      toUserId: params.userId,
      message: `NFT minted: ${created.name}`,
    });

    await appendFeedEvent({
      eventCode: 'MINT',
      message: `${created.owner.codename ?? created.owner.principal} minted ${created.name}`,
    });

    return created;
  });

  return serializeNft(nft, null);
}

export async function getNftById(nftId: number, currentUserId: number) {
  const nft = await prisma.nft.findUnique({
    where: { id: nftId },
    include: {
      owner: { select: { principal: true, codename: true } },
      creator: { select: { principal: true, codename: true } },
      listings: true,
      puzzleRuns: {
        where: { userId: currentUserId },
        take: 1,
      },
    },
  });

  if (!nft) {
    return null;
  }

  const puzzleStatus = nft.puzzleRuns[0]
    ? {
        ...nft.puzzleRuns[0],
        lastRunAt: nft.puzzleRuns[0].lastRunAt ?? null,
      }
    : null;

  return serializeNft(nft, puzzleStatus);
}

export async function getNftBids(nftId: number) {
  const bids = await prisma.bid.findMany({
    where: { nftId },
    include: {
      bidder: { select: { principal: true, codename: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bids.map((bid) => ({
    id: bid.id,
    nftId: bid.nftId,
    amountLamports: bid.amountLamports.toString(),
    status: bid.status,
    bidder: bid.bidder.codename ?? bid.bidder.principal,
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt,
  }));
}

export async function getNftTransactions(nftId: number) {
  const transactions = await prisma.transaction.findMany({
    where: { nftId },
    orderBy: { createdAt: 'desc' },
    include: {
      fromUser: { select: { principal: true, codename: true } },
      toUser: { select: { principal: true, codename: true } },
    },
  });

  return transactions.map((tx) => ({
    id: tx.id,
    txSig: tx.txSig,
    eventType: tx.eventType,
    priceLamports: tx.priceLamports ? tx.priceLamports.toString() : null,
    from: tx.fromUser ? tx.fromUser.codename ?? tx.fromUser.principal : null,
    to: tx.toUser ? tx.toUser.codename ?? tx.toUser.principal : null,
    timestamp: tx.createdAt.toISOString(),
    message: tx.message,
  }));
}
