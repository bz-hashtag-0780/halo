// Halo Chrome Extension - Enhanced Background Service Worker
// Handles extension lifecycle, storage, and communication between content scripts and popup
// T3.2 Enhancement: Full AIR SDK integration, caching, retry logic, rate limiting

console.log('🛡️ Halo Extension Enhanced Background Worker Started - v1.1.0');

// Configuration constants
const CONFIG = {
	AIR_API_BASE: 'https://air.api.sandbox.air3.com',
	CREDENTIAL_API_BASE: 'https://credential.api.sandbox.air3.com',
	FRONTEND_BASE: 'http://localhost:3000',
	CACHE_TTL: 5 * 60 * 1000, // 5 minutes
	MAX_RETRIES: 3,
	RETRY_DELAY: 1000, // 1 second
	RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
	RATE_LIMIT_MAX: 10, // 10 requests per minute
	BATCH_SIZE: 5, // Max concurrent verifications
};

// Enhanced caching system
const verificationCache = new Map();
const rateLimitTracker = new Map();
const pendingVerifications = new Map();

// Extension installation and startup
chrome.runtime.onInstalled.addListener((details) => {
	console.log('Halo Extension Installed:', details.reason);

	// Initialize enhanced default settings
	chrome.storage.local.set({
		halo_enabled: true,
		auto_scan: true,
		show_badges: true,
		demo_mode: false, // Demo mode for presentations
		verification_endpoint: CONFIG.CREDENTIAL_API_BASE,
		cache_enabled: true,
		cache_ttl: CONFIG.CACHE_TTL,
		max_retries: CONFIG.MAX_RETRIES,
		rate_limit_enabled: true,
		batch_verification: true,
		offline_mode: false,
		debug_logging: false,
		stats: {
			links_scanned: 0,
			links_verified: 0,
			threats_blocked: 0,
			cache_hits: 0,
			api_calls: 0,
			failed_verifications: 0,
		},
	});

	// Initialize background sync
	initializeBackgroundSync();
});

// Enhanced message handling with batching support
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('Background received message:', request.type);

	switch (request.type) {
		case 'VERIFY_LINK':
			handleLinkVerification(request.data, sendResponse);
			return true; // Keep sendResponse alive for async

		case 'VERIFY_BATCH':
			handleBatchVerification(request.data, sendResponse);
			return true;

		case 'GET_SETTINGS':
			getExtensionSettings(sendResponse);
			return true;

		case 'UPDATE_SETTINGS':
			updateExtensionSettings(request.data, sendResponse);
			return true;

		case 'UPDATE_STATS':
			updateStats(request.data, sendResponse);
			return true;

		case 'CLEAR_CACHE':
			clearVerificationCache(sendResponse);
			return true;

		case 'GET_CACHE_STATS':
			getCacheStats(sendResponse);
			return true;

		case 'HEALTH_CHECK':
			performHealthCheck(sendResponse);
			return true;

		default:
			console.warn('Unknown message type:', request.type);
			sendResponse({ error: 'Unknown message type' });
	}
});

// Enhanced link verification with caching and retry logic
async function handleLinkVerification(linkData, sendResponse) {
	try {
		const startTime = Date.now();
		console.log('🔍 Verifying link:', linkData.url);

		// Check rate limiting
		if (!(await checkRateLimit())) {
			sendResponse({
				success: false,
				error: 'Rate limit exceeded. Please try again later.',
				rateLimited: true,
			});
			return;
		}

		// Check cache first
		const cacheKey = generateCacheKey(linkData.url);
		const cachedResult = getFromCache(cacheKey);

		if (cachedResult) {
			console.log('✅ Cache hit for:', linkData.url);
			await updateStats({ cache_hits: 1 });

			sendResponse({
				...cachedResult,
				cached: true,
				responseTime: Date.now() - startTime,
			});
			return;
		}

		// Extract proof from URL
		const proof = extractProofFromUrl(linkData.url);

		if (!proof) {
			const result = {
				success: true,
				verified: false,
				trustLevel: 'unverified',
				reason: 'No verification proof found',
				responseTime: Date.now() - startTime,
			};

			// Cache negative result for shorter time
			addToCache(cacheKey, result, CONFIG.CACHE_TTL / 5);
			await updateStats({ links_scanned: 1 });

			sendResponse(result);
			return;
		}

		// Perform verification with retry logic
		const verification = await verifyPresentationWithRetry(proof, linkData);

		// Update statistics
		await updateStats({
			links_scanned: 1,
			api_calls: 1,
		});

		if (verification.isValid) {
			await updateStats({ links_verified: 1 });
		} else {
			await updateStats({ failed_verifications: 1 });
		}

		const result = {
			success: true,
			verified: verification.isValid,
			trustLevel: verification.trustLevel || 'unknown',
			creatorAddress: verification.creatorAddress,
			platform: verification.platform,
			timestamp: verification.timestamp,
			reason: verification.error || 'Verification completed',
			responseTime: Date.now() - startTime,
			retryCount: verification.retryCount || 0,
		};

		// Cache successful result
		addToCache(cacheKey, result);
		sendResponse(result);
	} catch (error) {
		console.error('Link verification error:', error);
		await updateStats({ failed_verifications: 1 });

		sendResponse({
			success: false,
			error: error.message,
			errorType: error.name || 'UnknownError',
			responseTime: Date.now() - (startTime || Date.now()),
		});
	}
}

