// Halo Chrome Extension - Popup JavaScript
// Handles popup UI interactions and communication with background script

document.addEventListener('DOMContentLoaded', initializePopup);

let currentTab = null;

async function initializePopup() {
	console.log('🛡️ Initializing Halo popup...');

	// Get current tab
	await getCurrentTab();

	// Load settings and stats
	await loadSettings();
	await loadStats();

	// Set up event listeners
	setupEventListeners();

	// Update status
	updateExtensionStatus();

	console.log('✅ Popup initialized');
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
		} else {
			urlElement.textContent = 'Unknown';
		}
	} catch (error) {
		console.error('Error getting current tab:', error);
		document.getElementById('currentTabUrl').textContent = 'Error';
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
		}
	} catch (error) {
		console.error('Error loading stats:', error);
		// Set default values
		document.getElementById('linksScanned').textContent = '-';
		document.getElementById('linksVerified').textContent = '-';
		document.getElementById('threatsBlocked').textContent = '-';
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
      max-width: 300px;
      text-align: center;
    ">
      <h3 style="margin: 0 0 16px 0; color: #1e293b;">🛡️ Halo v1.0.0</h3>
      <p style="margin: 0 0 16px 0; color: #64748b; font-size: 14px;">
        Protect yourself from social engineering attacks with verifiable meeting links.
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

// Auto-refresh stats every 10 seconds
setInterval(async () => {
	await loadStats();
}, 10000);
