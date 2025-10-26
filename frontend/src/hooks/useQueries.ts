import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  UserProfile,
  NFT,
  Listing,
  ToolboxRow,
  Bid,
  Transaction,
  TransactionFeedItem,
} from '@/types/domain';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  return useQuery<UserProfile>({
    queryKey: ['currentUserProfile'],
    queryFn: () => apiClient.get<UserProfile>('/profiles/me'),
    retry: 1,
  });
}

export function useSaveCallerUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Partial<UserProfile>) => apiClient.put<UserProfile>('/profiles/me', profile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetMyNFTs() {
  return useQuery<NFT[]>({
    queryKey: ['myNFTs'],
    queryFn: () => apiClient.get<NFT[]>('/nfts/mine'),
  });
}

export function useGetAllListings() {
  return useQuery<Listing[]>({
    queryKey: ['allListings'],
    queryFn: () => apiClient.get<Listing[]>('/listings'),
  });
}

export function useGetNFTBids(_nftId: number) {
  return useQuery<Bid[]>({
    queryKey: ['nftBids', _nftId],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useGetNFTTransactions(_nftId: number) {
  return useQuery<Transaction[]>({
    queryKey: ['nftTransactions', _nftId],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useGetTransactionFeed() {
  return useQuery<TransactionFeedItem[]>({
    queryKey: ['transactionFeed'],
    queryFn: async () => [],
    staleTime: 10_000,
  });
}

export function useGetToolbox() {
  return useQuery<ToolboxRow[]>({
    queryKey: ['toolbox'],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useSaveToolbox() {
  return useMutation({
    mutationFn: async (_toolbox: ToolboxRow[]) => {
      throw new Error('Toolbox persistence not yet implemented');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMintNFT() {
  return useMutation({
    mutationFn: async (_payload: { name: string; description: string; image: unknown }) => {
      throw new Error('Minting is not yet available on the backend service');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateListing() {
  return useMutation({
    mutationFn: async (_payload: { nftId: number; price: number | string | bigint }) => {
      throw new Error('Listing creation is not yet available on the backend service');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePurchaseNFT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_listingId: number) => {
      throw new Error('Purchasing is not yet available on the backend service');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['myNFTs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePlaceBid() {
  return useMutation({
    mutationFn: async (_payload: { nftId: number; amount: number | string | bigint }) => {
      throw new Error('Bidding is not yet available on the backend service');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAcceptBid() {
  return useMutation({
    mutationFn: async (_nftId: number) => {
      throw new Error('Accepting bids is not yet available on the backend service');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
