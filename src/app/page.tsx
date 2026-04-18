"use client";

import * as React from "react";
import { type Address } from "viem";
import { TokenMetadata, Transfer } from "@/types/token";
import { TokenInput } from "@/components/TokenInput";
import { WatchlistPanel } from "@/components/WatchlistPanel";
import { TokenOverview } from "@/components/TokenOverview";
import { HolderDistributionChart } from "@/components/HolderDistributionChart";
import { TransferActivityChart } from "@/components/TransferActivityChart";
import { TransfersTable } from "@/components/TransfersTable";
import { useTokenData } from "@/hooks/use-token-data";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightLeft, Zap, Shield, BarChart3, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EXAMPLES = [
  {
    name: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    chainId: 1,
  },
  {
    name: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chainId: 1,
  },
  {
    name: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    chainId: 1,
  },
];

export default function Home() {
  const [search, setSearch] = React.useState<{
    address: Address;
    chainId: number;
  } | null>(null);
  const { toast } = useToast();
  const { address: connectedAddress } = useAccount();

  const {
    metadata,
    transfers,
    activeHolders,
    volume24h,
    isLoading,
    isError,
    error,
  } = useTokenData(search?.address, search?.chainId || 1);

  const handleSearch = (address: Address, chainId: number) => {
    setSearch({ address, chainId });
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description:
          (error as Error)?.message ||
          "Could not fetch token data. Please check the address and network.",
      });
    }
  }, [isError, error, toast]);

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-12">
      {/* Hero Section */}
      {!search && (
        <div className="flex flex-col items-center text-center space-y-8 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Decode Any{" "}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                ERC-20
              </span>{" "}
              Token
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Professional on-chain analytics for smart contract researchers and
              token holders. Paste an address to reveal hidden distributions and
              volume trends.
            </p>
          </div>

          <div className="w-full max-w-2xl px-4">
            <TokenInput onSearch={handleSearch} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="text-sm text-muted-foreground w-full mb-2">
              Try an example on Ethereum:
            </p>
            {EXAMPLES.map((ex) => (
              <Button
                key={ex.name}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(ex.address as Address, ex.chainId)}
                className="hover:border-primary/50"
              >
                {ex.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 w-full text-left">
            <FeatureCard
              icon={<Zap className="h-5 w-5 text-yellow-500" />}
              title="Real-time Transfers"
              description="Track the last 100 transactions instantly across multiple EVM chains."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5 text-blue-500" />}
              title="Holder Analysis"
              description="Approximate top holders based on recent net flows without complex indexers."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5 text-green-500" />}
              title="Volume Trends"
              description="Visualize volume spikes and cumulative flows over the last 24 hours."
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      {search && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Analytics Dashboard
            </h2>
            <TokenInput
              onSearch={handleSearch}
              initialAddress={search.address}
              initialChainId={search.chainId}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <TokenOverview
                metadata={metadata as TokenMetadata}
                volume24h={volume24h}
                activeHoldersCount={activeHolders.length}
                transferCount={transfers?.length || 0}
                isLoading={isLoading}
                isError={isError}
                onRetry={() => setSearch({ ...search! })}
              />

              <div className="grid gap-8 md:grid-cols-2">
                <HolderDistributionChart
                  data={activeHolders}
                  isLoading={isLoading}
                  highlightAddress={connectedAddress}
                />
                <TransferActivityChart
                  transfers={transfers || []}
                  decimals={metadata?.decimals || 18}
                  isLoading={isLoading}
                />
              </div>

              {!isLoading && metadata && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Showing the latest {transfers?.length || 0} transfers in
                        the block window.
                      </CardDescription>
                    </div>
                    <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <TransfersTable
                      transfers={(transfers as Transfer[]) || []}
                      symbol={metadata.symbol}
                      decimals={metadata.decimals}
                      chainId={metadata.chainId}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              <WatchlistPanel
                onSearch={handleSearch}
                currentSearch={
                  metadata
                    ? {
                        address: metadata.address,
                        chainId: metadata.chainId,
                        symbol: metadata.symbol,
                      }
                    : undefined
                }
              />

              <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                  <CardTitle className="text-sm">Methodology Note</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <div className="flex gap-2">
                    <Info className="h-4 w-4 shrink-0" />
                    <p>
                      Active holders are derived by calculating net flow for all
                      addresses found in the last 5,000 blocks. This is an
                      approximation and may not include long-term inactive
                      whales.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2 p-4 rounded-xl border bg-card/50">
      <div className="p-2 rounded-lg bg-background w-fit border shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
