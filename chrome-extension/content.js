// Halo Chrome Extension - Content Script
// Scans web pages for meeting links and displays verification badges

console.log('🛡️ Halo Content Script Loaded on:', window.location.href);

// Meeting link patterns for different platforms
const MEETING_PATTERNS = {
	zoom: /https?:\/\/([\w\-]+\.)?zoom\.us\/[jw]\/\d+/gi,
	googleMeet: /https?:\/\/meet\.google\.com\/[a-z\-]+/gi,
	teams: /https?:\/\/teams\.microsoft\.com\/l\/meetup-join\//gi,
	discord: /https?:\/\/discord\.gg\/[a-zA-Z0-9]+/gi,
	webex: /https?:\/\/([\w\-]+\.)?webex\.com\/meet\//gi,
	generic:
		/https?:\/\/[^\s<>"']*(?:zoom|meet|teams|discord|webex)[^\s<>"']*/gi,
};

// Verification status cache
const verificationCache = new Map();

// Initialize content script
function initializeHaloScanner() {
	console.log('🔍 Initializing Halo meeting link scanner...');

	// Initial scan
	scanForMeetingLinks();

	// Set up mutation observer for dynamic content
	const observer = new MutationObserver((mutations) => {
		let shouldScan = false;

		mutations.forEach((mutation) => {
			if (
				mutation.type === 'childList' &&
				mutation.addedNodes.length > 0
			) {
				shouldScan = true;
			}
		});

		if (shouldScan) {
			// Debounce scanning to avoid performance issues
			clearTimeout(window.haloScanTimeout);
			window.haloScanTimeout = setTimeout(scanForMeetingLinks, 500);
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	console.log('✅ Halo scanner initialized');
}

// Scan the page for meeting links
function scanForMeetingLinks() {
	console.log('🔍 Scanning page for meeting links...');

	const links = [];

	// Find all text nodes and links
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
		{
			acceptNode: (node) => {
				// Skip already processed nodes
				if (
					node.classList &&
					node.classList.contains('halo-processed')
				) {
					return NodeFilter.FILTER_REJECT;
				}

				// Accept text nodes and link elements
				if (node.nodeType === Node.TEXT_NODE) {
					return NodeFilter.FILTER_ACCEPT;
				}

				if (node.tagName === 'A' && node.href) {
					return NodeFilter.FILTER_ACCEPT;
				}

				return NodeFilter.FILTER_SKIP;
			},
		}
	);

	let node;
	while ((node = walker.nextNode())) {
		if (node.nodeType === Node.TEXT_NODE) {
			// Check text content for meeting links
			const meetingLinks = extractMeetingLinksFromText(node.textContent);
			meetingLinks.forEach((link) => {
				links.push({
					url: link.url,
					platform: link.platform,
					element: node.parentElement,
					type: 'text',
				});
			});
		} else if (node.tagName === 'A') {
			// Check href attribute
			const platform = detectMeetingPlatform(node.href);
			if (platform) {
				links.push({
					url: node.href,
					platform: platform,
					element: node,
					type: 'link',
				});
			}
		}
	}

	console.log(`🔍 Found ${links.length} meeting links`);

	// Process each link
	links.forEach((link) => processMeetingLink(link));
}

// Extract meeting links from text content
function extractMeetingLinksFromText(text) {
	const links = [];

	Object.entries(MEETING_PATTERNS).forEach(([platform, pattern]) => {
		const matches = text.match(pattern);
		if (matches) {
			matches.forEach((match) => {
				links.push({
					url: match.trim(),
					platform: platform,
				});
			});
		}
	});

	return links;
}

// Detect meeting platform from URL
function detectMeetingPlatform(url) {
	if (!url) return null;

	const urlLower = url.toLowerCase();

	if (urlLower.includes('zoom.us')) return 'zoom';
	if (urlLower.includes('meet.google.com')) return 'googleMeet';
	if (urlLower.includes('teams.microsoft.com')) return 'teams';
	if (urlLower.includes('discord.gg') || urlLower.includes('discord.com'))
		return 'discord';
	if (urlLower.includes('webex.com')) return 'webex';

	return null;
}

// Process a meeting link for verification
async function processMeetingLink(linkData) {
	try {
		// Skip if already processed
		if (linkData.element.classList.contains('halo-processed')) {
			return;
		}

		// Mark as processed
		linkData.element.classList.add('halo-processed');

		console.log('🔍 Processing meeting link:', linkData.url);

		// Check cache first
		if (verificationCache.has(linkData.url)) {
			const cachedResult = verificationCache.get(linkData.url);
			addTrustBadge(linkData, cachedResult);
			return;
		}

		// Verify the link
		const verification = await verifyMeetingLink(linkData.url);

		// Cache the result
		verificationCache.set(linkData.url, verification);

		// Add trust badge
		addTrustBadge(linkData, verification);
	} catch (error) {
		console.error('Error processing meeting link:', error);
	}
}

// Verify meeting link with background script
function verifyMeetingLink(url) {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			{
				type: 'VERIFY_LINK',
				data: { url: url },
			},
			(response) => {
				if (chrome.runtime.lastError) {
					console.error(
						'Extension communication error:',
						chrome.runtime.lastError
					);
					resolve({
						verified: false,
						trustLevel: 'error',
						reason: 'Extension communication error',
					});
				} else {
					resolve(response);
				}
			}
		);
	});
}

