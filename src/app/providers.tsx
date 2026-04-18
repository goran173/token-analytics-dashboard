'use client';

import * as React from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider, useIsFetching } from '@tanstack/react-query';
import { config } from '@/lib/chain';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from '@/components/ui/toaster';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Exponential backoff for rate limits
        if (error?.message?.includes('429') || error?.message?.includes('Rate limit')) return true;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  }
});

function ProgressBar() {
  const isFetching = useIsFetching();
  
  React.useEffect(() => {
    if (isFetching > 0) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    NProgress.configure({ showSpinner: false, speed: 400 });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <ProgressBar />
          {children}
          <Toaster />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
