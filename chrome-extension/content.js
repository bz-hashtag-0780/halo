// Halo Chrome Extension - Enhanced Content Script v1.1.0
// T3.4 Content Script Optimization: Performance, platform-specific handling, advanced badge system
// Scans web pages for meeting links and displays verification badges with enterprise-grade features

console.log(
	'🛡️ Halo Enhanced Content Script v1.1.0 loaded on:',
	window.location.href
);

// Enhanced configuration
const CONFIG = {
	// Performance settings
	SCAN_DEBOUNCE_DELAY: 300,
	CACHE_TTL: 5 * 60 * 1000, // 5 minutes
	MAX_CACHE_SIZE: 100,
	BATCH_PROCESS_SIZE: 5,
	MUTATION_THROTTLE: 150,

	// Platform detection
	PLATFORMS: {
		zoom: {
			patterns: [
				/https?:\/\/([\w\-]+\.)?zoom\.us\/[jw]\/\d+/gi,
				/https?:\/\/([\w\-]+\.)?zoom\.us\/s\/\d+/gi,
				/https?:\/\/([\w\-]+\.)?zoom\.us\/my\//gi,
			],
			selectors: ['a[href*="zoom.us"]', '[data-zoom-url]'],
			name: 'Zoom',
			icon: '��',
		},
		googleMeet: {
			patterns: [
				/https?:\/\/meet\.google\.com\/[a-z\-]+/gi,
				/https?:\/\/meet\.google\.com\/lookup\/[a-zA-Z0-9]+/gi,
			],
			selectors: ['a[href*="meet.google.com"]', '[data-meet-url]'],
			name: 'Google Meet',
			icon: '🎥',
		},
		teams: {
			patterns: [
				/https?:\/\/teams\.microsoft\.com\/l\/meetup-join\//gi,
				/https?:\/\/([\w\-]+\.)?teams\.microsoft\.com\/l\//gi,
			],
			selectors: ['a[href*="teams.microsoft.com"]', '[data-teams-url]'],
			name: 'Microsoft Teams',
			icon: '👥',
		},
		discord: {
			patterns: [
				/https?:\/\/discord\.gg\/[a-zA-Z0-9]+/gi,
				/https?:\/\/discord\.com\/invite\/[a-zA-Z0-9]+/gi,
			],
			selectors: ['a[href*="discord"]', '[data-discord-invite]'],
			name: 'Discord',
			icon: '🎮',
		},
		webex: {
			patterns: [
				/https?:\/\/([\w\-]+\.)?webex\.com\/meet\//gi,
				/https?:\/\/([\w\-]+\.)?webex\.com\/join\//gi,
			],
			selectors: ['a[href*="webex.com"]', '[data-webex-url]'],
			name: 'Cisco Webex',
			icon: '📞',
		},
	},

	// Platform-specific optimizations
	PLATFORM_SPECIFIC: {
		gmail: {
			containers: ['.ii', '.a3s', '.im', '[role="main"]'],
			excludeSelectors: ['.gmail_quote', '.moz-cite-prefix'],
			throttle: 200,
		},
		discord: {
			containers: [
				'.markup-2BOw-j',
				'.messageContent-2qWWxC',
				'[data-slate-editor]',
			],
			excludeSelectors: ['.spoilerText-3p6IlD'],
			throttle: 100,
		},
		teams: {
			containers: ['[data-tid="chat-pane-message"]', '.ui-chat__message'],
			excludeSelectors: ['.ui-chat__message--system'],
			throttle: 150,
		},
		slack: {
			containers: ['.c-message__body', '.p-rich_text_section'],
			excludeSelectors: ['.c-message--light'],
			throttle: 100,
		},
	},
};

// Enhanced verification cache with TTL
class VerificationCache {
	constructor() {
		this.cache = new Map();
		this.timestamps = new Map();
		this.maxSize = CONFIG.MAX_CACHE_SIZE;
		this.ttl = CONFIG.CACHE_TTL;
	}

