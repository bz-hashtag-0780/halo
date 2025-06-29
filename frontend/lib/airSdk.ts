import { useAccount, useConnect, useDisconnect, useConfig } from 'wagmi';
import type { AirService } from '@mocanetwork/airkit';
import type { AirConnector } from '@mocanetwork/airkit-connector';
import { useMemo } from 'react';

// Hook for wallet connection utilities
export const useWalletConnection = () => {
	const { address, isConnected, chainId } = useAccount();
	const { connect, isPending: isConnecting } = useConnect();
	const { disconnect, isPending: isDisconnecting } = useDisconnect();
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
