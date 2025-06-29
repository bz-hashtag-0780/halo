import { WalletConnect } from '../../components/WalletConnect';

export default function ConnectPage() {
	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-3xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-4">
						Halo - Social Engineering Prevention
					</h1>
					<p className="text-lg text-gray-600">
						Connect your wallet to start creating verified meeting
						links
					</p>
				</div>

				<WalletConnect />

				<div className="mt-8 max-w-2xl mx-auto">
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							How it works:
						</h3>
						<ol className="list-decimal list-inside space-y-2 text-gray-600">
							<li>Connect your wallet to Moca Testnet</li>
							<li>Generate signed credentials using AIR SDK</li>
							<li>
								Create verified meeting links with your
								signature
							</li>
							<li>
								Recipients see trust badges for verified links
							</li>
							<li>
								Prevent social engineering attacks through
								verification
							</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
}