	set(key, value) {
		// Clean expired entries first
		this.cleanup();

		// Remove oldest entry if cache is full
		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			this.cache.delete(oldestKey);
			this.timestamps.delete(oldestKey);
		}

		this.cache.set(key, value);
		this.timestamps.set(key, Date.now());
	}

	get(key) {
		const timestamp = this.timestamps.get(key);
		if (!timestamp || Date.now() - timestamp > this.ttl) {
			this.cache.delete(key);
			this.timestamps.delete(key);
			return null;
		}
		return this.cache.get(key);
	}

	has(key) {
		return this.get(key) !== null;
	}

	cleanup() {
		const now = Date.now();
		for (const [key, timestamp] of this.timestamps.entries()) {
			if (now - timestamp > this.ttl) {
				this.cache.delete(key);
				this.timestamps.delete(key);
			}
		}
	}

	clear() {
		this.cache.clear();
		this.timestamps.clear();
	}

	getStats() {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
			ttl: this.ttl,
		};
	}
}

// Global instances
const verificationCache = new VerificationCache();
let mutationObserver = null;
let scanTimeout = null;
let isScanning = false;
let processedElements = new WeakSet();

// Enhanced platform detection
function detectCurrentPlatform() {
	const hostname = window.location.hostname.toLowerCase();
	const url = window.location.href.toLowerCase();

	if (hostname.includes('mail.google.com') || url.includes('gmail'))
		return 'gmail';
	if (hostname.includes('discord.com')) return 'discord';
	if (hostname.includes('teams.microsoft.com')) return 'teams';
	if (hostname.includes('slack.com')) return 'slack';
	if (hostname.includes('web.whatsapp.com')) return 'whatsapp';

	return 'generic';
}

// Platform-specific configuration
function getPlatformConfig() {
	const platform = detectCurrentPlatform();
	return (
		CONFIG.PLATFORM_SPECIFIC[platform] || {
			containers: ['body'],
			excludeSelectors: [],
			throttle: CONFIG.MUTATION_THROTTLE,
		}
	);
}

// Enhanced meeting link detection
function detectMeetingPlatform(url) {
	if (!url) return null;

	const urlLower = url.toLowerCase();

	for (const [platform, config] of Object.entries(CONFIG.PLATFORMS)) {
		if (
			config.patterns.some((pattern) => {
				pattern.lastIndex = 0; // Reset regex state
				return pattern.test(urlLower);
			})
		) {
			return platform;
		}
	}

	return null;
}

// Enhanced link extraction with performance optimization
function extractMeetingLinksFromText(text, element) {
	const links = [];
	const seenUrls = new Set();

	// Skip if element already processed
	if (processedElements.has(element)) {
		return links;
	}

	for (const [platform, config] of Object.entries(CONFIG.PLATFORMS)) {
		for (const pattern of config.patterns) {
			pattern.lastIndex = 0; // Reset regex state
			let match;

			while ((match = pattern.exec(text)) !== null) {
				const url = match[0].trim();

				// Avoid duplicates
				if (!seenUrls.has(url)) {
					seenUrls.add(url);
					links.push({
						url,
						platform,
						platformName: config.name,
						icon: config.icon,
					});
				}

				// Prevent infinite loops
				if (pattern.lastIndex === match.index) {
					pattern.lastIndex++;
				}
			}
		}
	}

	return links;
}

