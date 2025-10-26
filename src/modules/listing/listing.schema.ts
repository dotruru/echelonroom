import { z } from 'zod';

export const createListingSchema = z.object({
  nftId: z.number().int().positive(),
  priceLamports: z.union([z.string(), z.number(), z.bigint()]).transform((value) => {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    return BigInt(value);
  }),
});

export const purchaseListingSchema = z.object({
  listingId: z.number().int().positive(),
});

export const placeBidSchema = z.object({
  listingId: z.number().int().positive(),
  amountLamports: z.union([z.string(), z.number(), z.bigint()]).transform((value) => {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    return BigInt(value);
  }),
});

export const acceptBidSchema = z.object({
  listingId: z.number().int().positive(),
  bidId: z.number().int().positive(),
});
