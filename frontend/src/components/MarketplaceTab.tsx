import { useGetAllListings, usePurchaseNFT } from '../hooks/useQueries';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Tag, Database } from 'lucide-react';
import type { Listing } from '@/types/domain';

function formatLamportsToSol(lamports: string) {
  const numeric = Number(lamports);
  if (Number.isNaN(numeric)) {
    return '0';
  }
  return (numeric / 1_000_000_000).toFixed(2);
}

function ListingCard({ listing }: { listing: Listing }) {
  const { mutate: purchaseNFT, isPending } = usePurchaseNFT();

  const imageUrl = listing.nft.imageUri || '/assets/generated/cyber-nft-placeholder.dim_400x400.png';
  const priceSol = formatLamportsToSol(listing.priceLamports);

  return (
    <Card className="cyber-border overflow-hidden bg-black/50 transition-all hover:shadow-cyber">
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden bg-muted/20">
          <img src={imageUrl} alt={listing.nft.name} className="h-full w-full object-cover" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="mb-2 line-clamp-1 text-base uppercase tracking-wide text-primary">
          {listing.nft.name}
        </CardTitle>
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {listing.nft.description || 'No description provided.'}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="gap-1 bg-primary/20 text-primary border-primary/30 uppercase text-xs">
            <Tag className="h-3 w-3" />
            {priceSol} SOL
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={() => purchaseNFT(listing.id)} 
          disabled={isPending} 
          className="w-full gap-2 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider text-xs"
        >
          <ShoppingCart className="h-4 w-4" />
          {isPending ? 'PROCESSING...' : 'ACQUIRE'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MarketplaceTab() {
  const { data: listings, isLoading: listingsLoading } = useGetAllListings();

  if (listingsLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="cyber-border bg-black/50">
            <CardHeader>
              <Skeleton className="h-48 w-full rounded-sm" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-sm border border-dashed border-primary/30 p-8 text-center bg-black/30">
        <Database className="mb-4 h-12 w-12 text-primary cyber-pulse" />
        <h3 className="mb-2 text-xl font-semibold uppercase tracking-wide text-primary">NO ASSETS AVAILABLE</h3>
        <p className="text-muted-foreground uppercase text-sm tracking-wider">
          MARKETPLACE DATABASE EMPTY // AWAITING NEW LISTINGS
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-primary cyber-glow">AVAILABLE ASSETS</h2>
        <p className="text-muted-foreground uppercase text-xs tracking-widest">SECURE ACQUISITION PROTOCOL ACTIVE</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
