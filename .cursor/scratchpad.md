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

-   @mocanetwork/air-credential-sdk (MANDATORY - Full verifiable credentials system)
-   @mocanetwork/airkit-connector (AIR SDK connector for wagmi)
-   wagmi + viem (wallet connection & Ethereum interactions)
-   @tanstack/react-query (data fetching)
-   Next.js + Tailwind (frontend for link generation)
-   AIR Credentials Dashboard (schema & credential management)
-   Chrome Extension Manifest V3 (link scanning & credential verification)

## Key Challenges and Analysis

### Technical Challenges:

1. **🚨 AIR Credentials SDK Integration** - MANDATORY full verifiable credentials system (not simple signatures)
2. **Dashboard Configuration** - Manual setup of schemas, credentials, and verification programs
3. **Credential Issuance Flow** - Implementing ZK-proof based credential creation for meeting links
4. **Chrome Extension Integration** - Manifest V3 content scripts, message passing, credential verification
5. **Cross-Platform Link Detection** - Scanning different sites (Gmail, Discord, Twitter, Calendly) with varying DOM structures
6. **ZK Verification Performance** - Fast credential verification without blocking UI
7. **Privacy-Preserving Proofs** - Using zero-knowledge proofs to verify trust without revealing sensitive data

### MVP Scope Decisions:

-   🚨 **MANDATORY: Full AIR Credentials SDK integration** (no simple signatures allowed)
-   Focus on Gmail + one other platform (Discord) for link detection
-   "Meeting Link Trust" credential schema with basic fields (URL, creator, timestamp, platform)
-   Manual dashboard setup for schemas and verification programs
-   Local wallet storage for issued credentials (managed by AIR SDK)

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
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx       # Navigation header with wallet
│   │   │   └── WalletButton.tsx # Compact wallet connect button
│   │   ├── WalletConnect.tsx    # Full wallet connection component (legacy)
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

### Phase 1: Foundation + Credentials SDK Setup (5 hours)

-   [x] **T1.1** Setup Next.js project with Tailwind using create-next-app (15 min) ✅
-   [x] **T1.2** Install AIR SDK dependencies in frontend/ folder (30 min) ✅
-   [x] **T1.3** Setup wagmi providers and configuration in frontend/ (45 min) ✅
-   [x] **T1.4** Create basic wallet connection page in frontend/app/ (45 min) ✅
-   [x] **T1.4b** Refactor to navigation header with global wallet state (30 min) ✅
-   [ ] **T1.5-NEW** Install AIR Credentials SDK package (15 min)
-   [ ] **T1.6-NEW** 🚨 MANUAL: Complete dashboard setup (schema, credentials, verification program) (90 min)
-   [ ] **T1.7-NEW** Configure credentials SDK integration in frontend/lib/ (75 min)
-   [ ] **T1.8-NEW** Create credential verification API endpoint in frontend/app/api/ (45 min)

### Phase 2: Credential Issuance & Management (4 hours)

-   [ ] **T2.1-NEW** Build credential issuance UI for "Meeting Link Trust" (60 min)
-   [ ] **T2.2-NEW** Implement credential creation flow using AIR SDK (90 min)
-   [ ] **T2.3-NEW** Add credential verification interface (60 min)
-   [ ] **T2.4-NEW** Update landing page to explain credential-based trust system (30 min)

### Phase 3: Chrome Extension Foundation (3 hours)

-   [ ] **T3.1** Setup Chrome extension manifest V3 structure (30 min)
-   [ ] **T3.2** Create background service worker (45 min)
-   [ ] **T3.3** Build popup interface for extension (45 min)
-   [ ] **T3.4** Implement content script injection system (60 min)

### Phase 4: Credential-Based Link Detection & Verification (4 hours)

-   [ ] **T4.1** Create Gmail content script for link detection (90 min)
-   [ ] **T4.2-NEW** Build AIR credential verification integration in extension (75 min)
-   [ ] **T4.3** Implement ZK-proof based trust badge injection system (75 min)
-   [ ] **T4.4** Add Discord content script (30 min)

### Phase 5: Integration & Testing (2 hours)

-   [ ] **T5.1** End-to-end testing of complete flow (45 min)
-   [ ] **T5.2** Bug fixes and UX improvements (45 min)
-   [ ] **T5.3** Demo preparation and documentation (30 min)

## Project Status Board

### Todo

-   [ ] 🚨 **PRIORITY:** Install AIR Credentials SDK package
-   [ ] 🚨 **MANUAL:** Complete dashboard setup (schema, credentials, verification program)
-   [ ] Configure credentials SDK integration
-   [ ] Build credential issuance UI
-   [ ] Implement ZK-proof verification in Chrome extension
-   [ ] Integrate link detection with credential verification
-   [ ] Test complete credential flow

