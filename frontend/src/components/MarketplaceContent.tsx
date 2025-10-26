import { useState } from 'react';
import { useGetMyNFTs, useGetAllListings, useGetCallerUserProfile } from '../hooks/useQueries';
import DashboardLayout from './DashboardLayout';
import MarketplaceTab from './MarketplaceTab';
import MyNFTsTab from './MyNFTsTab';
import MintNFTTab from './MintNFTTab';
import EscapeStudioTab from './EscapeStudioTab';
import type { NFT } from '@/types/domain';

export default function MarketplaceContent() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [nftToSolve, setNftToSolve] = useState<NFT | null>(null);
  const { data: myNFTs } = useGetMyNFTs();
  const { data: listings } = useGetAllListings();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleSolveNFT = (nft: NFT) => {
    setNftToSolve(nft);
    setActiveTab('escape-tools');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'marketplace':
        return <MarketplaceTab />;
      case 'mint':
        return <MintNFTTab />;
      case 'escape-tools':
        return <EscapeStudioTab nftToSolve={nftToSolve} onClearNFT={() => setNftToSolve(null)} />;
      case 'my-nfts':
        return <MyNFTsTab onSolveNFT={handleSolveNFT} />;
      default:
        return <MarketplaceTab />;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      agentName={userProfile?.codename || 'AGENT'}
      ownedNFTs={myNFTs?.length || 0}
      activeListings={listings?.length || 0}
      principalId="PUBLIC-ACCESS"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
