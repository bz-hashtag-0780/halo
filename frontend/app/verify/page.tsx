'use client';

import { useState } from 'react';
import {
	extractProofFromUrl,
	verifyPresentation,
	type VerificationResult,
} from '../../lib/credentialsUtils';

export default function VerifyPage() {
	const [inputUrl, setInputUrl] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [verificationResult, setVerificationResult] =
		useState<VerificationResult | null>(null);
	const [error, setError] = useState('');

	const handleVerify = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!inputUrl.trim()) {
			setError('Please enter a URL to verify');
			return;
		}

		// Basic URL validation
		try {
			new URL(inputUrl);
		} catch {
			setError('Please enter a valid URL');
			return;
		}

		setIsLoading(true);
		setError('');
		setVerificationResult(null);

		try {
			console.log('🐛 Starting verification for URL:', inputUrl);

			// Step 1: Extract proof from URL
			const extractedProof = extractProofFromUrl(inputUrl);

			if (!extractedProof) {
				setError(
					'No verification proof found in this URL. This link was not generated using Halo.'
				);
				setIsLoading(false);
				return;
			}

			console.log('🐛 Proof extracted successfully');

			// Step 2: Verify the presentation
			const result = await verifyPresentation(extractedProof);

			console.log('🐛 Verification completed:', result);
			setVerificationResult(result);
		} catch (err) {
			console.error('🐛 Verification error:', err);
			setError(
				err instanceof Error ? err.message : 'Verification failed'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setInputUrl('');
		setVerificationResult(null);
		setError('');
	};

	const getStatusIcon = (isValid: boolean) => {
		if (isValid) {
			return (
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
			);
		} else {
			return (
				<svg
					className="w-8 h-8 text-red-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			);
		}
	};

	const getTrustBadge = (trustLevel?: string) => {
		switch (trustLevel?.toLowerCase()) {
			case 'verified':
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
						✅ Verified
					</span>
				);
			case 'organization':
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
						🏢 Organization
					</span>
				);
			default:
				return (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
						❓ Unknown
					</span>
				);
		}
	};

	if (verificationResult) {
		return (
			<div
				className={`min-h-screen py-12 px-4 ${
					verificationResult.isValid
						? 'bg-gradient-to-br from-green-50 to-emerald-100'
						: 'bg-gradient-to-br from-red-50 to-pink-100'
				}`}
			>
				<div className="max-w-2xl mx-auto">
					<div className="bg-white rounded-xl shadow-lg p-8">
						<div className="text-center mb-8">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								{getStatusIcon(verificationResult.isValid)}
							</div>
							<h1 className="text-2xl font-bold text-gray-900 mb-2">
								{verificationResult.isValid
									? 'Link Verification Successful!'
									: 'Link Verification Failed'}
							</h1>
							<p className="text-gray-600">
								{verificationResult.isValid
									? 'This meeting link has been cryptographically verified and is trusted.'
									: 'This link could not be verified or contains invalid credentials.'}
							</p>
						</div>

						{verificationResult.isValid ? (
							<div className="bg-gray-50 rounded-lg p-6 mb-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">
									Verification Details
								</h3>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Verified URL
										</label>
										<div className="mt-1 p-3 bg-white rounded border border-gray-200 break-all text-sm">
											{inputUrl.split('?')[0]}{' '}
											{/* Show original URL without proof */}
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Trust Level
											</label>
											<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
												{getTrustBadge(
													verificationResult.trustLevel
												)}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Platform
											</label>
											<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
												{verificationResult.platform ||
													'Unknown'}
											</div>
										</div>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Creator Address
										</label>
										<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm font-mono">
											{verificationResult.creatorAddress ||
												'Not available'}
										</div>
									</div>
									{verificationResult.timestamp && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Verified At
											</label>
											<div className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
												{new Date(
													verificationResult.timestamp
												).toLocaleString()}
											</div>
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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
										<h3 className="text-sm font-medium text-red-800">
											⚠️ Verification Failed
										</h3>
										<div className="mt-2 text-sm text-red-700">
											<p>
												{verificationResult.error ||
													'The verification proof in this URL is invalid or has been tampered with.'}
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

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
										How This Works
									</h3>
									<div className="mt-2 text-sm text-blue-700">
										<p>
											Halo uses zero-knowledge proofs to
											verify meeting links without
											exposing sensitive information. The
											verification process checks the
											cryptographic signature embedded in
											the URL to ensure it hasn&apos;t
											been tampered with and comes from a
											trusted source.
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
								Verify Another Link
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-xl shadow-lg p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Verify Meeting Link
						</h1>
						<p className="text-gray-600">
							Check if a meeting link has been cryptographically
							verified using Halo.
						</p>
					</div>

					<form onSubmit={handleVerify} className="space-y-6">
						<div>
							<label
								htmlFor="verifyUrl"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Meeting URL to Verify
							</label>
							<input
								type="url"
								id="verifyUrl"
								value={inputUrl}
								onChange={(e) => setInputUrl(e.target.value)}
								placeholder="Paste the meeting URL you want to verify here..."
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
								disabled={isLoading}
								required
							/>
							<p className="mt-2 text-sm text-gray-500">
								Only URLs generated through Halo will contain
								verifiable proofs.
							</p>
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
							disabled={isLoading || !inputUrl.trim()}
							className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
									Verifying Link...
								</span>
							) : (
								'Verify Link'
							)}
						</button>
					</form>

					<div className="mt-8 p-4 bg-gray-50 rounded-lg">
						<h3 className="text-sm font-medium text-gray-900 mb-2">
							What can be verified:
						</h3>
						<ul className="text-sm text-gray-600 space-y-1">
							<li>
								• Meeting links generated using Halo&apos;s
								credential system
							</li>
							<li>
								• Trust level of the link creator (verified,
								organization, etc.)
							</li>
							<li>
								• Platform detection (Zoom, Google Meet, Teams,
								etc.)
							</li>
							<li>
								• Creator&apos;s wallet address and verification
								timestamp
							</li>
							<li>
								• Cryptographic integrity of the verification
								proof
							</li>
						</ul>
					</div>

					<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-yellow-400"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-yellow-800">
									Demo Notice
								</h3>
								<div className="mt-2 text-sm text-yellow-700">
									<p>
										This is a demo verification interface.
										In production, this functionality would
										be integrated into browser extensions
										and email clients to automatically
										verify meeting links.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
