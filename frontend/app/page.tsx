import Link from 'next/link';

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
						🛡️ Halo MVP
					</h1>
					<h2 className="text-xl md:text-2xl text-gray-700 mb-8">
						Social Engineering Prevention Tool
					</h2>
					<p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
						Prevent social engineering attacks by verifying meeting
						links and senders using onchain credentials. Chrome
						extension highlights verified vs unverified links with
						trust badges.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
						<Link
							href="/connect"
							className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg"
						>
							Connect Wallet & Get Started
						</Link>
						<Link
							href="/generate"
							className="px-8 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg border-2 border-blue-600 transition duration-200 shadow-lg"
						>
							Generate Signed Link
						</Link>
					</div>
				</div>

				<div className="grid md:grid-cols-3 gap-8 mb-16">
					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="text-3xl mb-4">🔗</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-3">
							Create Verified Links
						</h3>
						<p className="text-gray-600">
							Generate meeting links signed with your wallet
							credentials. Recipients can verify the sender&apos;s
							authenticity.
						</p>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="text-3xl mb-4">🔍</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-3">
							Chrome Extension
						</h3>
						<p className="text-gray-600">
							Automatically scan Gmail, Discord, and other
							platforms. Trust badges appear next to verified
							links.
						</p>
					</div>

					<div className="bg-white rounded-lg shadow-md p-6">
						<div className="text-3xl mb-4">⛓️</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-3">
							Onchain Verification
						</h3>
						<p className="text-gray-600">
							Uses AIR SDK and Moca Testnet for decentralized
							credential verification. No central authority
							needed.
						</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-8">
					<h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
						How It Works
					</h3>
					<div className="grid md:grid-cols-4 gap-6">
						<div className="text-center">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-blue-600 font-bold">
									1
								</span>
							</div>
							<h4 className="font-semibold mb-2">
								Connect Wallet
							</h4>
							<p className="text-sm text-gray-600">
								Connect to Moca Testnet using AIR SDK
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-blue-600 font-bold">
									2
								</span>
							</div>
							<h4 className="font-semibold mb-2">
								Generate Link
							</h4>
							<p className="text-sm text-gray-600">
								Create signed meeting links with your
								credentials
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-blue-600 font-bold">
									3
								</span>
							</div>
							<h4 className="font-semibold mb-2">Send Safely</h4>
							<p className="text-sm text-gray-600">
								Share verified links via email or messaging
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
								<span className="text-blue-600 font-bold">
									4
								</span>
							</div>
							<h4 className="font-semibold mb-2">Trust Badge</h4>
							<p className="text-sm text-gray-600">
								Recipients see verification status instantly
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
