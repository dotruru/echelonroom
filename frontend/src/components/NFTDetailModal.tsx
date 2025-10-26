import { useState } from 'react';
import { useGetNFTBids, useGetNFTTransactions, useAcceptBid } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, User, Clock, DollarSign, Target } from 'lucide-react';
import type { NFT } from '@/types/domain';

interface NFTDetailModalProps {
  nft: NFT;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownedListingId?: number;
}

export default function NFTDetailModal({ nft, open, onOpenChange, ownedListingId }: NFTDetailModalProps) {
  const { data: bids } = useGetNFTBids(nft.id);
  const { data: transactions } = useGetNFTTransactions(nft.id);
  const { mutate: acceptBid, isPending: isAccepting } = useAcceptBid();
  const [acceptingBidId, setAcceptingBidId] = useState<number | null>(null);

  const imageUrl = nft.imageUri || '/assets/generated/cyber-nft-placeholder.dim_400x400.png';

  const handleDownload = () => {
    if (!nft.imageUri) return;
    const link = document.createElement('a');
    link.href = nft.imageUri;
    link.download = `${nft.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAcceptBid = (bidId: number) => {
    if (!ownedListingId) return;
    setAcceptingBidId(bidId);
    acceptBid(
      { listingId: ownedListingId, bidId },
      {
        onSettled: () => setAcceptingBidId(null),
      }
    );
  };

  const lamportsToSol = (lamports?: string | null) => {
    if (!lamports) return '0.00';
    const value = Number(lamports);
    if (Number.isNaN(value)) return '0.00';
    return (value / 1_000_000_000).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cyber-border max-w-4xl bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide text-primary cyber-glow">ASSET DETAILS</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="cyber-border rounded-sm bg-black/50 p-2">
              <img src={imageUrl} alt={nft.name} className="w-full rounded-sm" />
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full gap-2 border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:shadow-cyber uppercase tracking-wider text-xs"
            >
              <Download className="h-4 w-4" />
              DOWNLOAD ASSET
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              <div className="cyber-border rounded-sm bg-black/50 p-4">
                <h3 className="mb-3 text-lg font-bold uppercase tracking-wide text-primary">{nft.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{nft.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">ASSET ID</span>
                    <span className="text-xs font-mono text-primary">{nft.id.toString()}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">OWNER</span>
                    <span className="text-xs text-primary">{nft.owner.codename || nft.owner.principal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">CREATOR</span>
                    <span className="text-xs text-primary">{nft.creator.codename || nft.creator.principal}</span>
                  </div>
                </div>
              </div>

              {bids && bids.length > 0 && (
                <div className="cyber-border rounded-sm bg-black/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-wide text-primary">ACTIVE BIDS</h4>
                  </div>
                  <div className="space-y-2">
                    {bids.map((bid) => (
                      <div key={bid.id} className="rounded-sm border border-primary/20 bg-black/30 p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-foreground/70">
                              {bid.bidder.slice(0, 10)}...
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                            {lamportsToSol(bid.amountLamports)} SOL
                          </Badge>
                        </div>
                        {ownedListingId && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptBid(bid.id)}
                            disabled={isAccepting && acceptingBidId === bid.id}
                            className="mt-2 h-7 text-[10px] uppercase tracking-widest"
                          >
                            {isAccepting && acceptingBidId === bid.id ? 'Processing...' : 'Accept Bid'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {transactions && transactions.length > 0 && (
                <div className="cyber-border rounded-sm bg-black/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold uppercase tracking-wide text-primary">TRANSACTION HISTORY</h4>
                  </div>
                  <div className="space-y-2">
                    {transactions.map((tx, idx) => (
                      <div key={tx.id ?? idx} className="rounded-sm border border-primary/20 bg-black/30 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase tracking-widest">
                            TRANSFER #{transactions.length - idx}
                          </span>
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {lamportsToSol(tx.priceLamports)} SOL
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-foreground/70">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground uppercase">FROM:</span>
                            <span className="font-mono">{tx.from?.slice(0, 12) ?? 'UNKNOWN'}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground uppercase">TO:</span>
                            <span className="font-mono">{tx.to?.slice(0, 12) ?? 'UNKNOWN'}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground uppercase">TIME:</span>
                            <span>{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