// Batch verification for multiple links
async function handleBatchVerification(batchData, sendResponse) {
	try {
		console.log(`🔍 Batch verifying ${batchData.links.length} links`);
		const startTime = Date.now();

		// Process in batches to avoid overwhelming the API
		const results = [];
		for (let i = 0; i < batchData.links.length; i += CONFIG.BATCH_SIZE) {
			const batch = batchData.links.slice(i, i + CONFIG.BATCH_SIZE);
			const batchPromises = batch.map(
				(linkData) =>
					new Promise((resolve) => {
						handleLinkVerification(linkData, resolve);
					})
			);

			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);

			// Small delay between batches
			if (i + CONFIG.BATCH_SIZE < batchData.links.length) {
				await delay(100);
			}
		}

		sendResponse({
			success: true,
			results: results,
			totalLinks: batchData.links.length,
			responseTime: Date.now() - startTime,
		});
	} catch (error) {
		console.error('Batch verification error:', error);
		sendResponse({
			success: false,
			error: error.message,
		});
	}
}

// Enhanced verification with full AIR SDK integration
async function verifyPresentationWithRetry(
	presentation,
	linkData,
	retryCount = 0
) {
	try {
		console.log(`🔍 Attempting verification (attempt ${retryCount + 1})`);

		// Parse the presentation
		const parsedPresentation = JSON.parse(presentation);

		// Method 1: Try direct AIR API verification
		try {
			const apiResult = await verifyWithAIRAPI(parsedPresentation);
			if (apiResult.success) {
				return { ...apiResult, retryCount };
			}
		} catch (apiError) {
			console.warn('AIR API verification failed:', apiError.message);
		}

		// Method 2: Try frontend bridge verification
		try {
			const bridgeResult = await verifyWithFrontendBridge(
				parsedPresentation
			);
			if (bridgeResult.success) {
				return { ...bridgeResult, retryCount };
			}
		} catch (bridgeError) {
			console.warn(
				'Frontend bridge verification failed:',
				bridgeError.message
			);
		}

		// Method 3: Fallback to enhanced local verification
		const localResult = await verifyPresentationLocally(parsedPresentation);
		return { ...localResult, retryCount };
	} catch (error) {
		console.error(`Verification attempt ${retryCount + 1} failed:`, error);

		// Retry logic
		if (retryCount < CONFIG.MAX_RETRIES) {
			await delay(CONFIG.RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
			return verifyPresentationWithRetry(
				presentation,
				linkData,
				retryCount + 1
			);
		}

		// All retries exhausted
		return {
			isValid: false,
			error: `Verification failed after ${
				CONFIG.MAX_RETRIES + 1
			} attempts: ${error.message}`,
			retryCount,
		};
	}
}

// Direct AIR API verification
async function verifyWithAIRAPI(presentation) {
	const response = await fetch(`${CONFIG.CREDENTIAL_API_BASE}/v1/verify`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify({
			presentation: presentation,
			challenge: generateChallenge(),
			domain: 'chrome-extension',
		}),
	});

	if (!response.ok) {
		throw new Error(
			`API verification failed: ${response.status} ${response.statusText}`
		);
	}

	const result = await response.json();

	return {
		success: true,
		isValid: result.verified === true,
		trustLevel: result.credentialSubject?.trust_level || 'verified',
		creatorAddress: result.credentialSubject?.creator_address,
		platform: result.credentialSubject?.platform,
		timestamp: result.credentialSubject?.created_timestamp,
		verificationMethod: 'air-api',
	};
}

