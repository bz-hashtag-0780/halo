# Halo MVP - Social Engineering Prevention Tool

## Background and Motivation

**Project:** Halo - Prevents social engineering by verifying meeting links & senders using onchain credentials.

**Core Problem:** Social engineering attacks through fake meeting links in communications (Gmail Discord, Twitter, Calendly).

**Solution:** Chrome extension + Web app that:

-   Allows users to connect wallet and generate signed trust credentials
-   Enables creation of signed/verified meeting links
-   Highlights verified vs unverified links with trust badges in browser
-   Prevents users from clicking malicious links from unverified senders

**Timeline:** 16 hours hackathon MVP

**Tech Stack:**

-   AIR Account SDK (wallet login & identity)
-   AIR Credential SDK (issuing & verifying credentials)
-   Next.js + Tailwind (frontend for link generation)
-   Node.js/Next API routes (signature verification)
-   Chrome Extension Manifest V3 (link scanning & badge injection)

## Key Challenges and Analysis

### Technical Challenges:

1. **Chrome Extension Integration** - Manifest V3 content scripts, message passing, cross-origin requests
2. **AIR SDK Integration** - Learning curve for wallet connection and credential management
3. **Cross-Platform Link Detection** - Scanning different sites (Gmail, Discord, Twitter, Calendly) with varying DOM structures
4. **Real-time Verification** - Fast API calls to check link signatures without blocking UI
5. **Signature Scheme** - Designing a simple yet secure link signing/verification system

### MVP Scope Decisions:

-   Focus on Gmail + one other platform (Discord) for link detection
-   Simple signature scheme using wallet signatures
-   Stub AIR credentials if SDK integration takes too long
-   Local storage for user credentials (no backend database)

## Project Structure

```
halo/
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.local
├── pages/
│   ├── index.js              # Landing page
│   ├── connect.js            # Wallet connection
│   ├── generate.js           # Link generation
│   └── api/
│       ├── verify.js         # Link verification endpoint
│       └── credentials.js    # Credential management
├── components/
│   ├── WalletConnect.js      # Wallet connection component
│   ├── LinkGenerator.js      # Signed link creation
│   └── TrustBadge.js         # Trust badge component
├── lib/
│   ├── airSdk.js            # AIR SDK utilities
│   ├── signature.js         # Signature utilities
│   └── constants.js         # App constants
├── styles/
│   └── globals.css
└── extension/
    ├── manifest.json        # Chrome extension manifest
    ├── background.js        # Service worker
    ├── content/
    │   ├── gmail.js         # Gmail content script
    │   ├── discord.js       # Discord content script
    │   └── common.js        # Shared utilities
    ├── popup/
    │   ├── popup.html       # Extension popup
    │   ├── popup.js         # Popup logic
    │   └── popup.css        # Popup styles
    └── assets/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

## High-level Task Breakdown

### Phase 1: Foundation (4 hours)

-   [ ] **T1.1** Setup Next.js project with Tailwind (30 min)
-   [ ] **T1.2** Install and configure AIR Account SDK (45 min)
-   [ ] **T1.3** Create basic wallet connection page (45 min)
-   [ ] **T1.4** Implement signature utilities for link signing (60 min)
-   [ ] **T1.5** Create link verification API endpoint (60 min)

### Phase 2: Web App Core Features (3 hours)

-   [ ] **T2.1** Build link generation page with form (45 min)
-   [ ] **T2.2** Implement signed link creation logic (60 min)
-   [ ] **T2.3** Add basic credential management (stub if needed) (45 min)
-   [ ] **T2.4** Create simple landing page with flow explanation (30 min)

### Phase 3: Chrome Extension Foundation (3 hours)

-   [ ] **T3.1** Setup Chrome extension manifest V3 structure (30 min)
-   [ ] **T3.2** Create background service worker (45 min)
-   [ ] **T3.3** Build popup interface for extension (45 min)
-   [ ] **T3.4** Implement content script injection system (60 min)

### Phase 4: Link Detection & Verification (4 hours)

-   [ ] **T4.1** Create Gmail content script for link detection (90 min)
-   [ ] **T4.2** Build verification API integration in extension (60 min)
-   [ ] **T4.3** Implement trust badge injection system (60 min)
-   [ ] **T4.4** Add Discord content script (30 min)

### Phase 5: Integration & Testing (2 hours)

-   [ ] **T5.1** End-to-end testing of complete flow (45 min)
-   [ ] **T5.2** Bug fixes and UX improvements (45 min)
-   [ ] **T5.3** Demo preparation and documentation (30 min)

## Project Status Board

### Todo

-   [ ] Setup project foundation
-   [ ] Implement wallet connection
-   [ ] Create link signing system
-   [ ] Build Chrome extension
-   [ ] Integrate link detection
-   [ ] Test complete flow

### In Progress

-   Planning phase

### Done

-   [x] Project planning and structure design

## Current Status / Progress Tracking

**Current Phase:** Planning  
**Next Action:** Setup Next.js project foundation  
**Blockers:** None identified yet  
**Est. Completion:** T+16 hours from start

## Executor's Feedback or Assistance Requests

_[Executor will update this section with progress reports and requests for assistance]_

## First File to Create

**File:** `package.json`  
**Rationale:** Foundation file that defines dependencies and scripts for the entire project

## Starter Code Snippets

### Basic Package.json Structure

```json
{
	"name": "halo-mvp",
	"version": "0.1.0",
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start"
	},
	"dependencies": {
		"next": "^14.0.0",
		"react": "^18.2.0",
		"react-dom": "^18.2.0",
		"tailwindcss": "^3.3.0",
		"@air/account-sdk": "latest",
		"@air/credential-sdk": "latest"
	}
}
```

### Wallet Connect Hook Stub

```javascript
// lib/airSdk.js
import { useAccount } from '@air/account-sdk';

export const useWalletConnection = () => {
	const { connect, disconnect, account, isConnected } = useAccount();

	const connectWallet = async () => {
		try {
			await connect();
			return { success: true, account };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	return {
		connectWallet,
		disconnect,
		account,
		isConnected,
	};
};
```

## AIR Credentials Stubbing Strategy

**Option 1 - Full Stub:** If AIR Credential SDK is problematic:

-   Create mock credential objects with { id, issuer, subject, signature }
-   Use standard wallet signatures for link signing
-   Store credentials in localStorage
-   Implement verification using signature recovery

**Option 2 - Partial Integration:** If AIR Account SDK works but Credentials don't:

-   Use AIR Account for wallet connection only
-   Implement custom credential schema
-   Use connected wallet for signing link data
-   Create simple verification API that checks signatures

**Fallback Timeline:** Allocate max 2 hours for AIR SDK integration before falling back to stub approach.

## Mini README

```markdown
# Halo MVP - Social Engineering Prevention

Prevents social engineering attacks by verifying meeting links with onchain credentials.

## Quick Start

1. `npm install && npm run dev` - Start web app
2. Visit `http://localhost:3000` - Connect wallet & generate signed links
3. Load `./extension` folder in Chrome Developer Mode
4. Extension will highlight verified/unverified links in Gmail

## Demo Flow

1. Connect wallet on web app
2. Generate signed meeting link
3. Send link via Gmail
4. Recipient sees trust badge indicating verified sender
```

## Lessons

_[Lessons learned during implementation will be documented here]_