### In Progress

-   🚨 CRITICAL PIVOT: Phase 1 Extended (5/8 tasks complete - 63%)
-   Awaiting manual dashboard setup before proceeding with credentials SDK integration

### Done

-   [x] Project planning and structure design
-   [x] Next.js project setup with TypeScript + Tailwind CSS in frontend/ folder (T1.1)
-   [x] Install AIR SDK dependencies in frontend/ folder (T1.2)
-   [x] Setup wagmi providers and configuration in frontend/ folder (T1.3)
-   [x] Create basic wallet connection page and components (T1.4)
-   [x] Refactor to navigation header with global wallet state (T1.4b)

## Current Status / Progress Tracking

**Current Phase:** 🚨 CRITICAL PIVOT - AIR Credentials SDK Integration (MANDATORY)  
**Next Action:** T1.5-NEW - Install AIR Credentials SDK, then T1.6-NEW Manual Dashboard Setup  
**Blockers:** Dashboard configuration required - manual setup of schemas, credentials, verification programs  
**Est. Completion:** T+17 hours from start (extended due to credentials complexity)

**Recent Updates:**

-   ✅ Next.js project successfully created in `frontend/` folder
-   ✅ Project structure updated to reflect frontend/ organization
-   ✅ Next.js 15 + TypeScript + Tailwind CSS v4 + ESLint configured
-   ✅ AIR SDK dependencies successfully installed (T1.2 complete)
-   ✅ Partner ID obtained: efaadeae-e2bb-4327-8ffe-e43933c3922a
-   ✅ Wagmi providers and AIR SDK configuration complete (T1.3 complete)
-   ✅ Fixed AuthMessageService singleton issue
-   ✅ Wallet connection page and components implemented (T1.4 complete)
-   ✅ **UX Refactor Complete:** Professional header with global wallet state (T1.4b complete)
-   🚨 **MANDATORY PIVOT:** Full AIR Credentials SDK integration required for hackathon
-   ❌ **Previous Analysis Obsolete:** Simple wallet signatures NOT allowed - must use formal credentials

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

### T1.4b Completed Successfully! ✅

**Status:** Navigation header with global wallet state successfully implemented

**Files Created:**

-   ✅ `frontend/components/layout/Header.tsx` - Professional navigation header
-   ✅ `frontend/components/layout/WalletButton.tsx` - Compact wallet button with dropdown

**Files Modified:**

-   ✅ `frontend/lib/airSdk.ts` - Added formatAddress utility function
-   ✅ `frontend/app/layout.tsx` - Integrated header on all pages
-   ✅ `frontend/app/page.tsx` - Updated CTA buttons and responsive design

**Features Implemented:**

-   ✅ Professional header with logo, navigation, and wallet button
-   ✅ Compact wallet button with 3 states (disconnected/connecting/connected)
-   ✅ Dropdown with full address, network info, and disconnect button
-   ✅ Responsive mobile design with hamburger menu
-   ✅ Global wallet state visible on all pages
-   ✅ Address formatting utility (0x1234...5678)
-   ✅ Professional web3 UX following industry standards

**UX Improvements:**

-   ❌ **Before:** Separate `/connect` page, awkward navigation
-   ✅ **After:** Header-based wallet connection, always accessible
-   ✅ **Standard Pattern:** Follows Uniswap/OpenSea/MetaMask style
-   ✅ **Global State:** Wallet status visible everywhere

### AIR Credentials SDK Analysis Complete! 📋

**What is AIR Credentials SDK:**

-   `@mocanetwork/air-credential-sdk` - Full verifiable credentials (VC) system
-   **Issue** formal digital credentials (like degrees, certifications, professional licenses)
-   **Verify** credentials through standardized verification flows
-   Designed for institutional credential management (schools, employers, governments)

**vs. AIR Kit Connector (what we have):**

-   `@mocanetwork/airkit-connector` - Wallet connection and basic blockchain interactions
-   Simpler, focused on wallet auth and signing

**Decision for T1.5:**

✅ **Recommended: Simple Wallet Signatures (MVP approach)**

-   Use connected wallet to sign meeting link data
-   Fast to implement, perfect for 16-hour hackathon
-   Chrome extension can verify signatures easily
-   Upgradeable to full credentials later

❌ **Not Recommended: Full AIR Credentials (overkill for MVP)**

-   Requires issuer/verifier infrastructure setup
-   Complex credential management workflows
-   Better suited for formal verification systems
-   Would consume too much hackathon time

**Next Task for Executor:** T1.5 - Implement simple signature utilities for link signing

