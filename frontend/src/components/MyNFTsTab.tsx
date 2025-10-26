import { useState, type ChangeEvent } from 'react';
import { useGetMyNFTs, useCreateListing, usePlaceBid, useAcceptBid } from '../hooks/useQueries';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Gavel, CheckCircle, Eye, Database, Search } from 'lucide-react';
import type { NFT } from '@/types/domain';
import NFTDetailModal from './NFTDetailModal';

interface MyNFTsTabProps {
  onSolveNFT: (nft: NFT) => void;
}

export default function MyNFTsTab({ onSolveNFT }: MyNFTsTabProps) {
  const { data: nfts, isLoading } = useGetMyNFTs();
  const { mutate: createListing, isPending: isListing } = useCreateListing();
  const { mutate: placeBid, isPending: isBidding } = usePlaceBid();
  const { mutate: acceptBid, isPending: isAccepting } = useAcceptBid();

  const [listingPrice, setListingPrice] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'list' | 'bid'>('list');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailNFT, setDetailNFT] = useState<NFT | null>(null);

  const handleOpenDialog = (nft: NFT, type: 'list' | 'bid') => {
    setSelectedNFT(nft);
    setDialogType(type);
    setDialogOpen(true);
    setListingPrice('');
    setBidAmount('');
  };

  const handleOpenDetailModal = (nft: NFT) => {
    setDetailNFT(nft);
    setDetailModalOpen(true);
  };

  const handleCreateListing = () => {
    if (selectedNFT && listingPrice) {
      createListing(
        { nftId: selectedNFT.id, price: BigInt(listingPrice) },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setListingPrice('');
          },
        }
      );
    }
  };

  const handlePlaceBid = () => {
    if (selectedNFT && bidAmount) {
      placeBid(
        { nftId: selectedNFT.id, amount: BigInt(bidAmount) },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setBidAmount('');
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(4)].map((_, i) => (
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

  if (!nfts || nfts.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-sm border border-dashed border-primary/30 p-8 text-center bg-black/30">
        <Database className="mb-4 h-12 w-12 text-primary cyber-pulse" />
        <h3 className="mb-2 text-xl font-semibold uppercase tracking-wide text-primary">NO ASSETS IN INVENTORY</h3>
        <p className="text-muted-foreground uppercase text-sm tracking-wider">ACQUIRE OR MINT ASSETS TO BEGIN</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-primary cyber-glow">ASSET INVENTORY</h2>
        <p className="text-muted-foreground uppercase text-xs tracking-widest">MANAGE HOLDINGS // EXECUTE OPERATIONS</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nfts.map((nft) => {
          const imageUrl = nft.imageUri || '/assets/generated/cyber-nft-placeholder.dim_400x400.png';
          const owned = true;

          return (
            <Card key={nft.id.toString()} className="cyber-border overflow-hidden bg-black/50 transition-all hover:shadow-cyber">
              <CardHeader className="p-0">
                <div 
                  className="aspect-square cursor-pointer overflow-hidden bg-muted/20 transition-opacity hover:opacity-80"
                  onClick={() => handleOpenDetailModal(nft)}
                >
                  <img src={imageUrl} alt={nft.name} className="h-full w-full object-cover" />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="mb-2 line-clamp-1 text-base uppercase tracking-wide text-primary">{nft.name}</CardTitle>
                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{nft.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {owned ? (
                    <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 uppercase text-xs">OWNED</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted/20 text-muted-foreground border-muted/30 uppercase text-xs">EXTERNAL</Badge>
                  )}
                  {!nft.puzzleStatus?.solved && (
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 uppercase text-xs">
                      UNSOLVED
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 p-4 pt-0">
                <Button
                  onClick={() => handleOpenDetailModal(nft)}
                  variant="outline"
                  className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:shadow-cyber uppercase tracking-wider text-xs"
                >
                  <Eye className="h-4 w-4" />
                  INSPECT
                </Button>
                <Button
                  onClick={() => onSolveNFT(nft)}
                  variant="outline"
                  className="w-full gap-2 border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 hover:shadow-cyber uppercase tracking-wider text-xs"
                >
                  <Search className="h-4 w-4" />
                  SOLVE
                </Button>
                {owned ? (
                  <>
                    <Button
                      onClick={() => handleOpenDialog(nft, 'list')}
                      variant="default"
                      className="w-full gap-2 bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider text-xs"
                    >
                      <Tag className="h-4 w-4" />
                      LIST
                    </Button>
                    <Button
                      onClick={() => acceptBid(nft.id)}
                      disabled={isAccepting}
                      variant="outline"
                      className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:shadow-cyber uppercase tracking-wider text-xs"
                    >
                      <CheckCircle className="h-4 w-4" />
                      ACCEPT BID
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleOpenDialog(nft, 'bid')}
                    variant="secondary"
                    className="w-full gap-2 bg-muted/20 text-foreground border border-muted/30 hover:bg-muted/30 uppercase tracking-wider text-xs"
                  >
                    <Gavel className="h-4 w-4" />
                    PLACE BID
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="cyber-border bg-card/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide text-primary">
              {dialogType === 'list' ? 'CREATE LISTING' : 'PLACE BID'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedNFT && (
              <div className="rounded-sm border border-primary/30 bg-black/50 p-4">
                <p className="mb-1 text-xs text-muted-foreground uppercase tracking-widest">ASSET</p>
                <p className="font-semibold text-primary uppercase">{selectedNFT.name}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={dialogType === 'list' ? 'price' : 'bid'} className="uppercase text-xs tracking-widest text-muted-foreground">
                {dialogType === 'list' ? 'PRICE (ICP)' : 'BID AMOUNT (ICP)'}
              </Label>
              <Input
                id={dialogType === 'list' ? 'price' : 'bid'}
                type="number"
                placeholder="Enter amount"
                value={dialogType === 'list' ? listingPrice : bidAmount}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  dialogType === 'list'
                    ? setListingPrice(event.target.value)
                    : setBidAmount(event.target.value)
                }
                className="cyber-border bg-black/50 text-foreground"
              />
            </div>
            <Button
              onClick={dialogType === 'list' ? handleCreateListing : handlePlaceBid}
              disabled={
                (dialogType === 'list' && (!listingPrice || isListing)) ||
                (dialogType === 'bid' && (!bidAmount || isBidding))
              }
              className="w-full bg-primary/20 text-primary border border-primary/50 hover:bg-primary/30 hover:shadow-cyber uppercase tracking-wider"
            >
              {dialogType === 'list'
                ? isListing
                  ? 'PROCESSING...'
                  : 'CONFIRM LISTING'
                : isBidding
                  ? 'PROCESSING...'
                  : 'CONFIRM BID'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {detailNFT && (
        <NFTDetailModal
          nft={detailNFT}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
      )}
    </div>
  );
}
