// Simple Halo Gmail Badge System
console.log('🛡️ Halo Simple Badge System Loading...');

// Function to detect platform from URL
function detectPlatform(url) {
	const lowerUrl = url.toLowerCase();

	if (lowerUrl.includes('meet.google.com'))
		return { name: 'Google Meet', icon: '🎥' };
	if (lowerUrl.includes('zoom.us')) return { name: 'Zoom', icon: '📹' };
	if (lowerUrl.includes('teams.microsoft.com'))
		return { name: 'Teams', icon: '💼' };
	if (lowerUrl.includes('webex.com')) return { name: 'Webex', icon: '📺' };
	if (lowerUrl.includes('discord.com'))
		return { name: 'Discord', icon: '🎮' };
	if (lowerUrl.includes('calendly.com'))
		return { name: 'Calendly', icon: '📅' };

	return { name: 'Link', icon: '🔗' };
}

// Function to create verified badge
function createVerifiedBadge(link) {
	// Don't add if badge already exists
	if (link.querySelector('.halo-badge')) return;

	const platform = detectPlatform(link.href);

	const badge = document.createElement('div');
	badge.className = 'halo-badge';
	badge.style.cssText = `
		position: absolute;
		top: -8px;
		right: -8px;
		z-index: 9999;
		font-size: 10px;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		pointer-events: none;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
		display: flex;
		align-items: center;
		gap: 2px;
	`;

	badge.innerHTML = `${platform.icon} VERIFIED ${platform.name}`;

	// Make parent position relative if needed
	const parent = link.parentElement;
	if (parent && getComputedStyle(parent).position === 'static') {
		parent.style.position = 'relative';
	}

	link.style.position = 'relative';
	link.appendChild(badge);

	console.log(`✅ Added VERIFIED ${platform.name} badge to:`, link.href);
}

// Function to scan Gmail message for links
function scanGmailForLinks() {
	console.log('🔍 Scanning Gmail for links...');

	// Find all links in the page
	const links = document.querySelectorAll('a[href^="http"]');
	console.log(`🔗 Found ${links.length} links`);

	let badgesAdded = 0;
	links.forEach((link) => {
		// Skip if already has badge
		if (link.querySelector('.halo-badge')) return;

		// Add verified badge to all links
		createVerifiedBadge(link);
		badgesAdded++;
	});

	console.log(`✅ Added ${badgesAdded} verified badges`);
}

// Initialize
function init() {
	console.log('🚀 Starting Simple Halo...');

	// Initial scan
	setTimeout(scanGmailForLinks, 1000);

	// Scan when new content loads
	const observer = new MutationObserver(() => {
		setTimeout(scanGmailForLinks, 500);
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true,
	});

	// Global functions for testing
	window.haloScan = scanGmailForLinks;
	window.haloTest = () => {
		const firstLink = document.querySelector('a[href^="http"]');
		if (firstLink) {
			createVerifiedBadge(firstLink);
			console.log('✅ Test badge added');
		} else {
			console.log('❌ No links found');
		}
	};

	console.log('✅ Halo Ready! Use haloScan() or haloTest()');
}

// Start
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

setTimeout(init, 2000);
