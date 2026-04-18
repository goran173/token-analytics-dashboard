import { type Address } from 'viem';

export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  address: Address;
  chainId: number;
}

export interface Transfer {
  from: Address;
  to: Address;
  value: bigint;
  blockNumber: bigint;
  txHash: string;
  timestamp: number;
}

export interface HolderData {
  address: string;
  balance: string;
  percentage: string;
  rawBalance: bigint;
}