// Enhanced DOM scanning with performance optimization
function scanForMeetingLinks() {
	if (isScanning) {
		console.log('🔍 Scan already in progress, skipping...');
		return;
	}

	isScanning = true;
	console.log('🔍 Enhanced scanning for meeting links...');

	const startTime = performance.now();
	const links = [];
	const platformConfig = getPlatformConfig();

	try {
		// Use platform-specific containers for better performance
		const containers = platformConfig.containers
			.map((selector) => {
				try {
					return document.querySelectorAll(selector);
				} catch (e) {
					return [];
				}
			})
			.flat();

		const targetContainers =
			containers.length > 0 ? containers : [document.body];

		for (const container of targetContainers) {
			if (!container) continue;

			// Enhanced tree walker with better filtering
			const walker = document.createTreeWalker(
				container,
				NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
				{
					acceptNode: (node) => {
						// Skip processed elements
						if (processedElements.has(node)) {
							return NodeFilter.FILTER_REJECT;
						}

						// Skip excluded elements
						if (node.nodeType === Node.ELEMENT_NODE) {
							const element = node;

							// Check exclude selectors
							for (const excludeSelector of platformConfig.excludeSelectors) {
								try {
									if (
										element.matches &&
										element.matches(excludeSelector)
									) {
										return NodeFilter.FILTER_REJECT;
									}
								} catch (e) {
									// Ignore invalid selectors
								}
							}

							// Skip already processed elements
							if (element.classList.contains('halo-processed')) {
								return NodeFilter.FILTER_REJECT;
							}

							// Accept link elements
							if (element.tagName === 'A' && element.href) {
								return NodeFilter.FILTER_ACCEPT;
							}
						}

						// Accept text nodes with content
						if (
							node.nodeType === Node.TEXT_NODE &&
							node.textContent.trim()
						) {
							return NodeFilter.FILTER_ACCEPT;
						}

						return NodeFilter.FILTER_SKIP;
					},
				}
			);

			let node;
			while ((node = walker.nextNode())) {
				if (node.nodeType === Node.TEXT_NODE) {
					// Extract links from text content
					const textLinks = extractMeetingLinksFromText(
						node.textContent,
						node.parentElement
					);
					textLinks.forEach((link) => {
						links.push({
							...link,
							element: node.parentElement,
							type: 'text',
							textNode: node,
						});
					});

					// Mark parent as processed
					if (node.parentElement) {
						processedElements.add(node.parentElement);
					}
				} else if (node.tagName === 'A' && node.href) {
					// Check href attribute
					const platform = detectMeetingPlatform(node.href);
					if (platform) {
						const config = CONFIG.PLATFORMS[platform];
						links.push({
							url: node.href,
							platform,
							platformName: config.name,
							icon: config.icon,
							element: node,
							type: 'link',
						});

						// Mark as processed
						processedElements.add(node);
					}
				}
			}
		}

		const scanTime = performance.now() - startTime;
		console.log(
			`🔍 Enhanced scan complete: ${
				links.length
			} links found in ${scanTime.toFixed(2)}ms`
		);

		// Process links in batches for better performance
		processMeetingLinksBatch(links);
	} catch (error) {
		console.error('Error during enhanced scan:', error);
	} finally {
		isScanning = false;
	}
}

