'use client';

import * as React from 'react';
import { Copy, ExternalLink, RefreshCcw, Info, Wallet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { explorers, chains } from '@/lib/chain';
import { type Address } from 'viem';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';

interface TokenOverviewProps {
  metadata?: {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: bigint;
    address: Address;
    chainId: number;
  };
  volume24h?: string;
  activeHoldersCount?: number;
  transferCount?: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function TokenOverview({
  metadata,
  volume24h = '0',
  activeHoldersCount = 0,
  transferCount = 0,
  isLoading,
  isError,
  onRetry,
}: TokenOverviewProps) {
  const [copied, setCopied] = React.useState(false);
  const [usdPrice, setUsdPrice] = React.useState<number | null>(null);
  
  const { address: connectedAddress, isConnected, chainId: currentChainId } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: connectedAddress,
    token: metadata?.address,
    chainId: metadata?.chainId,
    query: {
      enabled: isConnected && !!metadata?.address,
    }
  });

  React.useEffect(() => {
    if (metadata?.address && metadata?.chainId === 1) {
      fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${metadata.address}&vs_currencies=usd`)
        .then(res => res.json())
        .then(data => {
          const price = data[metadata.address.toLowerCase()]?.usd;
          if (price) setUsdPrice(price);
        })
        .catch(() => {}); // Gracefully skip if failed
    }
  }, [metadata]);

  const copyToClipboard = () => {
    if (metadata?.address) {
      navigator.clipboard.writeText(metadata.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-destructive/5 text-center">
        <Info className="h-8 w-8 text-destructive mb-3" />
        <h3 className="text-lg font-bold text-destructive">Failed to Load Overview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error fetching the token data. Please check the address and try again.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const isWrongNetwork = isConnected && metadata && currentChainId !== metadata.chainId;
  const chainName = chains.find(c => c.id === metadata?.chainId)?.name || 'Unknown Chain';
  const explorerUrl = metadata ? `${explorers[metadata.chainId]}/token/${metadata.address}` : '#';

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : (
              <>
                <span>{chainName}</span>
                <span>/</span>
                <span className="font-mono">{metadata?.address.slice(0, 6)}...{metadata?.address.slice(-4)}</span>
              </>
            )}
          </div>
          {!isConnected && !isLoading && (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 italic">
              <Wallet className="h-2.5 w-2.5" />
              Connect wallet to see your balance
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isWrongNetwork && (
            <Button 
              variant="destructive" 
              size="xs" 
              className="h-7 text-[10px] px-2"
              onClick={() => switchChain({ chainId: metadata.chainId })}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Switch to {chainName}
            </Button>
          )}
          {!isLoading && metadata && (
            <a 
              href={explorerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${isConnected ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {/* Token Info */}
        <Card className="overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Token</p>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold truncate" title={metadata?.name}>
                  {metadata?.name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary">{metadata?.symbol}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-primary/10 rounded transition-colors"
                    title="Copy Address"
                  >
                    <Copy className={`h-3 w-3 ${copied ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Balance - Only show if connected */}
        {isConnected && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-6">
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">My Balance</p>
              {isBalanceLoading || isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ) : (
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold truncate">
                    {Number(balanceData?.formatted || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground uppercase">{metadata?.symbol}</p>
                    {usdPrice && balanceData && (
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">
                        ${(parseFloat(balanceData.formatted) * usdPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Total Supply */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Supply</p>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold">
                  {Number(metadata?.totalSupply || 0n).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </h3>
                <p className="text-xs text-muted-foreground">Standard ERC-20</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 24h Volume */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">24h Transfer Vol</p>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold">
                  {Number(volume24h).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </h3>
                <p className="text-xs text-muted-foreground">across last 24h</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Holders */}
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Active Holders</p>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ) : (
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold">{activeHoldersCount}</h3>
                <p className="text-xs text-muted-foreground">in last 5000 blocks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!isLoading && !isError && transferCount === 0 && (
        <div className="bg-muted/30 border border-muted rounded-lg p-4 flex items-center gap-3">
          <Info className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No recent transfer activity found in the last 5,000 blocks for this token.
          </p>
        </div>
      )}
    </div>
  );
}
