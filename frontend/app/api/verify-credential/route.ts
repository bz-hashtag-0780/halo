import { NextRequest, NextResponse } from 'next/server';
import { verifyPresentation } from '../../../lib/credentialsUtils';

export async function POST(request: NextRequest) {
	try {
		const { presentation } = await request.json();

		if (!presentation) {
			return NextResponse.json(
				{ error: 'Missing presentation data' },
				{ status: 400 }
			);
		}

		// Use the frontend verification logic
		const verificationResult = await verifyPresentation(
			typeof presentation === 'string'
				? presentation
				: JSON.stringify(presentation)
		);

		// Return in format expected by Chrome extension
		return NextResponse.json({
			verified: verificationResult.isValid,
			trustLevel: verificationResult.trustLevel,
			creatorAddress: verificationResult.creatorAddress,
			platform: verificationResult.platform,
			timestamp: verificationResult.timestamp,
			error: verificationResult.error,
		});
	} catch (error) {
		console.error('API verification error:', error);
		return NextResponse.json(
			{
				verified: false,
				error:
					error instanceof Error
						? error.message
						: 'Verification failed',
			},
			{ status: 500 }
		);
	}
}

// Health check endpoint
export async function GET() {
	return NextResponse.json({
		status: 'healthy',
		service: 'halo-verification-api',
		timestamp: new Date().toISOString(),
	});
}
