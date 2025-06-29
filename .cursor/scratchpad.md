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

-   @mocanetwork/airkit-connector (AIR SDK connector for wagmi)
-   wagmi + viem (wallet connection & Ethereum interactions)
-   @tanstack/react-query (data fetching)
-   Next.js + Tailwind (frontend for link generation)
-   Node.js/Next API routes (signature verification)
-   Chrome Extension Manifest V3 (link scanning & badge injection)

## Key Challenges and Analysis

### Technical Challenges:

1. **Chrome Extension Integration** - Manifest V3 content scripts, message passing, cross-origin requests
2. **AIR SDK Integration** - wagmi + airkit-connector setup, partner ID configuration
3. **Cross-Platform Link Detection** - Scanning different sites (Gmail, Discord, Twitter, Calendly) with varying DOM structures
4. **Real-time Verification** - Fast API calls to check link signatures without blocking UI
5. **Signature Scheme** - Designing a simple yet secure link signing/verification system using wallet signatures

### MVP Scope Decisions:

-   Focus on Gmail + one other platform (Discord) for link detection
-   Simple signature scheme using wallet signatures
-   Stub AIR credentials if SDK integration takes too long
-   Local storage for user credentials (no backend database)

## Project Structure

```
halo/
├── frontend/                 # Next.js web application
│   ├── package.json         # Next.js dependencies & scripts
│   ├── next.config.ts       # Next.js configuration
│   ├── tailwind.config.js   # Tailwind CSS config
│   ├── tsconfig.json        # TypeScript configuration
│   ├── .env.local           # Environment variables
│   ├── app/                 # App Router (Next.js 15)
│   │   ├── page.tsx         # Landing page
│   │   ├── connect/         # Wallet connection pages
│   │   ├── generate/        # Link generation pages
│   │   ├── api/             # API routes
│   │   │   ├── verify/      # Link verification endpoint
│   │   │   └── credentials/ # Credential management
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── WalletConnect.tsx    # Wallet connection component
│   │   ├── LinkGenerator.tsx    # Signed link creation
│   │   ├── TrustBadge.tsx       # Trust badge component
│   │   └── providers/           # Context providers
│   │       └── WagmiProvider.tsx # Wagmi setup
│   └── lib/                 # Utilities
│       ├── airSdk.ts        # AIR SDK utilities
│       ├── signature.ts     # Signature utilities
│       ├── wagmiConfig.ts   # Wagmi configuration
│       └── constants.ts     # App constants
├── extension/               # Chrome extension
│   ├── manifest.json        # Chrome extension manifest
│   ├── background.js        # Service worker
│   ├── content/
│   │   ├── gmail.js         # Gmail content script
│   │   ├── discord.js       # Discord content script
│   │   └── common.js        # Shared utilities
│   ├── popup/
│   │   ├── popup.html       # Extension popup
│   │   ├── popup.js         # Popup logic
│   │   └── popup.css        # Popup styles
│   └── assets/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── README.md                # Project documentation
└── .cursor/                 # Development workspace
    └── scratchpad.md        # This planning document
```

## High-level Task Breakdown

### Phase 1: Foundation (4 hours)

-   [x] **T1.1** Setup Next.js project with Tailwind using create-next-app (15 min) ✅
-   [ ] **T1.2** Install AIR SDK dependencies in frontend/ folder (30 min)
-   [ ] **T1.3** Setup wagmi providers and configuration in frontend/ (45 min)
-   [ ] **T1.4** Create basic wallet connection page in frontend/app/ (45 min)
-   [ ] **T1.5** Implement signature utilities in frontend/lib/ (60 min)
-   [ ] **T1.6** Create link verification API endpoint in frontend/app/api/ (45 min)

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

-   [ ] Install AIR SDK dependencies
-   [ ] Setup wagmi providers
-   [ ] Implement wallet connection
-   [ ] Create link signing system
-   [ ] Build Chrome extension
-   [ ] Integrate link detection
-   [ ] Test complete flow

