# Halo

Team: bz & swt

Halo prevents phishing, fake meeting links, and scam DMs by using onchain verifiable credentials to prove who you’re really interacting with. It’s a portable trust layer that protects you before you ever click a link or join a meeting.

---

## What it solves

-   Social engineering is the #1 attack vector (fake meeting links, fake DMs, fake funding calls).
-   Wallet signatures prove ownership, but not trust or reputation.
-   Halo adds portable, onchain trust credentials so recipients can instantly see if a link or invite is safe.

---

## How it works

-   Users connect their wallet → see or request a trust credential.
-   Generates signed meeting links tied to onchain trust proofs.
-   Recipients (via Chrome extension) auto-verify and see a ✅ trust badge or ⚠️ warning before clicking.

---

## Tech

-   AIR Account + Credential SDKs for wallet login & VCs
-   Next.js + Tailwind for the frontend
-   Chrome Extension to verify links and show trust badges
-   Optional ZK for minimal disclosure proofs

---

## Key features

-   Signed links to stop phishing
-   Portable VC trust checks across Discord, Telegram, Email
-   Never reveals balances or private data — only proves trust
-   ZK-enabled for extra privacy

---

## Quick demo

1. User connects wallet
2. Generates Google Meet link
3. Creates a signed proof of link
4. Recipient verifies link → sees “Verified”.
