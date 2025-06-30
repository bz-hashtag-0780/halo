// Halo Chrome Extension - Enhanced Popup JavaScript
// T3.2 Enhancement: Support for caching, health checks, batch verification, advanced settings
// Handles popup UI interactions and communication with enhanced background script

document.addEventListener('DOMContentLoaded', initializePopup);

let currentTab = null;
let healthCheckInterval = null;
let activeTabPanel = 'dashboard';

async function initializePopup() {
	console.log(
		'🛡️ Initializing Enhanced Halo popup v1.1.0 with T3.3 features...'
	);

	// Initialize tab system
	initializeTabs();

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

	console.log('✅ Enhanced popup with T3.3 tabbed interface initialized');
}

// Initialize tab system
function initializeTabs() {
	const tabButtons = document.querySelectorAll('.tab-button');
	const tabPanels = document.querySelectorAll('.tab-panel');

	// Set up tab click handlers
	tabButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const targetTab = button.getAttribute('data-tab');
			switchToTab(targetTab);
		});
	});

	// Initialize with dashboard tab
	switchToTab('dashboard');
}

// Switch to specified tab
function switchToTab(tabName) {
	const tabButtons = document.querySelectorAll('.tab-button');
	const tabPanels = document.querySelectorAll('.tab-panel');

	// Update button states
	tabButtons.forEach((button) => {
		button.classList.remove('active');
		if (button.getAttribute('data-tab') === tabName) {
			button.classList.add('active');
		}
	});

	// Update panel visibility
	tabPanels.forEach((panel) => {
		panel.classList.remove('active');
		if (panel.id === tabName) {
			panel.classList.add('active');
		}
	});

	activeTabPanel = tabName;
	console.log(`📱 Switched to ${tabName} tab`);

	// Load tab-specific data
	if (tabName === 'dashboard') {
		refreshDashboardData();
	} else if (tabName === 'settings') {
		refreshSettingsData();
	} else if (tabName === 'advanced') {
		refreshAdvancedData();
	}
}

// Refresh dashboard data
async function refreshDashboardData() {
	await loadStats();
	await loadCacheStats();
	await performHealthCheck();
}

// Refresh settings data
async function refreshSettingsData() {
	await loadSettings();
	await loadCacheStats();
}