### In Progress

-   Phase 1: Foundation setup

### Done

-   [x] Project planning and structure design
-   [x] Next.js project setup with TypeScript + Tailwind CSS in frontend/ folder (T1.1)

## Current Status / Progress Tracking

**Current Phase:** Planning - AIR SDK Dependencies Analysis  
**Next Action:** Install missing AIR SDK dependencies in frontend/ folder  
**Blockers:** Need to obtain Partner ID from MOCA Network for AIR SDK  
**Est. Completion:** T+16 hours from start

**Recent Updates:**

-   ✅ Next.js project successfully created in `frontend/` folder
-   ✅ Project structure updated to reflect frontend/ organization
-   ✅ Next.js 15 + TypeScript + Tailwind CSS v4 + ESLint configured
-   ❌ Missing ALL AIR SDK dependencies in frontend/package.json
-   Identified exact dependencies needed from airkit-example-main comparison

## Executor's Feedback or Assistance Requests

### T1.1 Completed Successfully! ✅

**Status:** Next.js project created in `frontend/` folder

-   ✅ Next.js 15.3.4 with App Router
-   ✅ TypeScript 5 configured
-   ✅ Tailwind CSS v4 setup
-   ✅ ESLint configuration
-   ✅ React 19

**Next Task for Executor:** T1.2 - Install AIR SDK dependencies

**Working Directory:** All future frontend tasks should work in `frontend/` folder

**Command for T1.2:**

```bash
cd frontend && npm install @mocanetwork/airkit-connector @tanstack/react-query wagmi viem tailwind-merge jose
```

**Missing Dependencies Analysis:**

-   ❌ @mocanetwork/airkit-connector: ^1.4.2 (core AIR SDK)
-   ❌ @tanstack/react-query: ^5.75.5 (data fetching)
-   ❌ wagmi: ^2.15.6 (wallet connection)
-   ❌ viem: ^2.29.0 (Ethereum interactions)
-   ❌ tailwind-merge: ^3.2.0 (Tailwind utilities)
-   ❌ jose: ^6.0.11 (JWT handling for credentials)

**Ready for Executor Mode:** Yes, proceed with T1.2

## Correct Next.js Setup Command

**Command:** `npx create-next-app@latest halo-mvp --typescript --tailwind --eslint --app --use-npm`

**Rationale:** This command will:

-   Create Next.js project with TypeScript support
-   Automatically setup Tailwind CSS
-   Include ESLint configuration
-   Use the new App Router (recommended)
-   Use npm as package manager
-   Create proper project structure with all necessary config files

**Alternative if we want to setup in current directory:**
`npx create-next-app@latest . --typescript --tailwind --eslint --app --use-npm`

## Starter Code Snippets

### Target Package.json Structure (frontend/package.json after T1.2)

```json
{
	"name": "frontend",
	"version": "0.1.0",
	"private": true,
	"scripts": {
		"dev": "next dev",
		"build": "next build",
		"start": "next start",
		"lint": "next lint"
	},
	"dependencies": {
		"next": "15.3.4",
		"react": "^19.0.0",
		"react-dom": "^19.0.0",
		"@mocanetwork/airkit-connector": "^1.4.2",
		"@tanstack/react-query": "^5.75.5",
		"wagmi": "^2.15.6",
		"viem": "^2.29.0",
		"tailwind-merge": "^3.2.0",
		"jose": "^6.0.11"
	},
	"devDependencies": {
		"typescript": "^5",
		"@types/node": "^20",
		"@types/react": "^19",
		"@types/react-dom": "^19",
		"@tailwindcss/postcss": "^4",
		"tailwindcss": "^4",
		"eslint": "^9",
		"eslint-config-next": "15.3.4",
		"@eslint/eslintrc": "^3"
	}
}
```

### Wallet Connect Hook Stub

