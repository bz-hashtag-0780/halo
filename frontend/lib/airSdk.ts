import { useAccount, useConnect, useDisconnect, useConfig } from 'wagmi';
import type { AirService } from '@mocanetwork/airkit';
import type { AirConnector } from '@mocanetwork/airkit-connector';
import { useMemo, useCallback } from 'react';

// Hook for wallet connection utilities
export const useWalletConnection = () => {
	const { address, isConnected, chainId } = useAccount();
	const { connect, isPending: isConnecting } = useConnect();
	const { disconnect: wagmiDisconnect, isPending: isDisconnecting } =
		useDisconnect();
	const config = useConfig();

	const connectWallet = async () => {
		try {
			const airConnector = config.connectors.find(
				(connector) => connector?.isMocaNetwork
			);

			if (!airConnector) {
				throw new Error('AIR connector not found');
			}

			await connect({ connector: airConnector });
			return { success: true, address };
		} catch (error) {
			console.error('Wallet connection error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	};

	// Enhanced disconnect function that handles both wagmi and AIR service cleanup
	const disconnect = useCallback(async () => {
		try {
			console.log('🔌 Starting disconnect process...');

			// Find the AIR connector to clean up AIR service
			const airConnector = config.connectors.find(
				(connector) => connector?.isMocaNetwork
			) as AirConnector | undefined;

			if (airConnector && airConnector.airService) {
				console.log('🧹 Cleaning up AIR service...');
				try {
					// Clean up AIR service if it exists
					await airConnector.airService.logout();
					airConnector.airService.cleanUp();
				} catch (airError) {
					console.warn('AIR service cleanup warning:', airError);
					// Don't throw here, continue with wagmi disconnect
				}
			}

			// Perform wagmi disconnect
			console.log('🔗 Disconnecting wagmi...');
			wagmiDisconnect();

			console.log('✅ Disconnect completed successfully');
		} catch (error) {
			console.error('❌ Disconnect error:', error);
			// Even if there's an error, try to force disconnect
			wagmiDisconnect();
		}
	}, [config.connectors, wagmiDisconnect]);

	return {
		connectWallet,
		disconnect,
		address,
		isConnected,
		isConnecting,
		isDisconnecting,
		chainId,
	};
};

// Hook for AIR SDK services
type AirkitHook =
	| {
			isMocaNetwork: true;
			connector: AirConnector;
			airService: AirService;
	  }
	| {
			isMocaNetwork: false;
			connector: null;
			airService: null;
	  };

export const useAirkit = (): AirkitHook => {
	const config = useConfig();
	const airConnector = useMemo(
		() =>
			config.connectors.find(
				(connector): connector is AirConnector =>
					!!connector.isMocaNetwork
			),
		[config.connectors]
	);

	if (airConnector) {
		return {
			connector: airConnector,
			airService: airConnector.airService,
			isMocaNetwork: true,
		};
	}
	return {
		connector: null,
		airService: null,
		isMocaNetwork: false,
	};
};

// Utility function to format wallet addresses
export const formatAddress = (address: string): string => {
	if (!address) return '';
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
