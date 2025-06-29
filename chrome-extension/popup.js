// Halo Chrome Extension - Enhanced Popup JavaScript
// T3.2 Enhancement: Support for caching, health checks, batch verification, advanced settings
// Handles popup UI interactions and communication with enhanced background script

document.addEventListener('DOMContentLoaded', initializePopup);

let currentTab = null;
let healthCheckInterval = null;

async function initializePopup() {
	console.log('🛡️ Initializing Enhanced Halo popup v1.1.0...');

	// Get current tab
	await getCurrentTab();

	// Load settings and stats
	await loadSettings();
	await loadStats();
	await loadCacheStats();

	// Set up event listeners
	setupEventListeners();

	// Update status
	updateExtensionStatus();

	// Start health monitoring
	startHealthMonitoring();

	console.log('✅ Enhanced popup initialized');
}

// Get current active tab
async function getCurrentTab() {
	try {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		currentTab = tab;

		const urlElement = document.getElementById('currentTabUrl');
		if (currentTab && currentTab.url) {
			urlElement.textContent = new URL(currentTab.url).hostname;

			// Add tab security indicator
			updateTabSecurityIndicator(currentTab.url);
		} else {
			urlElement.textContent = 'Unknown';
		}
	} catch (error) {
		console.error('Error getting current tab:', error);
		document.getElementById('currentTabUrl').textContent = 'Error';
	}
}

// Update tab security indicator
function updateTabSecurityIndicator(url) {
	const urlElement = document.getElementById('currentTabUrl');

	if (url.startsWith('https://')) {
		urlElement.style.color = '#10b981'; // Green for HTTPS
		urlElement.title = 'Secure connection (HTTPS)';
	} else if (
		url.startsWith('http://localhost') ||
		url.startsWith('http://127.0.0.1')
	) {
		urlElement.style.color = '#f59e0b'; // Yellow for localhost
		urlElement.title = 'Local development server';
	} else if (url.startsWith('http://')) {
		urlElement.style.color = '#ef4444'; // Red for HTTP
		urlElement.title = 'Insecure connection (HTTP)';
	} else {
		urlElement.style.color = '#64748b'; // Default gray
		urlElement.title = 'Unknown protocol';
	}
}

// Load extension settings
async function loadSettings() {
	try {
		const response = await sendMessageToBackground('GET_SETTINGS');

		if (response.success) {
			const settings = response.settings;

			// Update toggle states
			document.getElementById('enableToggle').checked =
				settings.halo_enabled || false;
			document.getElementById('autoScanToggle').checked =
				settings.auto_scan || false;
			document.getElementById('showBadgesToggle').checked =
				settings.show_badges || false;

			// Update advanced settings if they exist
			if (settings.cache_enabled !== undefined) {
				const cacheToggle = document.getElementById('cacheToggle');
				if (cacheToggle) cacheToggle.checked = settings.cache_enabled;
			}

			if (settings.rate_limit_enabled !== undefined) {
				const rateLimitToggle =
					document.getElementById('rateLimitToggle');
				if (rateLimitToggle)
					rateLimitToggle.checked = settings.rate_limit_enabled;
			}

			if (settings.debug_logging !== undefined) {
				const debugToggle = document.getElementById('debugToggle');
				if (debugToggle) debugToggle.checked = settings.debug_logging;
			}
		}
	} catch (error) {
		console.error('Error loading settings:', error);
	}
}

// Load extension statistics
async function loadStats() {
	try {
		const response = await sendMessageToBackground('GET_SETTINGS');

		if (response.success && response.settings.stats) {
			const stats = response.settings.stats;

			document.getElementById('linksScanned').textContent =
				stats.links_scanned || 0;
			document.getElementById('linksVerified').textContent =
				stats.links_verified || 0;
			document.getElementById('threatsBlocked').textContent =
				stats.threats_blocked || 0;

			// Enhanced stats (T3.2)
			const cacheHitsElement = document.getElementById('cacheHits');
			if (cacheHitsElement)
				cacheHitsElement.textContent = stats.cache_hits || 0;

			const apiCallsElement = document.getElementById('apiCalls');
			if (apiCallsElement)
				apiCallsElement.textContent = stats.api_calls || 0;

			const failedVerificationsElement = document.getElementById(
				'failedVerifications'
			);
			if (failedVerificationsElement)
				failedVerificationsElement.textContent =
					stats.failed_verifications || 0;

			// Calculate success rate
			const totalVerifications = stats.api_calls || 0;
			const successRate =
				totalVerifications > 0
					? Math.round(
							((stats.links_verified || 0) / totalVerifications) *
								100
					  )
					: 0;

			const successRateElement = document.getElementById('successRate');
			if (successRateElement) {
				successRateElement.textContent = `${successRate}%`;

				// Color code success rate
				if (successRate >= 90) {
					successRateElement.style.color = '#10b981'; // Green
				} else if (successRate >= 70) {
					successRateElement.style.color = '#f59e0b'; // Yellow
				} else {
					successRateElement.style.color = '#ef4444'; // Red
				}
			}
		}
	} catch (error) {
		console.error('Error loading stats:', error);
		// Set default values
		document.getElementById('linksScanned').textContent = '-';
		document.getElementById('linksVerified').textContent = '-';
		document.getElementById('threatsBlocked').textContent = '-';
	}
}

