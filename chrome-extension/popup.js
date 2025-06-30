// Halo Chrome Extension - Simplified Popup
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
	initializePopup();
});

function initializePopup() {
	const revealButton = document.getElementById('revealButton');
	const createButton = document.getElementById('createButton');
	const linkContainer = document.getElementById('linkContainer');

	// Handle reveal button click
	if (revealButton) {
		revealButton.addEventListener('click', function () {
			handleRevealLink();
		});
	}

	// Handle create button click
	if (createButton) {
		createButton.addEventListener('click', function () {
			handleCreateLink();
		});
	}

	// Set initial state
	console.log('Halo popup initialized');
}

function handleRevealLink() {
	const linkContainer = document.getElementById('linkContainer');
	const linkDisplay = document.getElementById('linkDisplay');
	const revealButton = document.getElementById('revealButton');

	if (linkContainer && linkDisplay && revealButton) {
		// Remove blur effect and add revealed animation
		linkDisplay.style.filter = 'none';
		linkDisplay.style.transition = 'filter 0.3s ease-out';
		linkContainer.classList.add('revealed');

		// Update button text
		revealButton.innerHTML = `
			<span class="button-icon">✓</span>
			<span class="button-text">Link Revealed</span>
		`;

		// Disable button and change styling
		revealButton.disabled = true;
		revealButton.style.background = '#059669';
		revealButton.style.cursor = 'default';
		revealButton.style.boxShadow = '0 0 20px rgba(5, 150, 105, 0.3)';

		console.log('Halo link revealed');
	}
}

function handleCreateLink() {
	// Open the frontend app's generate page in a new tab
	chrome.tabs.create({
		url: 'http://localhost:5173/', // Opens the main app where user can generate credentials
	});

	// Close the extension popup
	window.close();
}
