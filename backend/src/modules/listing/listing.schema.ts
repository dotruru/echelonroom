import { z } from 'zod';

const lamportsSchema = z
  .union([z.string(), z.number(), z.bigint()])
  .transform((value) => {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    return BigInt(value);
  });

export const createListingSchema = z.object({
  nftId: z.number().int().positive(),
  priceLamports: lamportsSchema,
});

export const placeBidSchema = z.object({
  listingId: z.number().int().positive(),
  amountLamports: lamportsSchema,
});

export const acceptBidSchema = z.object({
  listingId: z.number().int().positive(),
  bidId: z.number().int().positive(),
});
