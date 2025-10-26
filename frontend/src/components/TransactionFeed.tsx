import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';
import { useGetTransactionFeed } from '../hooks/useQueries';

export default function TransactionFeed() {
  const { data: feedItems, refetch } = useGetTransactionFeed();

  // Poll for new transactions every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const formatTimestamp = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'JUST NOW';
    if (diffMins < 60) return `${diffMins}M AGO`;
    if (diffHours < 24) return `${diffHours}H AGO`;
    return `${diffDays}D AGO`;
  };

  const formatMessage = (message: string) => {
    // Extract hash-like patterns and wrap them in spans for styling
    return message.split(' ').map((word, idx) => {
      // Check if word looks like a principal or hash
      if (word.length > 20 && (word.includes('-') || /^[a-z0-9]+$/.test(word))) {
        return (
          <span key={idx} className="text-primary font-mono text-xs">
            {word.slice(0, 8)}...{word.slice(-6)}{' '}
          </span>
        );
      }
      return <span key={idx}>{word} </span>;
    });
  };

  return (
    <div className="cyber-border rounded-sm bg-card/50 p-4 backdrop-blur-sm h-full">
      <div className="mb-4 flex items-center gap-2 border-b border-primary/30 pb-3">
        <Activity className="h-5 w-5 text-primary cyber-pulse" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">LIVE FEED</h2>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {!feedItems || feedItems.length === 0 ? (
            <div className="cyber-border rounded-sm bg-black/50 p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                NO RECENT ACTIVITY
              </p>
              <p className="text-xs text-foreground/50 mt-2">
                Waiting for transactions...
              </p>
            </div>
          ) : (
            [...feedItems].reverse().map((item, idx) => (
              <div
                key={idx}
                className="cyber-border rounded-sm bg-black/50 p-3 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-primary cyber-pulse">
                    {formatTimestamp(item.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {formatMessage(item.message)}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
