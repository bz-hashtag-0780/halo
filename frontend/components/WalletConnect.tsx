'use client';

import { useState, useEffect } from 'react';
import { useWalletConnection } from '../lib/airSdk';
import { mocaChain } from '../lib/wagmiConfig';

export function WalletConnect() {
	const [isHydrated, setIsHydrated] = useState(false);
	const {
		connectWallet,
		disconnect,
		address,
		isConnected,
		isConnecting,
		isDisconnecting,
		chainId,
	} = useWalletConnection();

	// Fix hydration mismatch by ensuring client-side rendering
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const handleConnect = async () => {
		const result = await connectWallet();
		if (!result.success) {
			alert(`Connection failed: ${result.error}`);
		}
	};

	// Show basic connect form during SSR and before hydration
	if (!isHydrated) {
		return (
			<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
				<div className="p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Connect Wallet
					</h2>

					<p className="text-gray-600 mb-6">
						Connect to Moca Testnet using AIR SDK to create and
						verify signed links.
					</p>

					<button
						disabled
						className="w-full py-3 bg-blue-600 opacity-50 cursor-not-allowed text-white font-medium rounded-lg"
					>
						Connect with AIR SDK
					</button>

					<div className="mt-4 text-xs text-gray-500">
						<p>
							This will connect to Moca Testnet (Chain ID:{' '}
							{mocaChain.id})
						</p>
						<p>Partner ID: efaadeae-e2bb-4327-8ffe-e43933c3922a</p>
					</div>
				</div>
			</div>
		);
	}

	if (isConnected) {
		return (
			<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
				<div className="p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						✅ Wallet Connected
					</h2>

					<div className="space-y-3">
						<div className="bg-green-50 p-3 rounded-lg">
							<p className="text-sm text-gray-600">Address:</p>
							<p className="font-mono text-sm text-gray-900 break-all">
								{address}
							</p>
						</div>

						<div className="bg-blue-50 p-3 rounded-lg">
							<p className="text-sm text-gray-600">Network:</p>
							<p className="text-sm text-gray-900">
								{chainId === mocaChain.id
									? 'Moca Testnet'
									: `Chain ID: ${chainId}`}
							</p>
						</div>
					</div>

					<button
						onClick={() => disconnect()}
						disabled={isDisconnecting}
						className="w-full mt-4 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
					>
						{isDisconnecting
							? 'Disconnecting...'
							: 'Disconnect Wallet'}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
			<div className="p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">
					Connect Wallet
				</h2>

				<p className="text-gray-600 mb-6">
					Connect to Moca Testnet using AIR SDK to create and verify
					signed links.
				</p>

				<button
					onClick={handleConnect}
					disabled={isConnecting}
					className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
				>
					{isConnecting ? (
						<div className="flex items-center justify-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Connecting...
						</div>
					) : (
						'Connect with AIR SDK'
					)}
				</button>

				<div className="mt-4 text-xs text-gray-500">
					<p>
						This will connect to Moca Testnet (Chain ID:{' '}
						{mocaChain.id})
					</p>
					<p>Partner ID: efaadeae-e2bb-4327-8ffe-e43933c3922a</p>
				</div>
			</div>
		</div>
	);
}
