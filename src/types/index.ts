export interface TokenMetadata {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  chainId: number;
}

export interface TokenPriceData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export interface AnalyticsSummary {
  totalVolume: number;
  activeWallets: number;
  topGainer: TokenMetadata & TokenPriceData;
}
