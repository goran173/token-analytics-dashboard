import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, arbitrum, base, polygon } from 'wagmi/chains';
import { http, createPublicClient } from 'viem';

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || '';

export const chains = [mainnet, arbitrum, base, polygon] as const;

export const config = getDefaultConfig({
  appName: 'Token Analytics Dashboard',
  projectId: 'YOUR_PROJECT_ID', 
  chains: chains,
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [arbitrum.id]: http(`https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  },
  ssr: true,
});

export const explorers: Record<number, string> = {
  [mainnet.id]: 'https://etherscan.io',
  [arbitrum.id]: 'https://arbiscan.io',
  [base.id]: 'https://basescan.org',
  [polygon.id]: 'https://polygonscan.com',
};

export const getPublicClient = (chainId: number) => {
  const chain = chains.find((c) => c.id === chainId) || mainnet;
  const transportUrl = {
    [mainnet.id]: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    [arbitrum.id]: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    [base.id]: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    [polygon.id]: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  }[chain.id] || `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

  return createPublicClient({
    chain,
    transport: http(transportUrl),
  });
};