// Add trust badge to a meeting link
function addTrustBadge(linkData, verification) {
	const badge = createTrustBadge(verification);

	// Position badge near the link
	if (linkData.type === 'link') {
		// For anchor elements, add badge after the link
		linkData.element.style.position = 'relative';
		linkData.element.style.display = 'inline-block';
		linkData.element.appendChild(badge);
	} else {
		// For text content, try to position near the text
		const container = linkData.element;
		if (container) {
			container.style.position = 'relative';
			container.appendChild(badge);
		}
	}

	console.log(
		`✅ Added ${verification.trustLevel} badge to ${linkData.platform} link`
	);
}

// Create trust badge element
function createTrustBadge(verification) {
	const badge = document.createElement('span');
	badge.className = 'halo-trust-badge';

	// Set badge content based on verification status
	if (verification.verified) {
		badge.innerHTML = '🛡️ ✅';
		badge.title = `Verified by Halo - Trust Level: ${verification.trustLevel}`;
		badge.style.color = '#10B981'; // Green
	} else if (verification.trustLevel === 'unverified') {
		badge.innerHTML = '🛡️ ⚠️';
		badge.title = 'Unverified link - No Halo credential found';
		badge.style.color = '#F59E0B'; // Yellow
	} else {
		badge.innerHTML = '🛡️ ❌';
		badge.title = `Verification failed: ${verification.reason}`;
		badge.style.color = '#EF4444'; // Red
	}

	// Badge styling
	Object.assign(badge.style, {
		display: 'inline-block',
		marginLeft: '4px',
		fontSize: '12px',
		fontWeight: 'bold',
		padding: '2px 4px',
		borderRadius: '3px',
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
		border: '1px solid #e5e7eb',
		cursor: 'help',
		zIndex: '10000',
		position: 'relative',
	});

	// Add click handler for detailed info
	badge.addEventListener('click', (e) => {
		e.stopPropagation();
		showVerificationDetails(verification);
	});

	return badge;
}

// Show detailed verification information
function showVerificationDetails(verification) {
	const modal = document.createElement('div');
	modal.className = 'halo-verification-modal';

	modal.innerHTML = `
    <div class="halo-modal-content">
      <div class="halo-modal-header">
        <h3>🛡️ Halo Link Verification</h3>
        <button class="halo-modal-close">×</button>
      </div>
      <div class="halo-modal-body">
        <p><strong>Status:</strong> ${
			verification.verified ? '✅ Verified' : '❌ Unverified'
		}</p>
        <p><strong>Trust Level:</strong> ${
			verification.trustLevel || 'Unknown'
		}</p>
        ${
			verification.platform
				? `<p><strong>Platform:</strong> ${verification.platform}</p>`
				: ''
		}
        ${
			verification.creatorAddress
				? `<p><strong>Creator:</strong> ${verification.creatorAddress.substring(
						0,
						10
				  )}...</p>`
				: ''
		}
        ${
			verification.timestamp
				? `<p><strong>Verified:</strong> ${new Date(
						verification.timestamp
				  ).toLocaleString()}</p>`
				: ''
		}
        ${
			verification.reason
				? `<p><strong>Details:</strong> ${verification.reason}</p>`
				: ''
		}
      </div>
    </div>
  `;

	// Modal styling
	Object.assign(modal.style, {
		position: 'fixed',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: '999999',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	});

	// Close modal handlers
	const closeBtn = modal.querySelector('.halo-modal-close');
	const closeModal = () => document.body.removeChild(modal);

	closeBtn.addEventListener('click', closeModal);
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});

	document.body.appendChild(modal);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initializeHaloScanner);
} else {
	initializeHaloScanner();
}