// Refresh advanced data
async function refreshAdvancedData() {
	await loadCacheStats();
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

			// Update demo mode toggle
			const demoModeToggle = document.getElementById('demoModeToggle');
			if (demoModeToggle) {
				demoModeToggle.checked = settings.demo_mode || false;
			}

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
	// Update main health indicator in header
	const healthIndicator = document.getElementById('healthIndicator');
	if (healthIndicator) {
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
	}

	// Update detailed health indicator in dashboard
	const healthIndicatorDetailed = document.getElementById(
		'healthIndicatorDetailed'
	);
	if (healthIndicatorDetailed) {
		healthIndicatorDetailed.innerHTML = healthIndicator
			? healthIndicator.innerHTML
			: '⚪ Unknown';
		healthIndicatorDetailed.className = healthIndicator
			? healthIndicator.className
			: 'health-indicator unknown';
	}

	// Update health details if element exists
	const healthDetails = document.getElementById('healthDetails');
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

		healthDetails.innerHTML = `<div class="health-services">${servicesHtml}</div>`;
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
	// Basic toggles
	document
		.getElementById('enableToggle')
		.addEventListener('change', async (e) => {
			const enabled = e.target.checked;
			await updateSetting('halo_enabled', enabled);
			updateExtensionStatus();
		});

	document
		.getElementById('autoScanToggle')
		.addEventListener('change', async (e) => {
			await updateSetting('auto_scan', e.target.checked);
		});

	document
		.getElementById('showBadgesToggle')
		.addEventListener('change', async (e) => {
			await updateSetting('show_badges', e.target.checked);
		});

	// Demo Mode toggle - for presentation demos
	const demoModeToggle = document.getElementById('demoModeToggle');
	if (demoModeToggle) {
		demoModeToggle.addEventListener('change', async (e) => {
			await updateSetting('demo_mode', e.target.checked);
			showNotification(
				e.target.checked
					? '🎬 Demo Mode Enabled - Meeting links will show verification badges for presentation'
					: '🎬 Demo Mode Disabled - Normal verification mode',
				'info'
			);
		});
	}

	// Advanced toggles (T3.2)
	const cacheToggle = document.getElementById('cacheToggle');
	if (cacheToggle) {
		cacheToggle.addEventListener('change', async (e) => {
			await updateSetting('cache_enabled', e.target.checked);
		});
	}

	const rateLimitToggle = document.getElementById('rateLimitToggle');
	if (rateLimitToggle) {
		rateLimitToggle.addEventListener('change', async (e) => {
			await updateSetting('rate_limit_enabled', e.target.checked);
		});
	}

	const debugToggle = document.getElementById('debugToggle');
	if (debugToggle) {
		debugToggle.addEventListener('change', async (e) => {
			await updateSetting('debug_logging', e.target.checked);
		});
	}

	// Action buttons
	document
		.getElementById('scanButton')
		.addEventListener('click', scanCurrentTab);
	document
		.getElementById('generateButton')
		.addEventListener('click', openGeneratePage);
	document
		.getElementById('verifyButton')
		.addEventListener('click', openVerifyPage);

	// Enhanced action buttons (T3.2 & T3.3)
	const clearCacheButton = document.getElementById('clearCacheButton');
	if (clearCacheButton) {
		clearCacheButton.addEventListener('click', clearCache);
	}

	const batchScanButton = document.getElementById('batchScanButton');
	if (batchScanButton) {
		batchScanButton.addEventListener('click', performBatchScan);
	}

	const exportStatsButton = document.getElementById('exportStatsButton');
	if (exportStatsButton) {
		exportStatsButton.addEventListener('click', exportStatistics);
	}

	// T3.3 New buttons
	const batchVerifyButton = document.getElementById('batchVerifyButton');
	if (batchVerifyButton) {
		batchVerifyButton.addEventListener('click', performBatchScan); // Same functionality as batch scan
	}

	const exportDataButton = document.getElementById('exportDataButton');
	if (exportDataButton) {
		exportDataButton.addEventListener('click', exportStatistics); // Same functionality as export stats
	}

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

	const keyboardShortcuts = document.getElementById('keyboardShortcuts');
	if (keyboardShortcuts) {
		keyboardShortcuts.addEventListener('click', showKeyboardShortcuts);
	}

	// Cleanup on popup close
	window.addEventListener('beforeunload', () => {
		if (healthCheckInterval) {
			clearInterval(healthCheckInterval);
		}
	});
}

