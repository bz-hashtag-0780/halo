import { airConnector } from '@mocanetwork/airkit-connector';
import { createConfig, http, type Config } from 'wagmi';
import { BUILD_ENV } from '@mocanetwork/airkit';
import { type Chain } from 'viem';

// Moca Chain Testnet Configuration
export const mocaChain: Chain = {
	id: 5151,
	name: 'Moca',
	nativeCurrency: {
		name: 'Moca',
		symbol: 'MOCA',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ['https://devnet-rpc-eu.mocachain.org'],
		},
	},
	blockExplorers: {
		default: {
			name: 'Moca Devenet Explorer',
			url: 'https://devnet-scan.mocachain.org',
		},
	},
};

// Partner ID for Halo MVP
export const PARTNER_ID = 'efaadeae-e2bb-4327-8ffe-e43933c3922a';

// Singleton pattern to prevent multiple AIR SDK instances
let wagmiConfig: Config | null = null;

export const getWagmiConfig = () => {
	if (wagmiConfig) {
		return wagmiConfig;
	}

	const connectors = [
		airConnector({
			buildEnv: BUILD_ENV.SANDBOX,
			enableLogging: true,
			partnerId: PARTNER_ID,
		}),
	];

	wagmiConfig = createConfig({
		chains: [mocaChain],
		transports: {
			[mocaChain.id]: http(),
		},
		connectors,
	});

	return wagmiConfig;
};
