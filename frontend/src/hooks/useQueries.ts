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

export function useGetCallerUserProfile(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useQuery<UserProfile>({
    queryKey: ['currentUserProfile'],
    queryFn: () => apiClient.get<UserProfile>('/profiles/me'),
    enabled,
    retry: enabled ? 1 : false,
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

export function useGetNFTBids(nftId: number | null) {
  return useQuery<Bid[]>({
    queryKey: ['nftBids', nftId],
    queryFn: () => apiClient.get<Bid[]>(`/nfts/${nftId}/bids`),
    enabled: nftId !== null,
  });
}

export function useGetNFTTransactions(nftId: number | null) {
  return useQuery<Transaction[]>({
    queryKey: ['nftTransactions', nftId],
    queryFn: () => apiClient.get<Transaction[]>(`/nfts/${nftId}/transactions`),
    enabled: nftId !== null,
  });
}

export function useGetTransactionFeed() {
  return useQuery<TransactionFeedItem[]>({
    queryKey: ['transactionFeed'],
    queryFn: () => apiClient.get<TransactionFeedItem[]>('/feed'),
    refetchInterval: 10_000,
  });
}

export function useGetToolbox() {
  return useQuery<ToolboxRow[]>({
    queryKey: ['toolbox'],
    queryFn: () => apiClient.get<ToolboxRow[]>('/toolbox'),
  });
}

export function useSaveToolbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (toolbox: ToolboxRow[]) => apiClient.put<ToolboxRow[]>('/toolbox', toolbox),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolbox'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useMintNFT() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
      imageData,
    }: {
      name: string;
      description?: string;
      imageData?: string | null;
    }) => apiClient.post<NFT>('/nfts', { name, description, imageData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNFTs'] });
      toast.success('NFT minted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nftId, priceLamports }: { nftId: number; priceLamports: bigint }) =>
      apiClient.post('/listings', { nftId, priceLamports: priceLamports.toString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['myNFTs'] });
      toast.success('Listing created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePurchaseNFT() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: number) =>
      apiClient.post(`/listings/${listingId}/purchase`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['myNFTs'] });
      toast.success('Purchase complete');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function usePlaceBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, amountLamports }: { listingId: number; amountLamports: bigint }) =>
      apiClient.post(`/listings/${listingId}/bids`, {
        amountLamports: amountLamports.toString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      toast.success('Bid placed');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAcceptBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, bidId }: { listingId: number; bidId: number }) =>
      apiClient.post(`/listings/${listingId}/bids/${bidId}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allListings'] });
      queryClient.invalidateQueries({ queryKey: ['myNFTs'] });
      toast.success('Bid accepted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
