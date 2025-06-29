# Halo Chrome Extension

🛡️ **Meeting Link Verifier** - Prevent social engineering attacks by verifying meeting links using onchain credentials and zero-knowledge proofs.

## Quick Start: Loading the Extension in Chrome

### Step 1: Enable Developer Mode

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Toggle **"Developer mode"** in the top-right corner

### Step 2: Load the Extension

1. Click **"Load unpacked"** button
2. Navigate to and select the `chrome-extension` folder
3. The Halo extension should now appear in your extensions list

### Step 3: Pin the Extension (Recommended)

1. Click the puzzle piece icon (🧩) in Chrome's toolbar
2. Find "Halo - Meeting Link Verifier" in the dropdown
3. Click the pin icon to add it to your toolbar

## Testing the Extension

### Prerequisites

1. **Start the Next.js web app** (for credential generation/verification):
    ```bash
    cd ../frontend
    npm run dev
    ```
    The app should be running at `http://localhost:3000`

### Test Scenarios

#### 1. Test Basic Functionality

1. Click the Halo extension icon (🛡️) in your toolbar
2. The popup should show:
    - Extension status (initially Active/Inactive)
    - Statistics (initially all zeros)
    - Current tab information
    - Settings toggles

#### 2. Test Link Scanning

1. Go to any website (Gmail, Discord, etc.)
2. Create a test document or message with meeting links like:
    - `https://zoom.us/j/123456789`
    - `https://meet.google.com/abc-defg-hij`
    - `https://teams.microsoft.com/l/meetup-join/`
3. Click the Halo extension popup → "Scan for Links" button
4. You should see badges appear next to meeting links on the page

#### 3. Test Verified Links

1. Open `http://localhost:3000/generate` in a new tab
2. Connect your wallet and generate a verified meeting link
3. Copy the generated link with the `halo_proof` parameter
4. Paste it somewhere (email, document, chat)
5. The extension should show a green ✅ badge for verified links

#### 4. Test Settings

1. Open the extension popup
2. Toggle "Enable Verification" on/off
3. Toggle "Auto-scan pages" and "Show trust badges"
4. Settings should persist between browser sessions

## Extension Features

### 🔍 **Automatic Link Detection**

-   Scans web pages for meeting links (Zoom, Google Meet, Teams, Discord, Webex)
-   Works on Gmail, Discord, Teams, Slack, WhatsApp Web
-   Real-time detection of dynamically loaded content

### 🛡️ **Trust Badges**

-   **Green ✅**: Verified with valid Halo credential
-   **Yellow ⚠️**: Unverified (no credential found)
-   **Red ❌**: Verification failed or error

### 📊 **Statistics Tracking**

-   Links scanned count
-   Links verified count
-   Threats blocked count

### ⚙️ **Configurable Settings**

-   Enable/disable verification
-   Auto-scan toggle
-   Show/hide trust badges

## Architecture

```
chrome-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker (background tasks)
├── content.js            # Content script (runs on web pages)
├── content.css           # Styles for trust badges
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styling
└── icons/                # Extension icons (placeholders)
```

## Development Notes

### Current Status: T3.1 Complete ✅

**What's Working:**

-   ✅ Manifest V3 structure
-   ✅ Background service worker with message handling
-   ✅ Content script with link detection and badge injection
-   ✅ Popup interface with settings and statistics
-   ✅ Communication between popup, content script, and background
-   ✅ Basic verification logic (simplified for MVP)

**What Needs Icons:**

-   The current icon files are text placeholders
-   Replace with actual 16x16, 32x32, 48x48, 128x128 PNG files
-   You can use any icon creation tool or find suitable icons online

### Integration with Web App

The extension integrates with the Next.js web app at `http://localhost:3000`:

-   **Generate Page**: Creates verified meeting links with embedded proofs
-   **Verify Page**: Manual verification interface for testing
-   **Verification Logic**: Extension extracts `halo_proof` URL parameter

### Next Steps (T3.2-T3.4)

1. **T3.2**: Enhanced background service worker
2. **T3.3**: Advanced popup features
3. **T3.4**: Content script optimization

## Troubleshooting

### Extension Not Loading

-   Ensure Developer Mode is enabled
-   Check console for errors in `chrome://extensions/`
-   Verify all files are present in the chrome-extension folder

### Badges Not Appearing

-   Check if the extension is enabled in the popup
-   Verify "Show trust badges" setting is enabled
-   Try manually scanning with the popup "Scan for Links" button

### Content Script Errors

-   Open Developer Tools on the web page
-   Check Console tab for Halo-related errors
-   Ensure the page URL matches the manifest's content_scripts patterns

### Background Script Issues

-   Go to `chrome://extensions/`
-   Click "Inspect views: service worker" under Halo extension
-   Check console for background script errors

## Browser Compatibility

-   **Chrome**: Full support (Manifest V3)
-   **Edge**: Should work (Chromium-based)
-   **Firefox**: Requires Manifest V2 conversion
-   **Safari**: Requires Safari Web Extension conversion

## Security Notes

-   Extension only runs on specified domains (Gmail, Discord, Teams, Slack, WhatsApp Web)
-   No sensitive data stored locally
-   All verification happens through AIR Credentials SDK
-   Uses secure message passing between components

---

**🚀 Ready to test!** Load the extension and start verifying meeting links with cryptographic proofs.
