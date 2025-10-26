import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getActiveListings,
  createListingForNft,
  purchaseListing,
  placeBidOnListing,
  acceptBidOnListing,
} from './listing.service';
import {
  createListingSchema,
  placeBidSchema,
  acceptBidSchema,
} from './listing.schema';

export async function listActiveListings(_req: Request, res: Response) {
  const listings = await getActiveListings();
  res.json({ data: listings });
}

export async function createListing(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const listing = await createListingForNft({
    nftId: parsed.data.nftId,
    priceLamports: parsed.data.priceLamports,
    sellerId: req.authUser.id,
  });

  res.status(201).json({ data: listing });
}

export async function purchaseListingController(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const listingId = Number(req.params.listingId);
  if (!Number.isInteger(listingId) || listingId <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid listing id' });
  }

  await purchaseListing({ listingId, buyerId: req.authUser.id });
  res.status(204).send();
}

export async function placeBidController(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const parsed = placeBidSchema.safeParse({
    listingId: Number(req.params.listingId),
    amountLamports: req.body?.amountLamports,
  });

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  const bid = await placeBidOnListing({
    listingId: parsed.data.listingId,
    amountLamports: parsed.data.amountLamports,
    bidderId: req.authUser.id,
  });

  res.status(201).json({ data: bid });
}

export async function acceptBidController(req: Request, res: Response) {
  if (!req.authUser) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const parsed = acceptBidSchema.safeParse({
    listingId: Number(req.params.listingId),
    bidId: Number(req.params.bidId ?? req.body?.bidId),
  });

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid payload',
      issues: parsed.error.flatten(),
    });
  }

  await acceptBidOnListing({
    listingId: parsed.data.listingId,
    bidId: parsed.data.bidId,
    sellerId: req.authUser.id,
  });

  res.status(204).send();
}
