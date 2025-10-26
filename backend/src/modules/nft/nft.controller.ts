import { Request, Response } from 'express';
import {
  getNftsForOwner,
  mintNftForUser,
  getNftById,
  getNftBids,
  getNftTransactions,
} from './nft.service';
import { mintNftSchema } from './nft.schema';

export async function getMyNfts(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const nfts = await getNftsForOwner(req.authUser.id);
  res.json({ data: nfts });
}

export async function mintNft(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const parsed = mintNftSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const nft = await mintNftForUser({
    userId: req.authUser.id,
    name: parsed.data.name,
    description: parsed.data.description,
    imageData: parsed.data.imageData,
  });

  res.status(201).json({ data: nft });
}

export async function getNftDetails(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const nftId = Number(req.params.nftId);
  if (!Number.isInteger(nftId) || nftId <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid NFT id' });
  }

  const nft = await getNftById(nftId, req.authUser.id);
  if (!nft) {
    return res.status(404).json({ status: 'error', message: 'NFT not found' });
  }

  res.json({ data: nft });
}

export async function getNftBidsController(req: Request, res: Response) {
  const nftId = Number(req.params.nftId);
  if (!Number.isInteger(nftId) || nftId <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid NFT id' });
  }

  const bids = await getNftBids(nftId);
  res.json({ data: bids });
}

export async function getNftTransactionsController(req: Request, res: Response) {
  const nftId = Number(req.params.nftId);
  if (!Number.isInteger(nftId) || nftId <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid NFT id' });
  }

  const transactions = await getNftTransactions(nftId);
  res.json({ data: transactions });
}