// Batch processing for better performance
async function processMeetingLinksBatch(links) {
	const batchSize = CONFIG.BATCH_PROCESS_SIZE;

	for (let i = 0; i < links.length; i += batchSize) {
		const batch = links.slice(i, i + batchSize);

		// Process batch concurrently
		const promises = batch.map((link) => processMeetingLink(link));

		try {
			await Promise.all(promises);
		} catch (error) {
			console.error('Error processing batch:', error);
		}

		// Small delay between batches to prevent overwhelming
		if (i + batchSize < links.length) {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}
}

// Enhanced meeting link processing
async function processMeetingLink(linkData) {
	try {
		// Skip if already processed
		if (linkData.element.classList.contains('halo-processed')) {
			return;
		}

		// Mark as processed immediately to prevent duplicates
		linkData.element.classList.add('halo-processed');

		console.log(
			`🔍 Processing ${linkData.platformName} link:`,
			linkData.url
		);

		// Check cache first
		if (verificationCache.has(linkData.url)) {
			const cachedResult = verificationCache.get(linkData.url);
			addEnhancedTrustBadge(linkData, cachedResult);
			return;
		}

		// Show loading state
		const loadingBadge = addLoadingBadge(linkData);

		try {
			// Verify the link with timeout
			const verification = await Promise.race([
				verifyMeetingLink(linkData.url),
				new Promise((_, reject) =>
					setTimeout(
						() => reject(new Error('Verification timeout')),
						10000
					)
				),
			]);

			// Cache the result
			verificationCache.set(linkData.url, verification);

			// Remove loading badge and add final badge
			if (loadingBadge && loadingBadge.parentNode) {
				loadingBadge.parentNode.removeChild(loadingBadge);
			}

			addEnhancedTrustBadge(linkData, verification);
		} catch (error) {
			console.error('Verification failed:', error);

			// Remove loading badge and show error
			if (loadingBadge && loadingBadge.parentNode) {
				loadingBadge.parentNode.removeChild(loadingBadge);
			}

			const errorVerification = {
				verified: false,
				trustLevel: 'error',
				reason: error.message || 'Verification failed',
				platform: linkData.platform,
			};

			verificationCache.set(linkData.url, errorVerification);
			addEnhancedTrustBadge(linkData, errorVerification);
		}
	} catch (error) {
		console.error('Error processing meeting link:', error);
	}
}

// Add loading badge
function addLoadingBadge(linkData) {
	const badge = document.createElement('span');
	badge.className = 'halo-trust-badge halo-loading';
	badge.innerHTML = '🛡️ ⏳';
	badge.title = 'Halo: Verifying link...';
	badge.style.cssText = `
		display: inline-block;
		margin-left: 4px;
		font-size: 12px;
		padding: 2px 4px;
		border-radius: 3px;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid #3b82f6;
		color: #3b82f6;
		animation: halo-pulse 1.5s infinite;
		z-index: 10000;
		position: relative;
	`;

	// Add CSS animation if not exists
	if (!document.getElementById('halo-loading-styles')) {
		const style = document.createElement('style');
		style.id = 'halo-loading-styles';
		style.textContent = `
			@keyframes halo-pulse {
				0%, 100% { opacity: 1; }
				50% { opacity: 0.5; }
			}
		`;
		document.head.appendChild(style);
	}

	// Position badge
	positionBadge(linkData, badge);

	return badge;
}

// Enhanced badge positioning
function positionBadge(linkData, badge) {
	if (linkData.type === 'link') {
		// For anchor elements
		linkData.element.style.position = 'relative';
		linkData.element.style.display = 'inline-block';
		linkData.element.appendChild(badge);
	} else if (linkData.textNode) {
		// For text content, create a wrapper
		try {
			const wrapper = document.createElement('span');
			wrapper.style.position = 'relative';
			wrapper.style.display = 'inline-block';

			// Insert wrapper after text node
			linkData.textNode.parentNode.insertBefore(
				wrapper,
				linkData.textNode.nextSibling
			);
			wrapper.appendChild(badge);
		} catch (error) {
			// Fallback: append to parent element
			linkData.element.appendChild(badge);
		}
	} else {
		// Fallback positioning
		linkData.element.style.position = 'relative';
		linkData.element.appendChild(badge);
	}
}

// Enhanced trust badge creation
function addEnhancedTrustBadge(linkData, verification) {
	const badge = document.createElement('span');
	badge.className = 'halo-trust-badge halo-enhanced';

	// Enhanced badge content with platform info
	let badgeIcon, badgeColor, badgeTitle;

	if (verification.verified) {
		badgeIcon = `${linkData.icon} ✅`;
		badgeColor = '#10B981';
		badgeTitle = `Verified ${linkData.platformName} link - Trust Level: ${verification.trustLevel}`;
	} else if (verification.trustLevel === 'unverified') {
		badgeIcon = `${linkData.icon} ⚠️`;
		badgeColor = '#F59E0B';
		badgeTitle = `Unverified ${linkData.platformName} link - No Halo credential found`;
	} else {
		badgeIcon = `${linkData.icon} ❌`;
		badgeColor = '#EF4444';
		badgeTitle = `${linkData.platformName} verification failed: ${verification.reason}`;
	}

	badge.innerHTML = badgeIcon;
	badge.title = badgeTitle;

	// Enhanced styling
	badge.style.cssText = `
		display: inline-block;
		margin-left: 4px;
		font-size: 12px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid ${badgeColor};
		color: ${badgeColor};
		cursor: help;
		z-index: 10000;
		position: relative;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	`;

	// Hover effects
	badge.addEventListener('mouseenter', () => {
		badge.style.transform = 'scale(1.05)';
		badge.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
	});

	badge.addEventListener('mouseleave', () => {
		badge.style.transform = 'scale(1)';
		badge.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
	});

	// Enhanced click handler
	badge.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		showEnhancedVerificationDetails(verification, linkData);
	});

	// Position the badge
	positionBadge(linkData, badge);

	console.log(
		`✅ Added enhanced ${verification.trustLevel} badge to ${linkData.platformName} link`
	);
}

