import {
	AirCredentialWidget,
	type JsonDocumentObject,
	type QueryRequest,
	BUILD_ENV,
	type Language,
} from '@mocanetwork/air-credential-sdk';
import { useAirkit } from './airSdk';

// Environment configuration
const API_URL =
	process.env.NEXT_PUBLIC_AIR_API_URL ||
	'https://credential.api.sandbox.air3.com';
const ISSUER_DID = process.env.NEXT_PUBLIC_ISSUER_DID;
const ISSUER_API_KEY = process.env.NEXT_PUBLIC_ISSUER_API_KEY;
const VERIFIER_DID = process.env.NEXT_PUBLIC_VERIFIER_DID;
const VERIFIER_API_KEY = process.env.NEXT_PUBLIC_VERIFIER_API_KEY;
const CREDENTIAL_ID = process.env.NEXT_PUBLIC_CREDENTIAL_ID;
const PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID;
const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID;
const BUILD_ENV_VALUE =
	(process.env.NEXT_PUBLIC_AIR_BUILD_ENV as 'SANDBOX' | 'PRODUCTION') ||
	'SANDBOX';

// Auth token generation functions
export const getIssuerAuthToken = async (): Promise<string | null> => {
	if (!ISSUER_DID || !ISSUER_API_KEY) {
		console.error('Missing issuer configuration');
		return null;
	}

	try {
		const response = await fetch(`${API_URL}/issuer/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: '*/*',
				'X-Test': 'true',
			},
			body: JSON.stringify({
				issuerDid: ISSUER_DID,
				authToken: ISSUER_API_KEY,
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
				'Failed to get issuer auth token:',
				data.msg || 'Unknown error'
			);
			return null;
		}
	} catch (error) {
		console.error('Error fetching issuer auth token:', error);
		return null;
	}
};

export const getVerifierAuthToken = async (): Promise<string | null> => {
	if (!VERIFIER_DID || !VERIFIER_API_KEY) {
		console.error('Missing verifier configuration');
		return null;
	}

	try {
		const response = await fetch(`${API_URL}/verifier/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: '*/*',
				'X-Test': 'true',
			},
			body: JSON.stringify({
				verifierDid: VERIFIER_DID,
				authToken: VERIFIER_API_KEY,
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
				'Failed to get verifier auth token:',
				data.msg || 'Unknown error'
			);
			return null;
		}
	} catch (error) {
		console.error('Error fetching verifier auth token:', error);
		return null;
	}
};

// Meeting link credential subject interface
export interface MeetingLinkCredentialSubject {
	meeting_url: string;
	creator_address: string;
	created_timestamp: string;
	platform: string;
	trust_level: string;
	expires_at: string;
	id: string;
}

// Platform detection utility
export const detectPlatform = (url: string): string => {
	if (url.includes('zoom.us')) return 'Zoom';
	if (url.includes('meet.google.com')) return 'Google Meet';
	if (url.includes('teams.microsoft.com')) return 'Microsoft Teams';
	if (url.includes('webex.com')) return 'Webex';
	if (url.includes('discord.com') || url.includes('discord.gg'))
		return 'Discord';
	return 'Unknown';
};

// Generate credential subject for meeting link
export const generateMeetingLinkCredential = (
	meetingUrl: string,
	creatorAddress: string,
	trustLevel: string = 'verified'
): MeetingLinkCredentialSubject => {
	const now = new Date();
	const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

	return {
		meeting_url: meetingUrl,
		creator_address: creatorAddress,
		created_timestamp: now.toISOString(),
		platform: detectPlatform(meetingUrl),
		trust_level: trustLevel,
		expires_at: expiresAt.toISOString(),
		id: `meeting-link-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`,
	};
};

