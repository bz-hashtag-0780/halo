'use client';

import { useState } from 'react';
import { useWalletConnection, formatAddress } from '../../lib/airSdk';
import { mocaChain } from '../../lib/wagmiConfig';

export function WalletButton() {
	const [showDropdown, setShowDropdown] = useState(false);
	const {
		connectWallet,
		disconnect,
		address,
		isConnected,
		isConnecting,
		isDisconnecting,
		chainId,
	} = useWalletConnection();

	const handleConnect = async () => {
		const result = await connectWallet();
		if (!result.success) {
			alert(`Connection failed: ${result.error}`);
		}
	};

	if (isConnecting) {
		return (
			<button
				disabled
				className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-not-allowed opacity-50"
			>
				<div className="flex items-center space-x-2">
					<svg
						className="animate-spin h-4 w-4 text-white"
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
					<span>Connecting...</span>
				</div>
			</button>
		);
	}

	if (isConnected && address) {
		return (
			<div className="relative">
				<button
					onClick={() => setShowDropdown(!showDropdown)}
					className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition duration-200"
				>
					<div className="w-2 h-2 bg-green-300 rounded-full"></div>
					<span>{formatAddress(address)}</span>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{showDropdown && (
					<div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
						<div className="p-4">
							<div className="space-y-3">
								<div>
									<p className="text-sm text-gray-600">
										Address:
									</p>
									<p className="font-mono text-sm text-gray-900 break-all">
										{address}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-600">
										Network:
									</p>
									<p className="text-sm text-gray-900">
										{chainId === mocaChain.id
											? 'Moca Testnet'
											: `Chain ID: ${chainId}`}
									</p>
								</div>
							</div>

							<button
								onClick={() => {
									disconnect();
									setShowDropdown(false);
								}}
								disabled={isDisconnecting}
								className="w-full mt-4 py-2 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200"
							>
								{isDisconnecting
									? 'Disconnecting...'
									: 'Disconnect'}
							</button>
						</div>
					</div>
				)}

				{/* Click outside to close dropdown */}
				{showDropdown && (
					<div
						className="fixed inset-0 z-40"
						onClick={() => setShowDropdown(false)}
					></div>
				)}
			</div>
		);
	}

	return (
		<button
			onClick={handleConnect}
			className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition duration-200"
		>
			Connect Wallet
		</button>
	);
}
