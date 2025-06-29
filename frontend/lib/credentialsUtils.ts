import {
	AirCredentialWidget,
	type ClaimRequest,
	type JsonDocumentObject,
	type QueryRequest,
	type Language,
} from '@mocanetwork/air-credential-sdk';
import { BUILD_ENV } from '@mocanetwork/airkit';
import type { BUILD_ENV_TYPE } from '@mocanetwork/airkit';
import { useAirkit } from './airSdk';
import { useRef } from 'react';

// BUILD_ENV now properly imported from @mocanetwork/airkit

// Environment variables for configuration
const LOCALE = 'en';

// Environment configuration
const API_URL =
	process.env.NEXT_PUBLIC_AIR_API_URL ||
	'https://credential.api.sandbox.air3.com';
const ISSUER_DID =
	process.env.NEXT_PUBLIC_ISSUER_DID ||
	'did:air:id:test:4P6Hf6LYB359J9g7rS9UM38BcChiuXesqb69SMyxYm';
const ISSUER_API_KEY =
	process.env.NEXT_PUBLIC_ISSUER_API_KEY ||
	'dEgGg2i9NRPkqIxE0XBEk8RClPTbtdbwwuexDcxQ';
const VERIFIER_DID =
	process.env.NEXT_PUBLIC_VERIFIER_DID ||
	'did:key:Xwp7BEfYVoXEPUUvsWgpFpH61sdnMywFNb4HLXUJH1gsER4pBKXXmDQA8JTdnv8oDAtUinPJapBhDuhchrFHtR1Yphi';
const VERIFIER_API_KEY =
	process.env.NEXT_PUBLIC_VERIFIER_API_KEY ||
	'yDqo81H7oOGN7UHpjFui18ruaETQ5FZEA5Nvjim6';
const CREDENTIAL_ID =
	process.env.NEXT_PUBLIC_CREDENTIAL_ID || 'c21hh0g02uqge00v0488UG';
const PROGRAM_ID =
	process.env.NEXT_PUBLIC_PROGRAM_ID || 'c21hh03078zg100i3227SO';
const PARTNER_ID =
	process.env.NEXT_PUBLIC_PARTNER_ID ||
	'efaadeae-e2bb-4327-8ffe-e43933c3922a';
const BUILD_ENV_VALUE =
	(process.env.NEXT_PUBLIC_AIR_BUILD_ENV as BUILD_ENV_TYPE) ||
	BUILD_ENV.SANDBOX;

// Environment config object (matching airkit-example pattern)
const environmentConfig = {
	widgetUrl: 'https://credential-widget.sandbox.air3.com',
	apiUrl: API_URL,
};

console.log('🐛 BUILD_ENV from airkit:', BUILD_ENV);
console.log('🐛 BUILD_ENV_VALUE from env:', BUILD_ENV_VALUE);
console.log('🐛 All environment variables:', {
	API_URL,
	ISSUER_DID: ISSUER_DID ? 'Set' : 'Missing',
	ISSUER_API_KEY: ISSUER_API_KEY ? 'Set' : 'Missing',
	VERIFIER_DID: VERIFIER_DID ? 'Set' : 'Missing',
	VERIFIER_API_KEY: VERIFIER_API_KEY ? 'Set' : 'Missing',
	CREDENTIAL_ID: CREDENTIAL_ID ? 'Set' : 'Missing',
	PROGRAM_ID: PROGRAM_ID ? 'Set' : 'Missing',
	PARTNER_ID: PARTNER_ID ? 'Set' : 'Missing',
	BUILD_ENV_VALUE,
});

