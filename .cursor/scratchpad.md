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
-   [x] **T1.2** Install AIR SDK dependencies in frontend/ folder (30 min) ✅
-   [x] **T1.3** Setup wagmi providers and configuration in frontend/ (45 min) ✅
-   [x] **T1.4** Create basic wallet connection page in frontend/app/ (45 min) ✅
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

-   [ ] Create link signing system
-   [ ] Build Chrome extension
-   [ ] Integrate link detection
-   [ ] Test complete flow

### In Progress

-   Phase 1: Foundation setup (4/6 tasks complete)

### Done

-   [x] Project planning and structure design
-   [x] Next.js project setup with TypeScript + Tailwind CSS in frontend/ folder (T1.1)
-   [x] Install AIR SDK dependencies in frontend/ folder (T1.2)
-   [x] Setup wagmi providers and configuration in frontend/ folder (T1.3)
-   [x] Create basic wallet connection page and components (T1.4)

## Current Status / Progress Tracking

**Current Phase:** Execution - Foundation setup 67% complete  
**Next Action:** T1.5 - Implement signature utilities for link signing  
**Blockers:** None - ready for signature implementation  
**Est. Completion:** T+16 hours from start

**Recent Updates:**

-   ✅ Next.js project successfully created in `frontend/` folder
-   ✅ Project structure updated to reflect frontend/ organization
-   ✅ Next.js 15 + TypeScript + Tailwind CSS v4 + ESLint configured
-   ✅ AIR SDK dependencies successfully installed (T1.2 complete)
-   ✅ Partner ID obtained: efaadeae-e2bb-4327-8ffe-e43933c3922a
-   ✅ Wagmi providers and AIR SDK configuration complete (T1.3 complete)
-   ✅ Fixed AuthMessageService singleton issue
-   ✅ Wallet connection page and components implemented (T1.4 complete)

## Executor's Feedback or Assistance Requests

### T1.3 Completed Successfully! ✅

**Status:** Wagmi providers and AIR SDK configuration successfully implemented

**Files Created:**

-   ✅ `frontend/lib/wagmiConfig.ts` - Wagmi config with singleton pattern
-   ✅ `frontend/components/providers/WagmiProvider.tsx` - Provider wrapper
-   ✅ Updated `frontend/app/layout.tsx` - Integrated providers and updated metadata

**Critical Issue Resolved:**

-   ❌ **Error:** "AuthMessageService already created"
-   ✅ **Solution:** Implemented singleton pattern in wagmiConfig to prevent multiple AIR SDK instances
-   ✅ **Testing:** Next.js dev server running successfully on port 3001

### T1.4 Completed Successfully! ✅

**Status:** Wallet connection page and components successfully implemented

**Files Created:**

-   ✅ `frontend/lib/airSdk.ts` - AIR SDK utility hooks (useWalletConnection, useAirkit)
-   ✅ `frontend/components/WalletConnect.tsx` - Complete wallet connection component
-   ✅ `frontend/app/connect/page.tsx` - Dedicated wallet connection page
-   ✅ Updated `frontend/app/page.tsx` - Beautiful landing page with navigation

**Features Implemented:**

-   ✅ Connect/disconnect wallet functionality
-   ✅ Connection status display with address and network
-   ✅ Loading states and error handling
-   ✅ Responsive UI with Tailwind CSS
-   ✅ Navigation between landing page and connect page

**Next Task for Executor:** T1.5 - Implement signature utilities for link signing

**Files to Create for T1.5:**

1. `frontend/lib/signature.ts` - Link signing and verification utilities
2. Update `frontend/lib/airSdk.ts` - Add credential management hooks
3. Create signature scheme for meeting links

**Ready for Executor Mode:** Yes, proceed with T1.5

### Complete T1.3 Code Snippets

**1. WagmiProvider.tsx:**

```typescript
// frontend/components/providers/WagmiProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { getWagmiConfig } from '../../lib/wagmiConfig';
import { ReactNode, useMemo } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
	const config = useMemo(() => getWagmiConfig(), []);

	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</WagmiProvider>
	);
}
```

**2. Layout.tsx Update:**

```typescript
// Add import to frontend/app/layout.tsx
import { Providers } from '../components/providers/WagmiProvider';

// Wrap children with Providers in the return statement
```

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

```typescript
// frontend/lib/wagmiConfig.ts
import { airConnector } from '@mocanetwork/airkit-connector';
import { createConfig, http } from 'wagmi';
import { BUILD_ENV } from '@mocanetwork/airkit';
import { type Chain } from 'viem';

// Moca Chain Testnet Configuration
export const mocaChain: Chain = {
	id: 5151,
	name: 'Moca',
	nativeCurrency: {
		name: 'Moca',
		symbol: 'MOCA',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ['https://devnet-rpc-eu.mocachain.org'],
		},
	},
	blockExplorers: {
		default: {
			name: 'Moca Devenet Explorer',
			url: 'https://devnet-scan.mocachain.org',
		},
	},
};

// Partner ID for Halo MVP
export const PARTNER_ID = 'efaadeae-e2bb-4327-8ffe-e43933c3922a';

export const getWagmiConfig = () => {
	const connectors = [
		airConnector({
			buildEnv: BUILD_ENV.SANDBOX,
			enableLogging: true,
			partnerId: PARTNER_ID,
		}),
	];

	return createConfig({
		chains: [mocaChain],
		transports: {
			[mocaChain.id]: http(),
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

7. **T1.2 Completion:**

    - Dependencies successfully installed by user manually
    - Newer versions installed: react-query ^5.81.5, viem ^2.31.4, tailwind-merge ^3.3.1
    - All required packages now available for wagmi provider setup

8. **Critical AIR SDK Configuration:**

    - Partner ID: efaadeae-e2bb-4327-8ffe-e43933c3922a
    - Moca Chain ID: 5151
    - RPC URL: https://devnet-rpc-eu.mocachain.org
    - Build Environment: SANDBOX for development
    - All configuration values now available for implementation

9. **AuthMessageService Singleton Issue:**
    - **Problem:** "AuthMessageService already created" error in development
    - **Cause:** React development mode re-mounting components creates multiple AIR SDK instances
    - **Solution:** Implemented singleton pattern in wagmiConfig.ts with `let wagmiConfig: Config | null = null`
    - **Result:** Prevents multiple initialization, stable development environment

_[Additional lessons learned during implementation will be documented here]_
