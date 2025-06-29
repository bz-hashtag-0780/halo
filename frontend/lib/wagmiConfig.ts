import { airConnector } from '@mocanetwork/airkit-connector';
import { createConfig, http, type Config } from 'wagmi';
import { BUILD_ENV as AIRKIT_BUILD_ENV } from '@mocanetwork/airkit';
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

// Partner ID for Halo MVP (using working Partner ID from air-credential-example)
export const PARTNER_ID =
	process.env.NEXT_PUBLIC_PARTNER_ID ||
	'66811bd6-dab9-41ef-8146-61f29d038a45';

// Build environment configuration (matching airkit-example pattern)
export const BUILD_ENV = AIRKIT_BUILD_ENV;

console.log('🐛 wagmiConfig: PARTNER_ID =', PARTNER_ID);
console.log('🐛 wagmiConfig: BUILD_ENV =', BUILD_ENV);

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
