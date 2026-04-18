import { useQuery } from '@tanstack/react-query';
import { fetchTokenMetadata, fetchRecentTransfers, deriveActiveHolders, calculate24hVolume } from '@/lib/queries';
import { type Address } from 'viem';

/**
 * Hook to fetch and aggregate all necessary token data including metadata, transfers, 
 * active holders, and 24h volume.
 * 
 * @param address The token contract address
 * @param chainId The chain ID to query
 */
export function useTokenData(address: Address | undefined, chainId: number) {
  const metadataQuery = useQuery({
    queryKey: ['tokenMetadata', address, chainId],
    queryFn: () => fetchTokenMetadata(address!, chainId),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 30000, // 30s
    retry: 1,
  });

  const transfersQuery = useQuery({
    queryKey: ['tokenTransfers', address, chainId],
    queryFn: () => fetchRecentTransfers(address!, chainId),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 10000, // 10s
    retry: 1,
  });

  const activeHolders = metadataQuery.data && transfersQuery.data
    ? deriveActiveHolders(transfersQuery.data, metadataQuery.data.decimals)
    : [];

  const volume24h = metadataQuery.data && transfersQuery.data
    ? calculate24hVolume(transfersQuery.data, metadataQuery.data.decimals)
    : '0';

  return {
    metadata: metadataQuery.data,
    transfers: transfersQuery.data,
    activeHolders,
    volume24h,
    isLoading: metadataQuery.isLoading || transfersQuery.isLoading,
    isFetching: metadataQuery.isFetching || transfersQuery.isFetching,
    isError: metadataQuery.isError || transfersQuery.isError,
    error: metadataQuery.error || transfersQuery.error,
  };
}