// Load cache statistics
async function loadCacheStats() {
	try {
		const response = await sendMessageToBackground('GET_CACHE_STATS');

		if (response.success) {
			const stats = response.stats;

			const cacheStatsElement = document.getElementById('cacheStats');
			if (cacheStatsElement) {
				cacheStatsElement.innerHTML = `
					<div class="cache-stat">
						<span class="cache-label">Cache Size:</span>
						<span class="cache-value">${stats.cacheSize}</span>
					</div>
					<div class="cache-stat">
						<span class="cache-label">Rate Limit:</span>
						<span class="cache-value">${stats.rateLimitEntries}/10</span>
					</div>
				`;
			}
		}
	} catch (error) {
		console.error('Error loading cache stats:', error);
	}
}

// Start health monitoring
function startHealthMonitoring() {
	// Initial health check
	performHealthCheck();

	// Periodic health checks every 30 seconds
	healthCheckInterval = setInterval(performHealthCheck, 30000);
}

// Perform health check
async function performHealthCheck() {
	try {
		const response = await sendMessageToBackground('HEALTH_CHECK');

		if (response.success) {
			updateHealthStatus(response.healthStatus);
		}
	} catch (error) {
		console.error('Health check failed:', error);
		updateHealthStatus({ overall: 'error', error: error.message });
	}
}

// Update health status display
function updateHealthStatus(healthStatus) {
	const healthIndicator = document.getElementById('healthIndicator');
	const healthDetails = document.getElementById('healthDetails');

	if (!healthIndicator) return;

	// Update health indicator
	switch (healthStatus.overall) {
		case 'healthy':
			healthIndicator.innerHTML = '🟢 Healthy';
			healthIndicator.className = 'health-indicator healthy';
			break;
		case 'degraded':
			healthIndicator.innerHTML = '🟡 Degraded';
			healthIndicator.className = 'health-indicator degraded';
			break;
		case 'unhealthy':
			healthIndicator.innerHTML = '🔴 Unhealthy';
			healthIndicator.className = 'health-indicator unhealthy';
			break;
		case 'error':
			healthIndicator.innerHTML = '❌ Error';
			healthIndicator.className = 'health-indicator error';
			break;
		default:
			healthIndicator.innerHTML = '⚪ Unknown';
			healthIndicator.className = 'health-indicator unknown';
	}

	// Update health details if element exists
	if (healthDetails && healthStatus.services) {
		const servicesHtml = Object.entries(healthStatus.services)
			.map(([service, status]) => {
				const icon =
					status === 'healthy'
						? '✅'
						: status === 'unhealthy'
						? '⚠️'
						: '❌';
				return `<div class="service-status">${icon} ${service}: ${status}</div>`;
			})
			.join('');

		healthDetails.innerHTML = servicesHtml;
	}
}

// Update extension status display
function updateExtensionStatus() {
	const statusIcon = document.getElementById('extensionStatus');
	const statusText = document.getElementById('extensionStatusText');
	const enableToggle = document.getElementById('enableToggle');

	if (enableToggle.checked) {
		statusIcon.textContent = '🟢';
		statusIcon.className = 'status-icon status-active';
		statusText.textContent = 'Active';
		statusText.className = 'status-value status-active';
	} else {
		statusIcon.textContent = '🔴';
		statusIcon.className = 'status-icon status-inactive';
		statusText.textContent = 'Inactive';
		statusText.className = 'status-value status-inactive';
	}
}

