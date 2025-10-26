import { BidStatus, ListingStatus, TransactionEventType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { appendFeedEvent, recordTransaction } from '../transactions/transaction.service';

export async function getActiveListings() {
  const listings = await prisma.listing.findMany({
    where: { status: ListingStatus.ACTIVE },
    include: {
      nft: {
        select: {
          id: true,
          mintAddress: true,
          name: true,
          description: true,
          imageUri: true,
          metadataUri: true,
          collection: true,
          sellerFeeBasisPoints: true,
          isCompressed: true,
          owner: {
            select: {
              principal: true,
              codename: true,
            },
          },
          creator: {
            select: {
              principal: true,
              codename: true,
            },
          },
        },
      },
      bids: {
        where: { status: BidStatus.ACTIVE },
        select: {
          id: true,
          amountLamports: true,
          bidder: {
            select: {
              id: true,
              principal: true,
              codename: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          amountLamports: 'desc',
        },
      },
      seller: {
        select: {
          principal: true,
          codename: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return listings.map((listing) => {
    const bids = listing.bids.map((bid) => ({
      id: bid.id,
      amountLamports: bid.amountLamports.toString(),
      bidder: {
        principal: bid.bidder.principal,
        codename: bid.bidder.codename,
      },
      createdAt: bid.createdAt,
    }));

    const bestBid = bids[0] ?? null;

    return {
      id: listing.id,
      priceLamports: listing.priceLamports.toString(),
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      expiresAt: listing.expiresAt ?? null,
      nft: listing.nft,
      seller: listing.seller,
      bestBid,
      bids,
    };
  });
}

export async function createListingForNft(params: {
  nftId: number;
  priceLamports: bigint;
  sellerId: number;
}) {
  return prisma.$transaction(async (tx) => {
    const nft = await tx.nft.findUnique({
      where: { id: params.nftId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            principal: true,
            codename: true,
          },
        },
      },
    });

    if (!nft) {
      throw new Error('NFT not found');
    }

    if (nft.ownerId !== params.sellerId) {
      throw new Error('Only the owner can list this NFT');
    }

    const existingListing = await tx.listing.findFirst({
      where: { nftId: params.nftId, status: ListingStatus.ACTIVE },
    });

    if (existingListing) {
      throw new Error('NFT already has an active listing');
    }

    const listing = await tx.listing.create({
      data: {
        nftId: params.nftId,
        sellerId: params.sellerId,
        priceLamports: params.priceLamports,
        status: ListingStatus.ACTIVE,
      },
    });

    await recordTransaction({
      eventType: TransactionEventType.LIST,
      nftId: nft.id,
      priceLamports: params.priceLamports,
      fromUserId: nft.ownerId,
      message: `Listing created for ${nft.name}`,
    });

    await appendFeedEvent({
      eventCode: 'LIST',
      message: `Asset ${nft.name} listed by ${nft.owner.codename ?? nft.owner.principal}`,
    });

    return {
      id: listing.id,
      nftId: listing.nftId,
      sellerId: listing.sellerId,
      priceLamports: listing.priceLamports.toString(),
      status: listing.status,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    };
  });
}

export async function placeBidOnListing(params: {
  listingId: number;
  bidderId: number;
  amountLamports: bigint;
}) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: params.listingId },
      include: {
        nft: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        seller: {
          select: {
            id: true,
            principal: true,
            codename: true,
          },
        },
      },
    });

    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new Error('Listing not available');
    }

    if (listing.nft.ownerId === params.bidderId) {
      throw new Error('Owner cannot bid on their own listing');
    }

    const bid = await tx.bid.create({
      data: {
        listingId: params.listingId,
        nftId: listing.nft.id,
        bidderId: params.bidderId,
        amountLamports: params.amountLamports,
        status: BidStatus.ACTIVE,
      },
      include: {
        bidder: {
          select: {
            principal: true,
            codename: true,
          },
        },
      },
    });

    await appendFeedEvent({
      eventCode: 'BID',
      message: `${bid.bidder.codename ?? bid.bidder.principal} bid ${(Number(params.amountLamports) / 1_000_000_000).toFixed(2)} SOL`,
    });

    return {
      id: bid.id,
      listingId: bid.listingId,
      nftId: bid.nftId,
      amountLamports: bid.amountLamports.toString(),
      status: bid.status,
      createdAt: bid.createdAt,
      bidder: bid.bidder,
    };
  });
}

export async function acceptBidOnListing(params: { listingId: number; sellerId: number; bidId: number }) {
  return prisma.$transaction(async (tx) => {
    const bid = await tx.bid.findUnique({
      where: { id: params.bidId },
      include: {
        listing: {
          include: {
            nft: true,
            seller: true,
          },
        },
      },
    });

    if (!bid || bid.listingId !== params.listingId || !bid.listing) {
      throw new Error('Bid not found for this listing');
    }

    const listingRecord = bid.listing;

    if (listingRecord.sellerId !== params.sellerId) {
      throw new Error('Only the seller can accept bids');
    }

    if (listingRecord.status !== ListingStatus.ACTIVE) {
      throw new Error('Listing is not active');
    }

    await tx.bid.update({
      where: { id: bid.id },
      data: { status: BidStatus.ACCEPTED, acceptedAt: new Date() },
    });

    await tx.listing.update({
      where: { id: bid.listingId },
      data: { status: ListingStatus.SOLD },
    });

    await tx.nft.update({
      where: { id: listingRecord.nftId },
      data: { ownerId: bid.bidderId },
    });

    await tx.bid.updateMany({
      where: {
        listingId: bid.listingId,
        status: BidStatus.ACTIVE,
        id: { not: bid.id },
      },
      data: { status: BidStatus.CANCELLED },
    });

    await recordTransaction({
      eventType: TransactionEventType.BID_ACCEPTED,
      nftId: listingRecord.nftId,
      priceLamports: bid.amountLamports,
      fromUserId: params.sellerId,
      toUserId: bid.bidderId,
      message: `Bid accepted for ${listingRecord.nft.name}`,
    });

    await appendFeedEvent({
      eventCode: 'BID_ACCEPTED',
      message: `${listingRecord.seller.codename ?? listingRecord.seller.principal} accepted bid on ${listingRecord.nft.name}`,
    });
  });
}

export async function purchaseListing(params: { listingId: number; buyerId: number }) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: params.listingId },
      include: {
        nft: true,
        seller: true,
      },
    });

    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new Error('Listing not available');
    }

    if (listing.sellerId === params.buyerId) {
      throw new Error('Seller cannot purchase their own listing');
    }

    await tx.listing.update({
      where: { id: params.listingId },
      data: { status: ListingStatus.SOLD },
    });

    await tx.nft.update({
      where: { id: listing.nftId },
      data: { ownerId: params.buyerId },
    });

    await tx.bid.updateMany({
      where: { listingId: params.listingId, status: BidStatus.ACTIVE },
      data: { status: BidStatus.CANCELLED },
    });

    const transaction = await recordTransaction({
      eventType: TransactionEventType.SALE,
      nftId: listing.nftId,
      priceLamports: listing.priceLamports,
      fromUserId: listing.sellerId,
      toUserId: params.buyerId,
      message: `Sale executed for ${listing.nft.name}`,
    });

    await appendFeedEvent({
      eventCode: 'SALE',
      message: `${listing.seller.codename ?? listing.seller.principal} sold ${listing.nft.name}`,
      txSig: transaction.txSig,
    });
  });
}
