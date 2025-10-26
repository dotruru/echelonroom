export type { ApiUserProfile as UserProfile, ApiNft as NFT, ApiListing as Listing, ApiListingBid as ListingBid, ApiPuzzleStatus as PuzzleStatus, ApiAgentSummary as AgentSummary } from './api';

export type Principal = string;

export interface Bid {
  id: number;
  nftId: number;
  bidder: string;
  amountLamports: string;
  status: 'ACTIVE' | 'CANCELLED' | 'ACCEPTED' | 'EXPIRED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: number;
  txSig: string;
  priceLamports?: string;
  from?: string | null;
  to?: string | null;
  timestamp?: string;
  eventType?: string;
  message?: string;
}

export interface TransactionFeedItem {
  id: number;
  eventCode: string;
  message: string;
  timestamp: string;
}

export interface ToolboxRow {
  id?: number;
  toolboxLabel: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