// Show keyboard shortcuts modal
function showKeyboardShortcuts() {
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
			text-align: left;
		">
			<h3 style="margin: 0 0 16px 0; color: #1e293b; text-align: center;">⌨️ Keyboard Shortcuts</h3>
			<div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
				<div style="display: flex; justify-content: space-between; padding: 4px 0;">
					<span style="color: #64748b;">Scan current page:</span>
					<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px;">Ctrl+Shift+H</code>
				</div>
				<div style="display: flex; justify-content: space-between; padding: 4px 0;">
					<span style="color: #64748b;">Toggle extension:</span>
					<code style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px;">Ctrl+Shift+T</code>
				</div>
				<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">
					On Mac, use Cmd instead of Ctrl
				</div>
			</div>
			<button id="closeShortcuts" style="
				background: #3b82f6;
				color: white;
				border: none;
				padding: 8px 16px;
				border-radius: 4px;
				cursor: pointer;
				width: 100%;
				margin-top: 16px;
			">Close</button>
		</div>
	`;

	document.body.appendChild(modal);

	// Close modal
	const closeModal = () => document.body.removeChild(modal);
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});
	document
		.getElementById('closeShortcuts')
		.addEventListener('click', closeModal);
}

// Clear verification cache
async function clearCache() {
	try {
		const response = await sendMessageToBackground('CLEAR_CACHE');

		if (response.success) {
			console.log('✅ Cache cleared successfully');

			// Refresh cache stats
			await loadCacheStats();

			// Show feedback
			showNotification('Cache cleared successfully', 'success');
		} else {
			throw new Error(response.error || 'Cache clear failed');
		}
	} catch (error) {
		console.error('Error clearing cache:', error);
		showNotification('Failed to clear cache', 'error');
	}
}

// Perform batch scan on current page
async function performBatchScan() {
	const batchScanButton = document.getElementById('batchScanButton');
	const batchVerifyButton = document.getElementById('batchVerifyButton');
	const scanResults = document.getElementById('scanResults');
	const resultsContent = document.getElementById('resultsContent');

	if (!currentTab) {
		showNotification('No active tab found', 'error');
		return;
	}

	try {
		// Update button states
		if (batchScanButton) {
			batchScanButton.disabled = true;
			batchScanButton.innerHTML =
				'<span class="button-icon">⏳</span>Batch Scanning...';
		}
		if (batchVerifyButton) {
			batchVerifyButton.disabled = true;
			batchVerifyButton.innerHTML =
				'<span class="button-icon">⏳</span>Processing...';
		}

		// Extract all links from current page
		const links = await extractLinksFromCurrentPage();

		if (links.length === 0) {
			resultsContent.textContent = 'No meeting links found on this page';
			scanResults.style.display = 'block';
			return;
		}

		// Perform batch verification
		const response = await sendMessageToBackground('VERIFY_BATCH', {
			links,
		});

		if (response.success) {
			const { results, totalLinks, responseTime } = response;

			// Display results
			const verifiedCount = results.filter((r) => r.verified).length;
			const unverifiedCount = results.filter((r) => !r.verified).length;

			resultsContent.innerHTML = `
				<div class="batch-results">
					<div class="batch-summary">
						<strong>Batch Scan Complete</strong> (${responseTime}ms)
					</div>
					<div class="batch-stats">
						<div class="batch-stat verified">✅ Verified: ${verifiedCount}</div>
						<div class="batch-stat unverified">⚠️ Unverified: ${unverifiedCount}</div>
						<div class="batch-stat total">📊 Total: ${totalLinks}</div>
					</div>
				</div>
			`;

			scanResults.style.display = 'block';

			// Refresh stats
			await loadStats();
		} else {
			throw new Error(response.error || 'Batch scan failed');
		}
	} catch (error) {
		console.error('Batch scan error:', error);
		resultsContent.textContent = `Batch scan failed: ${error.message}`;
		scanResults.style.display = 'block';
	} finally {
		// Reset buttons
		if (batchScanButton) {
			batchScanButton.disabled = false;
			batchScanButton.innerHTML =
				'<span class="button-icon">📊</span>Batch Scan';
		}
		if (batchVerifyButton) {
			batchVerifyButton.disabled = false;
			batchVerifyButton.innerHTML =
				'<span class="button-icon">⚡</span>Batch Verify Page';
		}
	}
}

// Extract links from current page (simplified)
async function extractLinksFromCurrentPage() {
	try {
		const results = await chrome.scripting.executeScript({
			target: { tabId: currentTab.id },
			function: () => {
				// This function runs in the context of the web page
				const meetingPatterns = [
					/https?:\/\/([\w\-]+\.)?zoom\.us\/[jw]\/\d+/gi,
					/https?:\/\/meet\.google\.com\/[a-z\-]+/gi,
					/https?:\/\/teams\.microsoft\.com\/l\/meetup-join\//gi,
					/https?:\/\/discord\.gg\/[a-zA-Z0-9]+/gi,
					/https?:\/\/([\w\-]+\.)?webex\.com\/meet\//gi,
				];

				const links = [];
				const pageText = document.body.textContent || '';

				meetingPatterns.forEach((pattern) => {
					const matches = pageText.match(pattern);
					if (matches) {
						matches.forEach((url) => {
							if (!links.some((link) => link.url === url)) {
								links.push({ url });
							}
						});
					}
				});

				return links;
			},
		});

		return results[0]?.result || [];
	} catch (error) {
		console.error('Error extracting links:', error);
		return [];
	}
}

// Export statistics
async function exportStatistics() {
	try {
		const response = await sendMessageToBackground('GET_SETTINGS');

		if (response.success) {
			const stats = response.settings.stats;
			const timestamp = new Date().toISOString();

			const exportData = {
				timestamp,
				version: '1.1.0',
				extensionInfo: {
					name: 'Halo - Meeting Link Verifier',
					version: '1.1.0',
					manifestVersion: 3,
				},
				statistics: stats,
				settings: {
					halo_enabled: response.settings.halo_enabled,
					auto_scan: response.settings.auto_scan,
					show_badges: response.settings.show_badges,
					cache_enabled: response.settings.cache_enabled,
					rate_limit_enabled: response.settings.rate_limit_enabled,
					debug_logging: response.settings.debug_logging,
				},
			};

			// Create download
			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: 'application/json',
			});
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = `halo-stats-${timestamp.split('T')[0]}.json`;
			a.click();

			URL.revokeObjectURL(url);

			showNotification('Statistics exported successfully', 'success');
		}
	} catch (error) {
		console.error('Export error:', error);
		showNotification('Failed to export statistics', 'error');
	}
}

// Show notification
function showNotification(message, type = 'info') {
	const notification = document.createElement('div');
	notification.className = `notification notification-${type}`;
	notification.textContent = message;

	notification.style.cssText = `
		position: fixed;
		top: 10px;
		right: 10px;
		padding: 8px 12px;
		border-radius: 4px;
		color: white;
		font-size: 12px;
		z-index: 10000;
		animation: slideIn 0.3s ease-out;
		max-width: 200px;
	`;

	if (type === 'success') {
		notification.style.backgroundColor = '#10b981';
	} else if (type === 'error') {
		notification.style.backgroundColor = '#ef4444';
	} else {
		notification.style.backgroundColor = '#3b82f6';
	}

	document.body.appendChild(notification);

	setTimeout(() => {
		notification.remove();
	}, 3000);
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

// Enhanced scan current tab
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
		setTimeout(async () => {
			// Refresh stats to show updated scan count
			await loadStats();

			resultsContent.textContent =
				'Scan completed. Check badges on the page.';
			scanResults.style.display = 'block';

			// Reset button
			scanButton.disabled = false;
			scanButton.innerHTML =
				'<span class="button-icon">🔍</span>Quick Scan';
		}, 2000);
	} catch (error) {
		console.error('Error scanning tab:', error);
		resultsContent.textContent = `Scan failed: ${error.message}`;
		scanResults.style.display = 'block';

		// Reset button
		scanButton.disabled = false;
		scanButton.innerHTML = '<span class="button-icon">🔍</span>Quick Scan';
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

// Enhanced about modal
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
			max-width: 340px;
			text-align: center;
		">
			<h3 style="margin: 0 0 16px 0; color: #1e293b;">🛡️ Halo v1.1.0</h3>
			<p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">
				Advanced meeting link verification with enterprise-grade features.
			</p>
			<p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px;">
				<strong>T3.3 Features:</strong><br>
				• Tabbed interface design<br>
				• Enhanced statistics dashboard<br>
				• Advanced settings management<br>
				• Health monitoring system<br>
				• Batch verification capabilities<br>
				• Data export functionality
			</p>
			<p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px;">
				<strong>T3.2 Performance:</strong><br>
				• 10x faster verification<br>
				• Intelligent caching system<br>
				• Multi-method verification<br>
				• Rate limiting protection
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
				width: 100%;
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
	if (activeTabPanel === 'dashboard') {
		await loadStats();
		await loadCacheStats();
	}
}, 10000); // Every 10 seconds

console.log(
	'✅ Enhanced Popup JavaScript v1.1.0 with T3.3 Tabbed Interface Loaded'
);
