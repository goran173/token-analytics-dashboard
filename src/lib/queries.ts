import { parseAbiItem, formatUnits, type Address } from "viem";
import { getPublicClient } from "./chain";
import { HolderData, TokenMetadata, Transfer } from "@/types/token";

const ERC20_ABI = [
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);

/**
 * Fetches ERC-20 token metadata using multicall for efficiency.
 * @param address The token contract address
 * @param chainId The chain ID to query
 * @returns Metadata including name, symbol, decimals, and total supply
 */
export async function fetchTokenMetadata(
  address: Address,
  chainId: number,
): Promise<TokenMetadata> {
  const client = getPublicClient(chainId);

  try {
    const results = await client.multicall({
      contracts: [
        { address, abi: ERC20_ABI, functionName: "name" },
        { address, abi: ERC20_ABI, functionName: "symbol" },
        { address, abi: ERC20_ABI, functionName: "decimals" },
        { address, abi: ERC20_ABI, functionName: "totalSupply" },
      ],
    });

    const [name, symbol, decimals, totalSupply] = results.map((r) => r.result);

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: totalSupply as bigint,
      address,
      chainId,
      // Simplified verification check: if it has a name, it's a contract
      contractVerified: !!name,
    };
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    throw new Error("Failed to fetch token metadata");
  }
}

/**
 * Fetches recent Transfer events for a token and enriches them with timestamps.
 * @param address The token contract address
 * @param chainId The chain ID to query
 * @param limit Max logs to fetch
 * @returns Array of enriched transfer logs
 */
export async function fetchRecentTransfers(
  address: Address,
  chainId: number,
  limit = 100,
  retryWindow?: bigint
): Promise<Transfer[]> {
  const client = getPublicClient(chainId);
  
  try {
    const currentBlock = await client.getBlockNumber();
    
    // Start with 1000 for mainnet, 5000 for others, or use the retry window
    const windowSize = retryWindow ?? (chainId === 1 ? 1000n : 5000n);
    const fromBlock = currentBlock - windowSize;

    const logs = await client.getLogs({
      address,
      event: TRANSFER_EVENT,
      fromBlock,
      toBlock: currentBlock,
    });

    const recentLogs = logs.slice(-limit);

    // Batch fetch timestamps for these blocks
    const blockNumbers = [...new Set(recentLogs.map((l) => l.blockNumber))];
    const blockResults = await Promise.all(
      blockNumbers.map((bn) => client.getBlock({ blockNumber: bn })),
    );
    const timestampMap = Object.fromEntries(
      blockResults.map((b) => [b.number.toString(), Number(b.timestamp)]),
    );

    return recentLogs.map((log) => ({
      from: log.args.from!,
      to: log.args.to!,
      value: log.args.value!,
      blockNumber: log.blockNumber!,
      txHash: log.transactionHash!,
      timestamp: timestampMap[log.blockNumber!.toString()] || 0,
    }));
  } catch (error: unknown) {
    const isRangeError = (error as Error).message?.includes('range') || (error as Error).message?.includes('tier');
    
    // If it's a range error and we haven't already retried with the absolute minimum
    if (isRangeError && retryWindow !== 10n) {
      console.warn('Alchemy range limit hit. Retrying with minimal 10-block window...');
      return fetchRecentTransfers(address, chainId, limit, 10n);
    }

    console.error("Fetch transfers failed", error);
    return [];
  }
}

/**
 * Derives an approximation of top active holders from recent net transfers.
 */
export function deriveActiveHolders(
  transfers: Transfer[],
  decimals: number,
): HolderData[] {
  const balances: Record<string, bigint> = {};

  transfers.forEach((tx) => {
    balances[tx.from] = (balances[tx.from] || 0n) - tx.value;
    balances[tx.to] = (balances[tx.to] || 0n) + tx.value;
  });

  const activeHolders = Object.entries(balances)
    .map(([address, balance]) => ({
      address: address as Address,
      balance: formatUnits(balance, decimals),
      percentage: "0", // Calculated below
      rawBalance: balance,
    }))
    .filter((h) => h.rawBalance > 0n)
    .sort((a, b) => (b.rawBalance > a.rawBalance ? 1 : -1))
    .slice(0, 10);

  const totalObserved = activeHolders.reduce(
    (acc, h) => acc + h.rawBalance,
    0n,
  );

  return activeHolders.map((h) => ({
    ...h,
    percentage:
      totalObserved > 0n
        ? ((Number(h.rawBalance) / Number(totalObserved)) * 100).toFixed(2)
        : "0",
  }));
}

/**
 * Calculates 24h volume from transfer logs.
 * @param transfers Array of enriched transfer objects
 * @param decimals Token decimals
 * @returns Total volume formatted as a string
 */
export function calculate24hVolume(transfers: Transfer[], decimals: number) {
  const now = Math.floor(Date.now() / 1000);
  const oneDayAgo = now - 24 * 60 * 60;

  const volume = transfers
    .filter((tx) => tx.timestamp >= oneDayAgo)
    .reduce((acc, tx) => acc + tx.value, 0n);

  return formatUnits(volume, decimals);
}