// Enhanced verification modal
function showEnhancedVerificationDetails(verification, linkData) {
	const modal = document.createElement('div');
	modal.className = 'halo-verification-modal';

	const statusIcon = verification.verified
		? '✅'
		: verification.trustLevel === 'unverified'
		? '⚠️'
		: '❌';
	const statusText = verification.verified
		? 'Verified'
		: verification.trustLevel === 'unverified'
		? 'Unverified'
		: 'Error';
	const statusColor = verification.verified
		? '#10B981'
		: verification.trustLevel === 'unverified'
		? '#F59E0B'
		: '#EF4444';

	modal.innerHTML = `
		<div class="halo-modal-content">
			<div class="halo-modal-header">
				<h3>${linkData.icon} Halo Link Verification</h3>
				<button class="halo-modal-close">×</button>
			</div>
			<div class="halo-modal-body">
				<div class="halo-status-section">
					<div class="halo-status-badge" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor};">
						${statusIcon} ${statusText}
					</div>
				</div>
				
				<div class="halo-details-grid">
					<div class="halo-detail-item">
						<span class="halo-detail-label">Platform:</span>
						<span class="halo-detail-value">${linkData.platformName}</span>
					</div>
					
					<div class="halo-detail-item">
						<span class="halo-detail-label">Trust Level:</span>
						<span class="halo-detail-value">${verification.trustLevel || 'Unknown'}</span>
					</div>
					
					${
						verification.creatorAddress
							? `
					<div class="halo-detail-item">
						<span class="halo-detail-label">Creator:</span>
						<span class="halo-detail-value" title="${verification.creatorAddress}">
							${verification.creatorAddress.substring(0, 10)}...
						</span>
					</div>
					`
							: ''
					}
					
					${
						verification.timestamp
							? `
					<div class="halo-detail-item">
						<span class="halo-detail-label">Verified:</span>
						<span class="halo-detail-value">${new Date(
							verification.timestamp
						).toLocaleString()}</span>
					</div>
					`
							: ''
					}
					
					${
						verification.reason
							? `
					<div class="halo-detail-item">
						<span class="halo-detail-label">Details:</span>
						<span class="halo-detail-value">${verification.reason}</span>
					</div>
					`
							: ''
					}
				</div>
				
				<div class="halo-modal-footer">
					<p class="halo-powered-by">Powered by AIR Credentials & Moca Testnet</p>
				</div>
			</div>
		</div>
	`;

	// Enhanced modal styling
	modal.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		z-index: 999999;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(2px);
		animation: halo-modal-fade-in 0.2s ease-out;
	`;

	// Add modal styles if not exists
	if (!document.getElementById('halo-modal-styles')) {
		const style = document.createElement('style');
		style.id = 'halo-modal-styles';
		style.textContent = `
			@keyframes halo-modal-fade-in {
				from { opacity: 0; transform: scale(0.9); }
				to { opacity: 1; transform: scale(1); }
			}
			
			.halo-modal-content {
				background: white;
				border-radius: 12px;
				max-width: 400px;
				width: 90%;
				max-height: 80vh;
				overflow-y: auto;
				box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
				animation: halo-modal-slide-up 0.3s ease-out;
			}
			
			@keyframes halo-modal-slide-up {
				from { transform: translateY(20px); opacity: 0; }
				to { transform: translateY(0); opacity: 1; }
			}
			
			.halo-modal-header {
				padding: 20px 24px 16px;
				border-bottom: 1px solid #f1f5f9;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			
			.halo-modal-header h3 {
				margin: 0;
				font-size: 18px;
				font-weight: 600;
				color: #1e293b;
			}
			
			.halo-modal-close {
				background: none;
				border: none;
				font-size: 24px;
				color: #64748b;
				cursor: pointer;
				padding: 0;
				width: 32px;
				height: 32px;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 6px;
				transition: all 0.2s;
			}
			
			.halo-modal-close:hover {
				background: #f1f5f9;
				color: #1e293b;
			}
			
			.halo-modal-body {
				padding: 20px 24px;
			}
			
			.halo-status-section {
				margin-bottom: 20px;
				text-align: center;
			}
			
			.halo-status-badge {
				display: inline-block;
				padding: 8px 16px;
				border-radius: 6px;
				font-weight: 600;
				font-size: 14px;
			}
			
			.halo-details-grid {
				display: flex;
				flex-direction: column;
				gap: 12px;
			}
			
			.halo-detail-item {
				display: flex;
				justify-content: space-between;
				align-items: flex-start;
				padding: 8px 0;
				border-bottom: 1px solid #f8fafc;
			}
			
			.halo-detail-label {
				font-weight: 500;
				color: #64748b;
				font-size: 14px;
			}
			
			.halo-detail-value {
				color: #1e293b;
				font-size: 14px;
				text-align: right;
				word-break: break-word;
				max-width: 60%;
			}
			
			.halo-modal-footer {
				margin-top: 20px;
				padding-top: 16px;
				border-top: 1px solid #f1f5f9;
				text-align: center;
			}
			
			.halo-powered-by {
				margin: 0;
				font-size: 12px;
				color: #94a3b8;
			}
		`;
		document.head.appendChild(style);
	}

	// Enhanced close handlers
	const closeBtn = modal.querySelector('.halo-modal-close');
	const closeModal = () => {
		modal.style.animation = 'halo-modal-fade-out 0.2s ease-in';
		setTimeout(() => {
			if (modal.parentNode) {
				document.body.removeChild(modal);
			}
		}, 200);
	};

	// Add fade-out animation
	if (!document.getElementById('halo-modal-fade-out')) {
		const style = document.createElement('style');
		style.id = 'halo-modal-fade-out';
		style.textContent = `
			@keyframes halo-modal-fade-out {
				from { opacity: 1; transform: scale(1); }
				to { opacity: 0; transform: scale(0.9); }
			}
		`;
		document.head.appendChild(style);
	}

	closeBtn.addEventListener('click', closeModal);
	modal.addEventListener('click', (e) => {
		if (e.target === modal) closeModal();
	});

	// Escape key handler
	const escapeHandler = (e) => {
		if (e.key === 'Escape') {
			closeModal();
			document.removeEventListener('keydown', escapeHandler);
		}
	};
	document.addEventListener('keydown', escapeHandler);

	document.body.appendChild(modal);
}

// Enhanced mutation observer with better performance
function setupEnhancedMutationObserver() {
	if (mutationObserver) {
		mutationObserver.disconnect();
	}

	const platformConfig = getPlatformConfig();
	let mutationTimeout = null;

	mutationObserver = new MutationObserver((mutations) => {
		let shouldScan = false;

		for (const mutation of mutations) {
			if (
				mutation.type === 'childList' &&
				mutation.addedNodes.length > 0
			) {
				// Check if any added nodes might contain meeting links
				for (const node of mutation.addedNodes) {
					if (node.nodeType === Node.ELEMENT_NODE) {
						// Check if the element or its children might contain links
						const element = node;
						if (
							element.tagName === 'A' ||
							element.querySelector('a') ||
							element.textContent?.match(/https?:\/\/[^\s<>"']+/)
						) {
							shouldScan = true;
							break;
						}
					} else if (
						node.nodeType === Node.TEXT_NODE &&
						node.textContent?.match(/https?:\/\/[^\s<>"']+/)
					) {
						shouldScan = true;
						break;
					}
				}

				if (shouldScan) break;
			}
		}

		if (shouldScan) {
			// Throttled scanning
			clearTimeout(mutationTimeout);
			mutationTimeout = setTimeout(() => {
				scanForMeetingLinks();
			}, platformConfig.throttle);
		}
	});

	// Enhanced observer configuration
	mutationObserver.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: false, // Don't observe text changes for performance
		attributes: false, // Don't observe attribute changes for performance
	});

	console.log(
		`🔍 Enhanced mutation observer setup with ${platformConfig.throttle}ms throttle`
	);
}

// Enhanced verification function with better error handling
function verifyMeetingLink(url) {
	return new Promise((resolve) => {
		const startTime = performance.now();

		chrome.runtime.sendMessage(
			{
				type: 'VERIFY_LINK',
				data: { url: url },
			},
			(response) => {
				const responseTime = performance.now() - startTime;

				if (chrome.runtime.lastError) {
					console.error(
						'Extension communication error:',
						chrome.runtime.lastError
					);
					resolve({
						verified: false,
						trustLevel: 'error',
						reason: 'Extension communication error',
						responseTime: responseTime,
					});
				} else if (!response) {
					resolve({
						verified: false,
						trustLevel: 'error',
						reason: 'No response from extension',
						responseTime: responseTime,
					});
				} else {
					// Add response time to verification result
					resolve({
						...response,
						responseTime: responseTime,
					});
				}
			}
		);
	});
}

// Enhanced initialization
function initializeEnhancedHaloScanner() {
	console.log('🔍 Initializing Enhanced Halo Scanner v1.1.0...');

	const platform = detectCurrentPlatform();
	console.log(`📍 Detected platform: ${platform}`);

	// Initial scan with delay to ensure DOM is ready
	setTimeout(() => {
		scanForMeetingLinks();
	}, 500);

	// Setup enhanced mutation observer
	setupEnhancedMutationObserver();

	// Periodic cache cleanup
	setInterval(() => {
		verificationCache.cleanup();
	}, 60000); // Every minute

	// Expose global functions for popup integration
	window.haloContentScript = {
		scanForMeetingLinks,
		getCacheStats: () => verificationCache.getStats(),
		clearCache: () => verificationCache.clear(),
		getPlatform: detectCurrentPlatform,
		getVersion: () => '1.1.0',
	};

	console.log('✅ Enhanced Halo Scanner initialized successfully');
}

// Enhanced DOM ready detection
function onDOMReady(callback) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', callback);
	} else {
		callback();
	}
}

// Initialize when DOM is ready
onDOMReady(() => {
	// Small delay to ensure all resources are loaded
	setTimeout(initializeEnhancedHaloScanner, 100);
});

// Handle page navigation (SPA support)
let currentUrl = window.location.href;
setInterval(() => {
	if (window.location.href !== currentUrl) {
		currentUrl = window.location.href;
		console.log('🔄 Page navigation detected, reinitializing scanner...');

		// Clear processed elements for new page
		processedElements = new WeakSet();

		// Re-scan after navigation
		setTimeout(scanForMeetingLinks, 1000);
	}
}, 1000);

console.log(
	'✅ Enhanced Halo Content Script v1.1.0 with T3.4 optimizations loaded successfully'
);