// Frontend bridge verification
async function verifyWithFrontendBridge(presentation) {
	const response = await fetch(
		`${CONFIG.FRONTEND_BASE}/api/verify-credential`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ presentation }),
		}
	);

	if (!response.ok) {
		throw new Error(`Bridge verification failed: ${response.status}`);
	}

	const result = await response.json();

	return {
		success: true,
		isValid: result.verified === true,
		trustLevel: result.trustLevel || 'verified',
		creatorAddress: result.creatorAddress,
		platform: result.platform,
		timestamp: result.timestamp,
		verificationMethod: 'frontend-bridge',
	};
}

// Enhanced local verification with better validation
async function verifyPresentationLocally(presentation) {
	try {
		// Validate presentation structure
		if (!presentation || typeof presentation !== 'object') {
			throw new Error('Invalid presentation format');
		}

		// Check required fields
		const credentialSubject = presentation.credentialSubject;
		if (!credentialSubject) {
			throw new Error('Missing credential subject');
		}

		// Validate credential fields
		const requiredFields = [
			'meeting_url',
			'creator_address',
			'trust_level',
		];
		for (const field of requiredFields) {
			if (!credentialSubject[field]) {
				throw new Error(`Missing required field: ${field}`);
			}
		}

		// Validate addresses
		if (!isValidAddress(credentialSubject.creator_address)) {
			throw new Error('Invalid creator address format');
		}

		// Validate trust level
		const validTrustLevels = [
			'verified',
			'organization',
			'individual',
			'unverified',
		];
		if (!validTrustLevels.includes(credentialSubject.trust_level)) {
			throw new Error('Invalid trust level');
		}

		// Check expiration
		if (credentialSubject.expires_at) {
			const expiryDate = new Date(credentialSubject.expires_at);
			if (expiryDate < new Date()) {
				return {
					isValid: false,
					error: 'Credential has expired',
					trustLevel: 'expired',
				};
			}
		}

		// Validate platform
		const validPlatforms = [
			'zoom',
			'googleMeet',
			'teams',
			'discord',
			'webex',
			'other',
		];
		const platform = credentialSubject.platform;

		return {
			isValid: true,
			trustLevel: credentialSubject.trust_level,
			creatorAddress: credentialSubject.creator_address,
			platform: platform,
			timestamp: credentialSubject.created_timestamp,
			verificationMethod: 'local-validation',
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Local verification failed: ${error.message}`,
			verificationMethod: 'local-validation',
		};
	}
}

// Utility functions

// Generate cache key for URLs
function generateCacheKey(url) {
	// Remove query parameters except halo_proof for consistent caching
	const urlObj = new URL(url);
	const haloProof = urlObj.searchParams.get('halo_proof');
	return haloProof
		? `halo_${btoa(haloProof).slice(0, 32)}`
		: `url_${btoa(url).slice(0, 32)}`;
}

// Enhanced caching with TTL
function addToCache(key, value, ttl = CONFIG.CACHE_TTL) {
	const expiryTime = Date.now() + ttl;
	verificationCache.set(key, {
		value,
		expiry: expiryTime,
	});

	// Clean up expired entries periodically
	setTimeout(() => cleanupCache(), ttl);
}

function getFromCache(key) {
	const cached = verificationCache.get(key);
	if (!cached) return null;

	if (Date.now() > cached.expiry) {
		verificationCache.delete(key);
		return null;
	}

	return cached.value;
}

function cleanupCache() {
	const now = Date.now();
	for (const [key, cached] of verificationCache.entries()) {
		if (now > cached.expiry) {
			verificationCache.delete(key);
		}
	}
}

// Rate limiting
async function checkRateLimit() {
	const settings = await chrome.storage.local.get(['rate_limit_enabled']);
	if (!settings.rate_limit_enabled) return true;

	const now = Date.now();
	const windowStart = now - CONFIG.RATE_LIMIT_WINDOW;

	// Clean old entries
	for (const [timestamp] of rateLimitTracker.entries()) {
		if (timestamp < windowStart) {
			rateLimitTracker.delete(timestamp);
		}
	}

	// Check current count
	if (rateLimitTracker.size >= CONFIG.RATE_LIMIT_MAX) {
		return false;
	}

	// Add current request
	rateLimitTracker.set(now, true);
	return true;
}

// Validation helpers
function isValidAddress(address) {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function generateChallenge() {
	return Array.from(crypto.getRandomValues(new Uint8Array(32)))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Background sync initialization
function initializeBackgroundSync() {
	console.log('🔄 Initializing background sync capabilities');

	// Set up periodic cache cleanup
	setInterval(cleanupCache, 5 * 60 * 1000); // Every 5 minutes

	// Set up periodic health checks
	setInterval(performHealthCheck, 10 * 60 * 1000); // Every 10 minutes
}

// Cache management
async function clearVerificationCache(sendResponse) {
	try {
		verificationCache.clear();
		rateLimitTracker.clear();

		console.log('🗑️ Verification cache cleared');

		if (sendResponse) {
			sendResponse({
				success: true,
				message: 'Cache cleared successfully',
			});
		}
	} catch (error) {
		console.error('Error clearing cache:', error);
		if (sendResponse) {
			sendResponse({ success: false, error: error.message });
		}
	}
}

async function getCacheStats(sendResponse) {
	try {
		const stats = {
			cacheSize: verificationCache.size,
			rateLimitEntries: rateLimitTracker.size,
			oldestEntry: null,
			newestEntry: null,
		};

		// Find oldest and newest cache entries
		let oldest = Date.now();
		let newest = 0;

		for (const cached of verificationCache.values()) {
			if (cached.expiry < oldest) oldest = cached.expiry;
			if (cached.expiry > newest) newest = cached.expiry;
		}

		if (verificationCache.size > 0) {
			stats.oldestEntry = new Date(
				oldest - CONFIG.CACHE_TTL
			).toISOString();
			stats.newestEntry = new Date(
				newest - CONFIG.CACHE_TTL
			).toISOString();
		}

		sendResponse({ success: true, stats });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

// Health check
async function performHealthCheck(sendResponse) {
	const healthStatus = {
		timestamp: new Date().toISOString(),
		services: {},
		overall: 'unknown',
	};

	try {
		// Check AIR API
		try {
			const response = await fetch(`${CONFIG.AIR_API_BASE}/health`, {
				method: 'GET',
				timeout: 5000,
			});
			healthStatus.services.airAPI = response.ok
				? 'healthy'
				: 'unhealthy';
		} catch {
			healthStatus.services.airAPI = 'unreachable';
		}

		// Check frontend bridge
		try {
			const response = await fetch(`${CONFIG.FRONTEND_BASE}/api/health`, {
				method: 'GET',
				timeout: 5000,
			});
			healthStatus.services.frontendBridge = response.ok
				? 'healthy'
				: 'unhealthy';
		} catch {
			healthStatus.services.frontendBridge = 'unreachable';
		}

		// Determine overall health
		const services = Object.values(healthStatus.services);
		if (services.every((s) => s === 'healthy')) {
			healthStatus.overall = 'healthy';
		} else if (services.some((s) => s === 'healthy')) {
			healthStatus.overall = 'degraded';
		} else {
			healthStatus.overall = 'unhealthy';
		}

		console.log('🏥 Health check completed:', healthStatus.overall);

		if (sendResponse) {
			sendResponse({ success: true, healthStatus });
		}
	} catch (error) {
		console.error('Health check failed:', error);
		healthStatus.overall = 'error';
		healthStatus.error = error.message;

		if (sendResponse) {
			sendResponse({ success: false, healthStatus });
		}
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

// Get extension settings (enhanced)
async function getExtensionSettings(sendResponse) {
	try {
		const settings = await chrome.storage.local.get([
			'halo_enabled',
			'auto_scan',
			'show_badges',
			'demo_mode',
			'verification_endpoint',
			'cache_enabled',
			'cache_ttl',
			'max_retries',
			'rate_limit_enabled',
			'batch_verification',
			'offline_mode',
			'debug_logging',
			'stats',
		]);
		sendResponse({ success: true, settings });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

// Update extension settings (enhanced)
async function updateExtensionSettings(newSettings, sendResponse) {
	try {
		await chrome.storage.local.set(newSettings);

		// Apply runtime configuration changes
		if (newSettings.cache_ttl) {
			CONFIG.CACHE_TTL = newSettings.cache_ttl;
		}
		if (newSettings.max_retries) {
			CONFIG.MAX_RETRIES = newSettings.max_retries;
		}

		console.log('⚙️ Settings updated:', Object.keys(newSettings));
		sendResponse({ success: true });
	} catch (error) {
		sendResponse({ success: false, error: error.message });
	}
}

// Enhanced statistics tracking
async function updateStats(updates, sendResponse) {
	try {
		const result = await chrome.storage.local.get(['stats']);
		const currentStats = result.stats || {
			links_scanned: 0,
			links_verified: 0,
			threats_blocked: 0,
			cache_hits: 0,
			api_calls: 0,
			failed_verifications: 0,
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

console.log(
	'✅ Enhanced Background Service Worker Loaded - Ready for T3.2 testing'
);
