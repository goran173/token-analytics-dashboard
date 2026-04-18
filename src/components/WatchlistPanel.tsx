'use client';

import * as React from 'react';
import { Trash2, Bookmark, ExternalLink } from 'lucide-react';
import { type Address } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { chains } from '@/lib/chain';
import { useToast } from '@/hooks/use-toast';

interface WatchlistItem {
  address: Address;
  chainId: number;
  symbol: string;
}

interface WatchlistPanelProps {
  onSearch: (address: Address, chainId: number) => void;
  currentSearch?: { address: Address, chainId: number, symbol?: string };
}

export function WatchlistPanel({ onSearch, currentSearch }: WatchlistPanelProps) {
  const [watchlist, setWatchlist] = React.useState<WatchlistItem[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    const saved = localStorage.getItem('token_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  const saveToWatchlist = () => {
    if (!currentSearch) return;
    
    const newItem: WatchlistItem = {
      address: currentSearch.address,
      chainId: currentSearch.chainId,
      symbol: currentSearch.symbol || '???',
    };

    const exists = watchlist.some(
      item => item.address.toLowerCase() === newItem.address.toLowerCase() && item.chainId === newItem.chainId
    );

    if (!exists) {
      const updated = [newItem, ...watchlist];
      setWatchlist(updated);
      localStorage.setItem('token_watchlist', JSON.stringify(updated));
      toast({
        title: "Saved to Watchlist",
        description: `${newItem.symbol} has been added to your saved tokens.`,
      });
    }
  };

  const removeFromWatchlist = (e: React.MouseEvent, address: string, chainId: number) => {
    e.stopPropagation();
    const itemToRemove = watchlist.find(
      item => item.address.toLowerCase() === address.toLowerCase() && item.chainId === chainId
    );
    const updated = watchlist.filter(
      item => !(item.address.toLowerCase() === address.toLowerCase() && item.chainId === chainId)
    );
    setWatchlist(updated);
    localStorage.setItem('token_watchlist', JSON.stringify(updated));
    if (itemToRemove) {
      toast({
        title: "Removed from Watchlist",
        description: `${itemToRemove.symbol} has been removed.`,
      });
    }
  };

  const isCurrentSaved = currentSearch && watchlist.some(
    item => item.address.toLowerCase() === currentSearch.address.toLowerCase() && item.chainId === currentSearch.chainId
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-xl">Watchlist</CardTitle>
          <CardDescription>Quick access to your saved tokens</CardDescription>
        </div>
        {currentSearch && !isCurrentSaved && (
          <Button variant="outline" size="sm" onClick={saveToWatchlist}>
            <Bookmark className="h-4 w-4 mr-2" />
            Save Current
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg border-muted">
            <Bookmark className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Your watchlist is empty.</p>
            <p className="text-xs text-muted-foreground">Search for a token and click "Save Current" to add it.</p>
          </div>
        ) : (
          <div className="divide-y">
            {watchlist.map((item, idx) => {
              const chainName = chains.find(c => c.id === item.chainId)?.name || 'Unknown';
              return (
                <div 
                  key={`${item.address}-${item.chainId}-${idx}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 transition-colors cursor-pointer group px-2 rounded-md"
                  onClick={() => onSearch(item.address, item.chainId)}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                        {chainName}
                      </Badge>
                      <span className="font-bold text-sm">{item.symbol}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                      {item.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => removeFromWatchlist(e, item.address, item.chainId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ExternalLink className="h-3 w-3 text-muted-foreground mr-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
