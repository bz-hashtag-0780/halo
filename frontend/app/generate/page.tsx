'use client';

import { useState, useEffect } from 'react';
import { useWalletConnection } from '../../lib/airSdk';
import {
	useCredentialIssuance,
	detectPlatform,
	isCredentialsConfigured,
	type CredentialResult,
} from '../../lib/credentialsUtils';

export default function GeneratePage() {
	const [isHydrated, setIsHydrated] = useState(false);
	const { address, isConnected } = useWalletConnection();
	const { issueCredential } = useCredentialIssuance();

	const [meetingUrl, setMeetingUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState('');
	const [credentialResult, setCredentialResult] =
		useState<CredentialResult | null>(null);

	// Fix hydration mismatch by ensuring client-side rendering
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 🐛 DEBUG: Log all environment variables and configuration
		console.log('🐛 DEBUGGING Generate Verified Link Click:');
		console.log('Environment Variables:', {
			NEXT_PUBLIC_AIR_API_URL: process.env.NEXT_PUBLIC_AIR_API_URL,
			NEXT_PUBLIC_ISSUER_DID: process.env.NEXT_PUBLIC_ISSUER_DID
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_ISSUER_API_KEY: process.env.NEXT_PUBLIC_ISSUER_API_KEY
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_VERIFIER_DID: process.env.NEXT_PUBLIC_VERIFIER_DID
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_VERIFIER_API_KEY: process.env
				.NEXT_PUBLIC_VERIFIER_API_KEY
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_CREDENTIAL_ID: process.env.NEXT_PUBLIC_CREDENTIAL_ID
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_PARTNER_ID: process.env.NEXT_PUBLIC_PARTNER_ID
				? '✓ Set'
				: '✗ Missing',
			NEXT_PUBLIC_AIR_BUILD_ENV: process.env.NEXT_PUBLIC_AIR_BUILD_ENV,
		});

		console.log(
			'Credentials Configuration Check:',
			isCredentialsConfigured()
		);
		console.log('Wallet State:', { isConnected, address });
		console.log('Meeting URL:', meetingUrl);
		console.log('Platform Detection:', detectPlatform(meetingUrl));

		if (!isConnected || !address) {
			setError('Please connect your wallet first');
			return;
		}

		if (!meetingUrl.trim()) {
			setError('Please enter a meeting URL');
			return;
		}

		// Basic URL validation
		try {
			new URL(meetingUrl);
		} catch {
			setError('Please enter a valid URL');
			return;
		}

		if (!isCredentialsConfigured()) {
			setError('Credentials service not properly configured');
			return;
		}

		setIsLoading(true);
		setError('');
		setSuccess(false);

		console.log('🚀 Starting credential issuance...');

		await issueCredential(
			meetingUrl,
			address,
			() => {
				// Basic success callback (widget launched)
				console.log('🐛 Credential issuance initiated successfully');
			},
			(errorMsg: string) => {
				// Error callback
				setError(errorMsg);
				setIsLoading(false);
			},
			(result: CredentialResult) => {
				// Presentation generation callback - this is where we get the final result
				console.log('🐛 Presentation generated successfully:', result);
				setSuccess(true);
				setIsLoading(false);
				setCredentialResult(result);
			}
		);
	};

	const resetForm = () => {
		setMeetingUrl('');
		setSuccess(false);
		setError('');
		setCredentialResult(null);
	};

	// Show basic form during SSR and before hydration
	if (!isHydrated) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
				<div className="max-w-md mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8 text-center">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg
								className="w-8 h-8 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Connect Your Wallet
						</h1>
						<p className="text-gray-600 mb-6">Loading...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!isConnected) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
				<div className="max-w-md mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8 text-center">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg
								className="w-8 h-8 text-blue-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-4">
							Connect Your Wallet
						</h1>
						<p className="text-gray-600 mb-6">
							You need to connect your wallet to generate verified
							meeting links.
						</p>
						<p className="text-sm text-gray-500">
							Use the &ldquo;Connect Wallet&rdquo; button in the
							header above.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (success && credentialResult) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
				<div className="max-w-2xl mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8">
						<div className="text-center mb-8">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								Credential & Presentation Generated!
							</h1>
							<p className="text-gray-600">
								Your meeting link has been verified, a
								credential has been issued to your wallet, and a
								shareable proof has been generated.
							</p>
						</div>

						<div className="bg-gray-50 rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								Verified Link Details
							</h3>
							<div className="space-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Original Meeting URL
									</label>
									<div className="mt-1 p-3 bg-white rounded border border-gray-200 break-all text-sm">
										{meetingUrl}
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										✨ Shareable Verified URL (with embedded
										proof)
									</label>
									<div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded break-all text-sm font-mono">
										{credentialResult.shareableUrl}
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Platform
										</label>
										<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
											{detectPlatform(meetingUrl)}
										</div>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Trust Level
										</label>
										<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												verified
											</span>
										</div>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Creator Address
									</label>
									<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm font-mono">
										{address}
									</div>
								</div>
							</div>
						</div>

						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-blue-400"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<h3 className="text-sm font-medium text-blue-800">
										🎉 What just happened?
									</h3>
									<div className="mt-2 text-sm text-blue-700">
										<p>
											1.{' '}
											<strong>Credential Issued:</strong>{' '}
											Your wallet now holds a verified
											credential for this meeting
											<br />
											2.{' '}
											<strong>
												Presentation Generated:
											</strong>{' '}
											A cryptographic proof was created
											from your credential
											<br />
											3. <strong>
												URL Enhanced:
											</strong>{' '}
											The proof was embedded in your
											meeting URL
											<br />
											4.{' '}
											<strong>
												Share with Confidence:
											</strong>{' '}
											Recipients can verify the
											link&apos;s authenticity using our
											Chrome extension or verification
											tools
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="flex gap-4">
							<button
								onClick={resetForm}
								className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
							>
								Generate Another Link
							</button>
							<button
								onClick={() =>
									navigator.clipboard.writeText(
										credentialResult.shareableUrl ||
											meetingUrl
									)
								}
								className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
							>
								Copy Verified Link
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-xl shadow-lg p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Generate Verified Meeting Link
						</h1>
						<p className="text-gray-600">
							Create a cryptographically verified meeting link
							that others can trust.
						</p>
					</div>

					<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="flex items-start">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-blue-500 mt-0.5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-blue-800">
									Connected Wallet
								</h3>
								<p className="text-sm text-blue-700 font-mono">
									{address}
								</p>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label
								htmlFor="meetingUrl"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Meeting URL
							</label>
							<input
								type="url"
								id="meetingUrl"
								value={meetingUrl}
								onChange={(e) => setMeetingUrl(e.target.value)}
								placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
								disabled={isLoading}
								required
							/>
							{meetingUrl && (
								<p className="mt-2 text-sm text-gray-600">
									Platform detected:{' '}
									<span className="font-semibold">
										{detectPlatform(meetingUrl)}
									</span>
								</p>
							)}
						</div>

						{error && (
							<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
								<div className="flex">
									<div className="flex-shrink-0">
										<svg
											className="h-5 w-5 text-red-400"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<div className="ml-3">
										<p className="text-sm text-red-800">
											{error}
										</p>
									</div>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading || !meetingUrl.trim()}
							className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
									Generating Credential...
								</span>
							) : (
								'Generate Verified Link'
							)}
						</button>
					</form>

					<div className="mt-8 p-4 bg-gray-50 rounded-lg">
						<h3 className="text-sm font-medium text-gray-900 mb-2">
							How it works:
						</h3>
						<ol className="text-sm text-gray-600 space-y-1">
							<li>1. Enter your meeting URL above</li>
							<li>
								2. Click &ldquo;Generate Verified Link&rdquo; to
								create a credential
							</li>
							<li>
								3. The AIR Credentials widget will open for you
								to complete issuance
							</li>
							<li>
								4. Your link becomes cryptographically
								verifiable by others
							</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
}