// Custom hook for credential issuance
export const useCredentialIssuance = () => {
	const { airService, isMocaNetwork } = useAirkit();

	const issueCredential = async (
		meetingUrl: string,
		creatorAddress: string,
		onSuccess?: () => void,
		onError?: (error: string) => void
	) => {
		if (!isMocaNetwork || !airService) {
			const error = 'AIR service not available';
			console.error(error);
			onError?.(error);
			return;
		}

		if (!ISSUER_DID || !CREDENTIAL_ID || !PARTNER_ID) {
			const error = 'Missing credential configuration';
			console.error(error);
			onError?.(error);
			return;
		}

		try {
			// Get issuer auth token
			const issuerAuth = await getIssuerAuthToken();
			if (!issuerAuth) {
				throw new Error('Failed to get issuer auth token');
			}

			// Generate credential subject
			const credentialSubject = generateMeetingLinkCredential(
				meetingUrl,
				creatorAddress
			);

			// Get AIR Kit partner token
			const goToPartnerResult = await airService
				.goToPartner(`${API_URL}/widget`)
				.catch((err) => {
					console.error('Error getting URL with token:', err);
					throw err;
				});

			// Construct the claim request
			const claimRequest = {
				process: 'Issue' as const,
				issuerDid: ISSUER_DID,
				issuerAuth,
				credentialId: CREDENTIAL_ID,
				credentialSubject:
					credentialSubject as unknown as JsonDocumentObject,
			};

			// Create the issuance widget
			const airIssuanceWidget = new AirCredentialWidget(
				claimRequest,
				PARTNER_ID,
				{
					endpoint: goToPartnerResult?.urlWithToken,
					airKitBuildEnv: BUILD_ENV[BUILD_ENV_VALUE],
					theme: 'light',
					locale: 'en' as Language,
				}
			);

			// Handle completion event
			airIssuanceWidget.on('issueCompleted', () => {
				console.log('Credential issuance completed successfully.');
				onSuccess?.();
			});

			// Launch the widget
			airIssuanceWidget.launch();
		} catch (error) {
			console.error('Error in credential issuance:', error);
			onError?.(error instanceof Error ? error.message : 'Unknown error');
		}
	};

	return { issueCredential };
};

// Custom hook for credential verification
export const useCredentialVerification = () => {
	const { airService, isMocaNetwork } = useAirkit();

	const verifyCredential = async (
		onSuccess?: (status: string) => void,
		onError?: (error: string) => void
	) => {
		if (!isMocaNetwork || !airService) {
			const error = 'AIR service not available';
			console.error(error);
			onError?.(error);
			return;
		}

		if (!PROGRAM_ID || !PARTNER_ID) {
			const error = 'Missing verification configuration';
			console.error(error);
			onError?.(error);
			return;
		}

		try {
			// Get verifier auth token
			const verifierAuth = await getVerifierAuthToken();
			if (!verifierAuth) {
				throw new Error('Failed to get verifier auth token');
			}

			// Get AIR Kit partner token
			const goToPartnerResult = await airService
				.goToPartner(`${API_URL}/widget`)
				.catch((err) => {
					console.error('Error getting URL with token:', err);
					throw err;
				});

			// Construct the query request
			const queryRequest: QueryRequest = {
				process: 'Verify',
				verifierAuth,
				programId: PROGRAM_ID,
			};

			// Create the verification widget
			const airVerifierWidget = new AirCredentialWidget(
				queryRequest,
				PARTNER_ID,
				{
					endpoint: goToPartnerResult?.urlWithToken,
					airKitBuildEnv: BUILD_ENV[BUILD_ENV_VALUE],
					theme: 'light',
					locale: 'en' as Language,
					redirectUrlForIssuer:
						process.env.NEXT_PUBLIC_REDIRECT_URL_FOR_ISSUER,
				}
			);

			// Handle completion event
			airVerifierWidget.on(
				'verifyCompleted',
				(results: { status: string }) => {
					const { status } = results;
					console.log('Credential verification completed:', status);
					onSuccess?.(status);
				}
			);

			// Launch the widget
			airVerifierWidget.launch();
		} catch (error) {
			console.error('Error in credential verification:', error);
			onError?.(error instanceof Error ? error.message : 'Unknown error');
		}
	};

	return { verifyCredential };
};

// Utility to check if credentials SDK is properly configured
export const isCredentialsConfigured = (): boolean => {
	return !!(
		ISSUER_DID &&
		ISSUER_API_KEY &&
		VERIFIER_DID &&
		VERIFIER_API_KEY &&
		CREDENTIAL_ID &&
		PROGRAM_ID &&
		PARTNER_ID
	);
};

// Export configuration for debugging
export const getCredentialsConfig = () => ({
	API_URL,
	ISSUER_DID: ISSUER_DID ? '✓ Set' : '✗ Missing',
	ISSUER_API_KEY: ISSUER_API_KEY ? '✓ Set' : '✗ Missing',
	VERIFIER_DID: VERIFIER_DID ? '✓ Set' : '✗ Missing',
	VERIFIER_API_KEY: VERIFIER_API_KEY ? '✓ Set' : '✗ Missing',
	CREDENTIAL_ID: CREDENTIAL_ID ? '✓ Set' : '✗ Missing',
	PROGRAM_ID: PROGRAM_ID ? '✓ Set' : '✗ Missing',
	PARTNER_ID: PARTNER_ID ? '✓ Set' : '✗ Missing',
	BUILD_ENV: BUILD_ENV_VALUE,
});
