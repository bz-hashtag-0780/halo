'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getWagmiConfig } from '../../lib/wagmiConfig';
import { ReactNode, useMemo } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
	const config = useMemo(() => getWagmiConfig(), []);

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	);
}