```javascript
// lib/airSdk.js
import { useAccount, useConnect, useDisconnect, useConfig } from 'wagmi';

export const useWalletConnection = () => {
	const { address, isConnected, chainId } = useAccount();
	const { connect, isPending: isConnecting } = useConnect();
	const { disconnect, isPending: isDisconnecting } = useDisconnect();
	const config = useConfig();

	const connectWallet = async () => {
		try {
			const airConnector = config.connectors.find(
				(connector) => connector?.isMocaNetwork
			);

			if (!airConnector) {
				throw new Error('AIR connector not found');
			}

			await connect({ connector: airConnector });
			return { success: true, address };
		} catch (error) {
			return { success: false, error: error.message };
		}
	};

	return {
		connectWallet,
		disconnect,
		address,
		isConnected,
		isConnecting,
		isDisconnecting,
		chainId,
	};
};
```

### AIR SDK Configuration

```javascript
// lib/wagmiConfig.js
import { airConnector } from '@mocanetwork/airkit-connector';
import { createConfig, http } from 'wagmi';
import { BUILD_ENV } from '@mocanetwork/airkit';

export const getWagmiConfig = (partnerId) => {
	const connectors = [
		airConnector({
			buildEnv: BUILD_ENV.SANDBOX, // or BUILD_ENV.PRODUCTION
			enableLogging: true,
			partnerId,
		}),
	];

	return createConfig({
		chains: [
			/* your supported chains */
		],
		transports: {
			// your chain transports
		},
		connectors,
	});
};
```

## AIR Credentials Stubbing Strategy

**Option 1 - Full AIR Integration:** Use AirService for credential management:

-   Use wagmi + airkit-connector for wallet connection
-   Access AirService through the connector for credential operations
-   Partner ID is required for initialization
-   Follow example patterns from airkit-example-main

**Option 2 - Partial Integration:** If credential features are complex:

-   Use wagmi + airkit-connector for wallet connection only
-   Implement custom credential schema using wallet signatures
-   Store credentials in localStorage
-   Create simple verification API using signature recovery

**Option 3 - Full Stub:** Fallback if AIR SDK has issues:

-   Mock the airConnector interface
-   Use standard wallet connection libraries
-   Implement simple signature-based verification

**Critical Requirements:**

-   Partner ID must be obtained for AIR SDK
-   BuildEnv should be SANDBOX for development
-   Follow wagmi patterns for React integration

**Fallback Timeline:** Allocate max 2 hours for full AIR integration before falling back to partial approach.

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

### From airkit-example-main Analysis:

1. **Correct AIR SDK Dependencies:**

    - Use `@mocanetwork/airkit-connector` not `@air/account-sdk`
    - Requires `wagmi`, `viem`, and `@tanstack/react-query`
    - Uses standard wagmi patterns for wallet connection

2. **Partner ID Requirement:**

    - AIR SDK requires a partner ID for initialization
    - Need to obtain partner ID from MOCA Network
    - Partner ID is passed to airConnector configuration

3. **Configuration Pattern:**

    - Use `BUILD_ENV.SANDBOX` for development
    - airConnector integrates with wagmi's connector system
    - Access AirService through connector.airService

4. **Wallet Connection Flow:**

    - Find connector with `connector?.isMocaNetwork` property
    - Use standard wagmi useConnect hook
    - Connection state managed through wagmi hooks

5. **Project Structure Decision:**

    - Next.js project created in `frontend/` subfolder due to directory conflicts
    - All web app files are in `frontend/` directory
    - Chrome extension will be in separate `extension/` folder at root level
    - Executor must work in `frontend/` folder for all web app tasks

6. **AIR SDK Dependencies Required:**
    - @mocanetwork/airkit-connector: ^1.4.2 (core AIR SDK connector)
    - @tanstack/react-query: ^5.75.5 (async state management)
    - wagmi: ^2.15.6 (React hooks for Ethereum)
    - viem: ^2.29.0 (low-level Ethereum library)
    - tailwind-merge: ^3.2.0 (Tailwind utility merging)
    - jose: ^6.0.11 (JWT operations for credentials)

_[Additional lessons learned during implementation will be documented here]_