// Auth token generation functions (matching airkit-example pattern)
export const getIssuerAuthToken = async (
	issuerDid: string,
	apiKey: string,
	apiUrl: string
): Promise<string | null> => {
	try {
		const response = await fetch(`${apiUrl}/issuer/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				accept: '*/*',
				'X-Test': 'true',
			},
			body: JSON.stringify({
				issuerDid: issuerDid,
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
				'Failed to get issuer auth token from API:',
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

// Meeting link credential subject interface (without id field)
export interface MeetingLinkCredentialSubject {
	meeting_url: string;
	creator_address: string;
	created_timestamp: string;
	platform: string;
	trust_level: string;
	expires_at: string;
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

// Generate credential subject for meeting link (NO id field - auto-generated)
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
		// NO id field - gets auto-generated by AIR system
	};
};

// Custom hook for credential issuance (following airkit-example pattern exactly)
export const useCredentialIssuance = () => {
	const { airService, isMocaNetwork } = useAirkit();
	const widgetRef = useRef<AirCredentialWidget | null>(null);

	const generateWidget = async (
		meetingUrl: string,
		creatorAddress: string,
		setError: (error: string | null) => void,
		setIsLoading: (loading: boolean) => void
	) => {
		try {
			// Step 1: Fetch the issuer auth token using the API key
			const fetchedIssuerAuthToken = await getIssuerAuthToken(
				ISSUER_DID!,
				ISSUER_API_KEY!,
				environmentConfig.apiUrl
			);

			if (!fetchedIssuerAuthToken) {
				setError(
					'Failed to fetch issuer authentication token. Please check your DID and API Key.'
				);
				setIsLoading(false);
				return;
			}

			const credentialSubject = generateMeetingLinkCredential(
				meetingUrl,
				creatorAddress
			);

			console.log('credentialSubject', credentialSubject);

			// Create the claim request with the fetched token
			const claimRequest: ClaimRequest = {
				process: 'Issue',
				issuerDid: ISSUER_DID!,
				issuerAuth: fetchedIssuerAuthToken,
				credentialId: CREDENTIAL_ID!,
				credentialSubject:
					credentialSubject as unknown as JsonDocumentObject,
			};

			const rp = await airService
				?.goToPartner(environmentConfig.widgetUrl)
				.catch((err) => {
					console.error('Error getting URL with token:', err);
				});

			console.log('urlWithToken', rp, rp?.urlWithToken);

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
				claimRequest,
				PARTNER_ID!,
				{
					endpoint: rp?.urlWithToken,
					airKitBuildEnv: BUILD_ENV_VALUE || BUILD_ENV.STAGING,
					theme: 'light', // currently only have light theme
					locale: LOCALE as Language,
				}
			);

			// Set up event listeners
			widgetRef.current.on('issueCompleted', () => {
				console.log('Credential issuance completed successfully!');
			});

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

	const issueCredential = async (
		meetingUrl: string,
		creatorAddress: string,
		onSuccess?: () => void,
		onError?: (error: string) => void
	) => {
		console.log('🐛 === issueCredential called ===');
		console.log('🐛 Parameters:', { meetingUrl, creatorAddress });
		console.log('🐛 AIR Service status:', {
			isMocaNetwork,
			airService: !!airService,
		});
		console.log('🐛 Required config:', {
			ISSUER_DID: ISSUER_DID ? 'Set' : 'Missing',
			CREDENTIAL_ID: CREDENTIAL_ID ? 'Set' : 'Missing',
			PARTNER_ID: PARTNER_ID ? 'Set' : 'Missing',
		});

		if (!isMocaNetwork || !airService) {
			const error = 'AIR service not available';
			console.error('🐛 ERROR:', error);
			onError?.(error);
			return;
		}

		if (!ISSUER_DID || !CREDENTIAL_ID || !PARTNER_ID || !ISSUER_API_KEY) {
			const error = 'Missing credential configuration';
			console.error('🐛 ERROR:', error);
			onError?.(error);
			return;
		}

		// Check if AIR service is properly initialized (matching working example)
		console.log('🐛 Checking AIR service status...');
		console.log('🐛 AIR Service isLoggedIn:', airService.isLoggedIn);
		console.log('🐛 AIR Service ready for partner operations');

		// Note: In working example, service is initialized at app level, not here
		// We just proceed with the service as-is from the connector

		const setError = (err: string | null) => {
			if (err) onError?.(err);
		};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const setIsLoading = (loading: boolean) => {
			// Loading state managed by the calling component
		};

		try {
			//generate everytime to ensure the partner token passing in correctly
			await generateWidget(
				meetingUrl,
				creatorAddress,
				setError,
				setIsLoading
			);

			// Start the widget
			if (widgetRef.current) {
				widgetRef.current.launch();
				onSuccess?.();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			setIsLoading(false);
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
				.goToPartner(environmentConfig.widgetUrl)
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
					airKitBuildEnv: BUILD_ENV_VALUE || BUILD_ENV.SANDBOX,
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
