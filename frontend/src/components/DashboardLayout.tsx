import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Store, Wallet, Plus, Lock, User, Activity } from 'lucide-react';
import TransactionFeed from './TransactionFeed';
import Toolbox from './Toolbox';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  agentName: string;
  ownedNFTs: number;
  activeListings: number;
  principalId?: string;
}

export default function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  agentName,
  ownedNFTs,
  activeListings,
  principalId,
}: DashboardLayoutProps) {
  const clearanceId = principalId && principalId.trim().length > 0 ? principalId : 'PUBLIC-ACCESS';
  const formattedClearance =
    clearanceId.length > 24 ? `${clearanceId.slice(0, 20)}...` : clearanceId;

  const tabs = [
    { id: 'marketplace', label: 'MARKETPLACE', icon: Store },
    { id: 'mint', label: 'PUZZLE STUDIO', icon: Plus },
    { id: 'escape-tools', label: 'ESCAPE TOOLS', icon: Lock },
    { id: 'my-nfts', label: 'MY NFTS', icon: Wallet },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Desktop: Three-panel layout */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
        {/* Left Panel - Agent Details */}
        <div className="lg:col-span-3 space-y-4">
          <div className="cyber-border rounded-sm bg-card/50 p-4 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-primary/30 pb-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">AGENT PROFILE</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">CODENAME</p>
                <p className="text-lg font-bold text-foreground cyber-glow">{agentName}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">CLEARANCE ID</p>
                <p className="text-[10px] font-mono text-foreground/70 break-all">
                  {formattedClearance}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="cyber-border rounded-sm bg-black/50 p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">ASSETS</p>
                  <p className="text-2xl font-bold text-primary">{ownedNFTs}</p>
                </div>
                <div className="cyber-border rounded-sm bg-black/50 p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">LISTINGS</p>
                  <p className="text-2xl font-bold text-primary">{activeListings}</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">ACTIVITY STATUS</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/70">NETWORK</span>
                    <span className="text-primary cyber-pulse">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/70">SECURITY</span>
                    <span className="text-primary">ENCRYPTED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toolbox Section */}
          <Toolbox />
        </div>

        {/* Center Panel - Main Content */}
        <div className="lg:col-span-6">
          {/* Navigation Tabs */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  className={`gap-2 uppercase tracking-wider text-xs ${
                    activeTab === tab.id
                      ? 'bg-primary/20 text-primary border-primary shadow-cyber'
                      : 'border-primary/30 bg-transparent text-foreground/70 hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="cyber-border rounded-sm bg-card/50 p-6 backdrop-blur-sm min-h-[600px]">
            {children}
          </div>
        </div>

        {/* Right Panel - Transaction Feed */}
        <div className="lg:col-span-3">
          <TransactionFeed />
        </div>
      </div>

      {/* Mobile: Stacked layout */}
      <div className="lg:hidden space-y-4">
        {/* Agent Profile */}
        <div className="cyber-border rounded-sm bg-card/50 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2 border-b border-primary/30 pb-2">
            <User className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">AGENT PROFILE</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">CODENAME</p>
              <p className="text-base font-bold text-foreground cyber-glow">{agentName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="cyber-border rounded-sm bg-black/50 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">ASSETS</p>
                <p className="text-lg font-bold text-primary">{ownedNFTs}</p>
              </div>
              <div className="cyber-border rounded-sm bg-black/50 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">LISTINGS</p>
                <p className="text-lg font-bold text-primary">{activeListings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbox Section */}
        <Toolbox />

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                className={`gap-2 uppercase tracking-wider text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border-primary shadow-cyber'
                    : 'border-primary/30 bg-transparent text-foreground/70 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="cyber-border rounded-sm bg-card/50 p-4 backdrop-blur-sm">
          {children}
        </div>

        {/* Transaction Feed */}
        <TransactionFeed />
      </div>
    </div>
  );
}
