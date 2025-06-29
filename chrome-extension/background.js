// Halo Chrome Extension - Background Service Worker
// Handles extension lifecycle, storage, and communication between content scripts and popup

console.log('🛡️ Halo Extension Background Worker Started');

// Extension installation and startup
chrome.runtime.onInstalled.addListener((details) => {
	console.log('Halo Extension Installed:', details.reason);

	// Initialize default settings
	chrome.storage.local.set({
		halo_enabled: true,
		auto_scan: true,
		show_badges: true,
		verification_endpoint: 'https://credential.api.sandbox.air3.com',
		stats: {
			links_scanned: 0,
			links_verified: 0,
			threats_blocked: 0,
		},
	});
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('Background received message:', request.type);

	switch (request.type) {
		case 'VERIFY_LINK':
			handleLinkVerification(request.data, sendResponse);
			return true; // Keep sendResponse alive for async

		case 'GET_SETTINGS':
			getExtensionSettings(sendResponse);
			return true;

		case 'UPDATE_SETTINGS':
			updateExtensionSettings(request.data, sendResponse);
			return true;

		case 'UPDATE_STATS':
			updateStats(request.data, sendResponse);
			return true;

		default:
			console.warn('Unknown message type:', request.type);
			sendResponse({ error: 'Unknown message type' });
	}
});

// Verify meeting link using AIR credentials
async function handleLinkVerification(linkData, sendResponse) {
	try {
		console.log('🔍 Verifying link:', linkData.url);

		// Extract proof from URL (matching frontend logic)
		const proof = extractProofFromUrl(linkData.url);

		if (!proof) {
			sendResponse({
				success: true,
				verified: false,
				trustLevel: 'unverified',
				reason: 'No verification proof found',
			});
			return;
		}

		// Verify the presentation using AIR verification
		const verification = await verifyPresentation(proof);

		// Update statistics
		await updateStats({ links_scanned: 1 });
		if (verification.isValid) {
			await updateStats({ links_verified: 1 });
		}

		sendResponse({
			success: true,
			verified: verification.isValid,
			trustLevel: verification.trustLevel || 'unknown',
			creatorAddress: verification.creatorAddress,
			platform: verification.platform,
			timestamp: verification.timestamp,
			reason: verification.error || 'Verification completed',
		});
	} catch (error) {
		console.error('Link verification error:', error);
		sendResponse({
			success: false,
			error: error.message,
		});
	}
}

// Extract proof from URL (Base64 encoded in query parameter)
function extractProofFromUrl(url) {
	try {
		const urlParams = new URLSearchParams(url.split('?')[1]);
		const encodedProof = urlParams.get('halo_proof');

		if (!encodedProof) {
			return null;
		}

		return atob(encodedProof);
	} catch (error) {
		console.error('Error extracting proof from URL:', error);
		return null;
	}
}

// Verify presentation using AIR verification (simplified for MVP)
async function verifyPresentation(presentation) {
	try {
		const parsedPresentation = JSON.parse(presentation);

		// For MVP, we'll do basic validation
		// In production, this would use full AIR SDK verification
		if (parsedPresentation.credentialSubject) {
			return {
				isValid: true,
				trustLevel:
					parsedPresentation.credentialSubject.trust_level ||
					'verified',
				creatorAddress:
					parsedPresentation.credentialSubject.creator_address,
				platform: parsedPresentation.credentialSubject.platform,
				timestamp:
					parsedPresentation.credentialSubject.created_timestamp,
			};
		}

		return { isValid: false, error: 'Invalid presentation format' };
	} catch (error) {
		return {
			isValid: false,
			error: `Verification failed: ${error.message}`,
		};
	}
}

// Get extension settings
async function getExtensionSettings(sendResponse) {
	try {
		const settings = await chrome.storage.local.get([
			'halo_enabled',
			'auto_scan',
			'show_badges',
			'verification_endpoint',
			'stats',
		]);
		sendResponse({ success: true, settings });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

// Update extension settings
async function updateExtensionSettings(newSettings, sendResponse) {
	try {
		await chrome.storage.local.set(newSettings);
		sendResponse({ success: true });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

// Update statistics
async function updateStats(updates, sendResponse) {
	try {
		const result = await chrome.storage.local.get(['stats']);
		const currentStats = result.stats || {
			links_scanned: 0,
			links_verified: 0,
			threats_blocked: 0,
		};

		// Increment stats
		Object.keys(updates).forEach((key) => {
			if (typeof currentStats[key] === 'number') {
				currentStats[key] += updates[key];
			}
		});

		await chrome.storage.local.set({ stats: currentStats });

		if (sendResponse) {
			sendResponse({ success: true, stats: currentStats });
		}
	} catch (error) {
		console.error('Error updating stats:', error);
		if (sendResponse) {
			sendResponse({ success: false, error: error.message });
		}
	}
}