**Files to Create for T1.5:**

1. `frontend/lib/signature.ts` - Wallet-based link signing and verification utilities
2. Update `frontend/lib/airSdk.ts` - Add simple signing hooks
3. Create signature scheme: `url + timestamp + signer -> wallet signature`

**Future Enhancement:** After MVP success, could upgrade to AIR Credentials for organizational trust

❌ **OBSOLETE:** This analysis is no longer valid due to mandatory credentials SDK requirement

## 🚨 MANDATORY DASHBOARD SETUP TASKS

### Required Manual Configuration (T1.6-NEW - 90 minutes)

**Prerequisites:**

1. **Login to Sandbox Dashboard:** https://developers.sandbox.air3.com/dashboard

    - Connect with your EOA wallet
    - Ensure you have access with Partner ID: efaadeae-e2bb-4327-8ffe-e43933c3922a

2. **Generate API Key:**

    - Navigate to: https://developers.sandbox.air3.com/api-key
    - Generate and securely store API key for SDK integration

3. **Copy Issuer DID:**

    - Copy the Issuer DID from dashboard for .env configuration

4. **Fund Fee Wallet:**
    - Copy address from Fee wallet tab in dashboard
    - Fund with MOCA tokens: https://devnet-scan.mocachain.org/faucet

**Schema Creation (Meeting Link Trust):**

-   Navigate to: https://developers.sandbox.air3.com/schema
-   Create schema with fields:
    ```
    meeting_url: String (the actual meeting link)
    creator_address: String (wallet address of link creator)
    timestamp: Date (when credential was issued)
    platform: String (e.g. "Zoom", "Google Meet", "Teams")
    trust_level: String (e.g. "verified", "organization")
    ```

**Credential Creation:**

-   Navigate to: https://developers.sandbox.air3.com/credential
-   Create credential using the "Meeting Link Trust" schema above
-   Note the credential ID for SDK integration

**Verification Program:**

-   Navigate to: https://developers.sandbox.air3.com/verification
-   Create program to verify "trusted meeting links"
-   Configure verification conditions (e.g., check if creator_address matches expected signer)
-   Note the program ID for Chrome extension integration

### Dashboard Values Needed for .env:

```
NEXT_PUBLIC_AIR_API_KEY=<from step 2>
NEXT_PUBLIC_ISSUER_DID=<from step 3>
NEXT_PUBLIC_CREDENTIAL_ID=<from credential creation>
NEXT_PUBLIC_PROGRAM_ID=<from verification program>
NEXT_PUBLIC_PARTNER_ID=efaadeae-e2bb-4327-8ffe-e43933c3922a
```

**Status:** ⏳ WAITING FOR USER TO COMPLETE DASHBOARD SETUP
**Next:** After values provided, proceed with T1.7-NEW (SDK integration)

### T1.4b Code Structure Plan

**1. Header Component Structure:**

```typescript
// frontend/components/layout/Header.tsx
- Logo/brand on left
- Navigation links in center (Home, Generate)
- Wallet button on right
- Responsive mobile hamburger menu
```

**2. Wallet Button States:**

```typescript
// frontend/components/layout/WalletButton.tsx
// State 1: Disconnected
<button>Connect Wallet</button>

// State 2: Connecting
<button disabled>Connecting...</button>

// State 3: Connected
<div>
  <span>0x1234...5678</span>
  <button>Disconnect</button>
</div>
```

**3. Address Formatting Utility:**

```typescript
// Add to frontend/lib/airSdk.ts
export const formatAddress = (address: string) => {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
```

**4. Layout Integration:**

```typescript
// frontend/app/layout.tsx
<body>
	<Providers>
		<Header />
		{children}
	</Providers>
</body>
```

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

10. **Wallet Connection UX Anti-Pattern:**

    - **Problem:** Created separate `/connect` page for wallet connection - not standard web3 UX
    - **Standard Pattern:** Header/navbar with wallet button, global state, no page navigation required
    - **Solution Plan:** Refactor to navigation header with compact wallet button
    - **Best Practice:** Keep wallet connection contextual and always accessible

11. **🚨 MANDATORY AIR Credentials SDK Requirement:**
    - **@mocanetwork/airkit-connector:** Wallet connection + basic blockchain interactions (still needed)
    - **@mocanetwork/air-credential-sdk:** Full verifiable credentials system (MANDATORY for hackathon)
    - **❌ Previous Decision Reversed:** Simple wallet signatures NOT allowed for hackathon
    - **New Requirement:** Must implement full credential issuance, ZK proofs, and verification flows
    - **Dashboard Dependency:** Manual setup of schemas, credentials, and verification programs required

_[Additional lessons learned during implementation will be documented here]_