// Set up event listeners
function setupEventListeners() {
	// Enable/disable toggle
	document
		.getElementById('enableToggle')
		.addEventListener('change', async (e) => {
			const enabled = e.target.checked;
			await updateSetting('halo_enabled', enabled);
			updateExtensionStatus();
		});

	// Auto-scan toggle
	document
		.getElementById('autoScanToggle')
		.addEventListener('change', async (e) => {
			await updateSetting('auto_scan', e.target.checked);
		});

	// Show badges toggle
	document
		.getElementById('showBadgesToggle')
		.addEventListener('change', async (e) => {
			await updateSetting('show_badges', e.target.checked);
		});

	// Scan button
	document
		.getElementById('scanButton')
		.addEventListener('click', scanCurrentTab);

	// Action buttons
	document
		.getElementById('generateButton')
		.addEventListener('click', openGeneratePage);
	document
		.getElementById('verifyButton')
		.addEventListener('click', openVerifyPage);

	// Footer links
	document.getElementById('helpLink').addEventListener('click', () => {
		chrome.tabs.create({
			url: 'https://github.com/your-org/halo-extension/wiki',
		});
	});

	document.getElementById('settingsLink').addEventListener('click', () => {
		chrome.runtime.openOptionsPage();
	});

	document
		.getElementById('aboutLink')
		.addEventListener('click', showAboutModal);

	// Cleanup on popup close
	window.addEventListener('beforeunload', () => {
		if (healthCheckInterval) {
			clearInterval(healthCheckInterval);
		}
	});
}

// Update a single setting
async function updateSetting(key, value) {
	try {
		const settings = {};
		settings[key] = value;

		await sendMessageToBackground('UPDATE_SETTINGS', settings);
		console.log(`Updated setting: ${key} = ${value}`);
	} catch (error) {
		console.error('Error updating setting:', error);
	}
}

// Scan current tab for meeting links
async function scanCurrentTab() {
	const scanButton = document.getElementById('scanButton');
	const scanResults = document.getElementById('scanResults');
	const resultsContent = document.getElementById('resultsContent');

	if (!currentTab) {
		resultsContent.textContent = 'No active tab found';
		scanResults.style.display = 'block';
		return;
	}

	// Update button state
	scanButton.disabled = true;
	scanButton.innerHTML = '<span class="button-icon">⏳</span>Scanning...';

	try {
		// Inject content script and scan
		await chrome.scripting.executeScript({
			target: { tabId: currentTab.id },
			function: triggerScan,
		});

		// Wait a moment for scan to complete
		setTimeout(() => {
			resultsContent.textContent =
				'Scan completed. Check badges on the page.';
			scanResults.style.display = 'block';

			// Reset button
			scanButton.disabled = false;
			scanButton.innerHTML =
				'<span class="button-icon">🔍</span>Scan for Links';
		}, 2000);
	} catch (error) {
		console.error('Error scanning tab:', error);
		resultsContent.textContent = `Scan failed: ${error.message}`;
		scanResults.style.display = 'block';

		// Reset button
		scanButton.disabled = false;
		scanButton.innerHTML =
			'<span class="button-icon">🔍</span>Scan for Links';
	}
}

// Function to inject into content script
function triggerScan() {
	// This function runs in the context of the web page
	if (typeof window.scanForMeetingLinks === 'function') {
		window.scanForMeetingLinks();
	} else {
		console.log('Halo content script not available on this page');
	}
}

// Open generate page
function openGeneratePage() {
	chrome.tabs.create({ url: 'http://localhost:3000/generate' });
	window.close();
}

// Open verify page
function openVerifyPage() {
	chrome.tabs.create({ url: 'http://localhost:3000/verify' });
	window.close();
}

// Show about modal
function showAboutModal() {
	const modal = document.createElement('div');
	modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

	modal.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 8px;
      max-width: 320px;
      text-align: center;
    ">
      <h3 style="margin: 0 0 16px 0; color: #1e293b;">🛡️ Halo v1.1.0</h3>
      <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
        Enhanced meeting link verification with caching, rate limiting, and advanced analytics.
      </p>
      <p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px;">
        <strong>New in v1.1.0:</strong><br>
        • Intelligent caching system<br>
        • Rate limiting protection<br>
        • Batch verification<br>
        • Health monitoring<br>
        • Enhanced statistics
      </p>
      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px;">
        Powered by AIR Credentials & Moca Testnet
      </p>
      <button id="closeAbout" style="
        background: #3b82f6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Close</button>
    </div>
  `;

	document.body.appendChild(modal);

	// Close modal
	const closeModal = () => document.body.removeChild(modal);
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});
	document.getElementById('closeAbout').addEventListener('click', closeModal);
}

// Send message to background script
function sendMessageToBackground(type, data = null) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{
				type: type,
				data: data,
			},
			(response) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(response);
				}
			}
		);
	});
}

// Enhanced auto-refresh with health monitoring
setInterval(async () => {
	await loadStats();
	await loadCacheStats();
}, 10000); // Every 10 seconds

console.log('✅ Enhanced Popup JavaScript Loaded - T3.2 Ready');
