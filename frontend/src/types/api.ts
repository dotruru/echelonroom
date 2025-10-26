export interface ApiUserProfile {
  id: number;
  principal: string;
  codename: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPuzzleStatus {
  solved: boolean;
  bestTimeMs: number | null;
  attempts: number;
  hintsUsed: number;
  lastRunAt: string | null;
}

export interface ApiListingSummary {
  id: number;
  priceLamports: string;
  status: string;
  createdAt: string;
}

export interface ApiAgentSummary {
  principal: string;
  codename: string | null;
}

export interface ApiNft {
  id: number;
  mintAddress: string | null;
  name: string;
  description: string | null;
  imageUri: string | null;
  metadataUri: string | null;
  collection: string | null;
  sellerFeeBasisPoints: number;
  isCompressed: boolean;
  createdAt: string;
  updatedAt: string;
  owner: ApiAgentSummary;
  creator: ApiAgentSummary;
  listings: ApiListingSummary[];
  puzzleStatus: ApiPuzzleStatus | null;
}

export interface ApiListingBid {
  id: number;
  amountLamports: string;
  createdAt: string;
  bidder: ApiAgentSummary;
}

export interface ApiListing {
  id: number;
  priceLamports: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  nft: {
    id: number;
    mintAddress: string | null;
    name: string;
    description: string | null;
    imageUri: string | null;
    metadataUri: string | null;
    collection: string | null;
    sellerFeeBasisPoints: number;
    isCompressed: boolean;
    owner: ApiAgentSummary;
    creator: ApiAgentSummary;
  };
  seller: ApiAgentSummary;
  bids: ApiListingBid[];
  bestBid: ApiListingBid | null;
}
