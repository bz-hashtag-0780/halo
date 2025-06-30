import { useState, useEffect, useRef } from 'react';
import {
	AirCredentialWidget,
	type QueryRequest,
	type VerificationResults,
	type Language,
} from '@mocanetwork/air-credential-sdk';
import '@mocanetwork/air-credential-sdk/dist/style.css';
import { type AirService, BUILD_ENV } from '@mocanetwork/airkit';
import type { BUILD_ENV_TYPE } from '@mocanetwork/airkit';
import type { EnvironmentConfig } from '../../config/environments';

// Environment variables for configuration
const LOCALE = import.meta.env.VITE_LOCALE || 'en';

interface CredentialVerificationProps {
	airService: AirService | null;
	isLoggedIn: boolean;
	airKitBuildEnv: BUILD_ENV_TYPE;
	partnerId: string;
	environmentConfig: EnvironmentConfig;
}

const getVerifierAuthToken = async (
	verifierDid: string,
	apiKey: string,
	apiUrl: string
): Promise<string | null> => {
	try {
		const response = await fetch(`${apiUrl}/verifier/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: '*/*',
				'X-Test': 'true',
			},
			body: JSON.stringify({
				verifierDid: verifierDid,
				authToken: apiKey,
			}),
		});

		if (!response.ok) {
			throw new Error(`API call failed with status: ${response.status}`);
		}

		const data = await response.json();

		if (data.code === 80000000 && data.data && data.data.token) {
			return data.data.token;
		} else {
			console.error(
				'Failed to get verifier auth token from API:',
				data.msg || 'Unknown error'
			);
			return null;
		}
	} catch (error) {
		console.error('Error fetching verifier auth token:', error);
		return null;
	}
};

const CredentialVerification = ({
	airService,
	isLoggedIn,
	airKitBuildEnv,
	partnerId,
	environmentConfig,
}: CredentialVerificationProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [verificationResult, setVerificationResult] =
		useState<VerificationResults | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [userName, setUserName] = useState('');
	const [email, setEmail] = useState('');
	const [companyName, setCompanyName] = useState('');
	const widgetRef = useRef<AirCredentialWidget | null>(null);

	// Configuration - these would typically come from environment variables or API
	const [config, setConfig] = useState({
		apiKey:
			import.meta.env.VITE_VERIFIER_API_KEY || 'your-verifier-api-key',
		verifierDid:
			import.meta.env.VITE_VERIFIER_DID || 'did:example:verifier123',
		programId: import.meta.env.VITE_PROGRAM_ID || 'c21hc030kb5iu0030224Qs',
		redirectUrlForIssuer:
			import.meta.env.VITE_REDIRECT_URL_FOR_ISSUER ||
			'http://localhost:5173/issue',
	});

	console.log('AirService in CredentialVerification:', airService);

	const handleConfigChange = (field: string, value: string) => {
		setConfig((prev) => ({ ...prev, [field]: value }));
	};

	const generateWidget = async () => {
		try {
			// Step 1: Fetch the verifier auth token using the API key
			const fetchedVerifierAuthToken = await getVerifierAuthToken(
				config.verifierDid,
				config.apiKey,
				environmentConfig.apiUrl
			);

			if (!fetchedVerifierAuthToken) {
				setError(
					'Failed to fetch verifier authentication token. Please check your API Key.'
				);
				setIsLoading(false);
				return;
			}

			// Create the query request with the fetched token
			const queryRequest: QueryRequest = {
				process: 'Verify',
				verifierAuth: fetchedVerifierAuthToken,
				programId: config.programId,
			};

			const rp = await airService
				?.goToPartner(environmentConfig.widgetUrl)
				.catch((err) => {
					console.error('Error getting URL with token:', err);
				});

			if (!rp?.urlWithToken) {
				console.warn(
					'Failed to get URL with token. Please check your partner ID.'
				);
				setError(
					'Failed to get URL with token. Please check your partner ID.'
				);
				setIsLoading(false);
				return;
			}
			// Create and configure the widget with proper options
			widgetRef.current = new AirCredentialWidget(
				queryRequest,
				partnerId,
				{
					endpoint: rp?.urlWithToken,
					airKitBuildEnv: airKitBuildEnv || BUILD_ENV.STAGING,
					theme: 'light', // currently only have light theme
					locale: LOCALE as Language,
					redirectUrlForIssuer:
						config.redirectUrlForIssuer || undefined,
				}
			);

			// Set up event listeners
			widgetRef.current.on(
				'verifyCompleted',
				(results: VerificationResults) => {
					setVerificationResult(results);
					setIsLoading(false);
					console.log('Verification completed:', results);
				}
			);

			widgetRef.current.on('close', () => {
				setIsLoading(false);
				console.log('Widget closed');
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Failed to create widget'
			);
			setIsLoading(false);
		}
	};

	const handleVerifyCredential = async () => {
		setIsLoading(true);
		setError(null);
		setVerificationResult(null);

		// Log configuration to console as requested
		console.log('Configuration being used:', {
			verifierDid: config.verifierDid,
			apiKey: config.apiKey,
			programId: config.programId,
			partnerId: partnerId,
			redirectUrlForIssuer: config.redirectUrlForIssuer,
			userName: userName,
			companyName: companyName,
			environmentConfig: environmentConfig,
		});

		try {
			// Generate widget if not already created
			if (!widgetRef.current) {
				await generateWidget();
			}

			// Start the widget
			if (widgetRef.current) {
				widgetRef.current.launch();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			setIsLoading(false);
		}
	};

	const handleCopyLink = async () => {
		const link = 'https://halo.link.vercel.app/orh-nsya-yce';
		try {
			await navigator.clipboard.writeText(link);
			// Could add a toast notification here if desired
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	};

	useEffect(() => {
		return () => {
			if (widgetRef.current) {
				widgetRef.current.destroy();
			}
		};
	}, []);

	const isVerified = verificationResult?.status === 'Compliant';

	return (
		<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo Section */}
				<div className="text-center mb-8">
					<div
						className="inline-flex items-center justify-center w-16 h-16 bg-[#00AEEF] rounded-full mb-4 shadow-lg"
						style={{ boxShadow: '0 0 20px rgba(0, 174, 239, 0.4)' }}
					>
						<svg
							className="w-8 h-8 text-white"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">
						<span
							className="text-[#00AEEF]"
							style={{
								textShadow: '0 0 10px rgba(0, 174, 239, 0.5)',
							}}
						>
							HALO
						</span>
					</h1>
				</div>

				{/* Main Content */}
				<div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
					{!isVerified && (
						<div className="text-center mb-8">
							<h2 className="text-2xl font-bold text-white mb-2">
								Prove you're from X Company
							</h2>
							<p className="text-gray-400 text-sm">
								Connect your wallet and verify your credentials
								to continue.
							</p>
						</div>
					)}

					{!isVerified ? (
						<>
							{/* Halo Link Display - Show upfront */}
							<div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
								<p className="text-gray-300 text-sm mb-2 font-medium">
									Halo Link:
								</p>
								<div className="text-[#00AEEF] font-mono text-sm break-all">
									https://halo.link.vercel.app/orh-nsya-yce
								</div>
							</div>

							{/* User Input Section */}
							<div className="space-y-4 mb-6">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Your Email
									</label>
									<input
										type="text"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent"
										placeholder="Enter your email"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Your Name
									</label>
									<input
										type="text"
										value={userName}
										onChange={(e) =>
											setUserName(e.target.value)
										}
										className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent"
										placeholder="Enter your name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										Company
									</label>
									<input
										type="text"
										value={companyName}
										onChange={(e) =>
											setCompanyName(e.target.value)
										}
										className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent"
										placeholder="Enter your company name"
									/>
								</div>
							</div>

							{/* Error Message */}
							{error && (
								<div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
									<p className="text-red-300 text-sm">
										{error}
									</p>
								</div>
							)}

							{/* Action Button */}
							<button
								onClick={handleVerifyCredential}
								disabled={isLoading || !isLoggedIn}
								className="w-full bg-[#00AEEF] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#0099D4] focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
								style={{
									boxShadow: isLoading
										? 'none'
										: '0 0 20px rgba(0, 174, 239, 0.3)',
								}}
							>
								{isLoading ? (
									<span className="flex items-center justify-center">
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
										Verifying...
									</span>
								) : (
									'Start Credential Verification'
								)}
							</button>

							{!isLoggedIn && (
								<p className="text-center text-gray-400 text-xs mt-4">
									Please connect your wallet to continue
								</p>
							)}
						</>
					) : (
						/* Success State - Detailed Meeting Information */
						<div className="py-6">
							<div className="text-center mb-6">
								<div
									className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4 shadow-lg"
									style={{
										boxShadow:
											'0 0 20px rgba(34, 197, 94, 0.4)',
									}}
								>
									<svg
										className="w-8 h-8 text-white"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<h3 className="text-2xl font-bold text-white mb-2">
									Verification Complete
								</h3>
								<p className="text-green-400 text-lg">
									Meeting details verified
								</p>
							</div>

							{/* Meeting Attendees */}
							<div className="mb-6">
								<h4 className="text-lg font-semibold text-white mb-4">
									Meeting Attendees
								</h4>

								{/* Attendee 1 */}
								<div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0">
											<span className="text-green-400 text-lg">
												✅
											</span>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-white font-medium">
													swt
												</span>
											</div>
											<div className="text-gray-300 text-sm mb-1">
												swt.anamilee@gmail.com
											</div>
											<div className="text-gray-400 text-sm">
												Halo
											</div>
										</div>
									</div>
								</div>

								{/* Attendee 2 */}
								<div className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
									<div className="flex items-start gap-3">
										<div className="flex-shrink-0">
											<span className="text-green-400 text-lg">
												✅
											</span>
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-white font-medium">
													bz
												</span>
											</div>
											<div className="text-gray-300 text-sm mb-1">
												bz@flowfoundation.org
											</div>
											<div className="text-gray-400 text-sm">
												Flow Foundation
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Google Meeting Link */}
							<div className="mb-6 p-4 bg-green-900/20 border border-green-600 rounded-lg">
								<p className="text-green-300 text-sm font-medium mb-2">
									Meeting Link:
								</p>
								<div className="text-green-400 font-mono text-sm break-all bg-green-900/30 p-2 rounded">
									https://meet.google.com/dyg-rrci-eji
								</div>
							</div>

							{/* Action Button */}
							<button
								onClick={handleCopyLink}
								className="w-full bg-[#00AEEF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0099D4] focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 shadow-lg"
								style={{
									boxShadow:
										'0 0 20px rgba(0, 174, 239, 0.3)',
								}}
							>
								Copy Google Meeting Link
							</button>
						</div>
					)}
				</div>

				{/* Hidden Configuration Section - keeping for functionality but not showing */}
				<div style={{ display: 'none' }}>
					<div>
						<input
							type="text"
							value={config.verifierDid}
							onChange={(e) =>
								handleConfigChange(
									'verifierDid',
									e.target.value
								)
							}
						/>
						<input
							type="text"
							value={config.apiKey}
							onChange={(e) =>
								handleConfigChange('apiKey', e.target.value)
							}
						/>
						<input
							type="text"
							value={config.programId}
							onChange={(e) =>
								handleConfigChange('programId', e.target.value)
							}
						/>
						<input
							type="url"
							value={config.redirectUrlForIssuer}
							onChange={(e) =>
								handleConfigChange(
									'redirectUrlForIssuer',
									e.target.value
								)
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CredentialVerification;
