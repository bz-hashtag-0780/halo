# Halo

Team: bz & swt

Prevent social engineering with verifiable credentials.
Halo proves who you’re meeting before you ever join a google meeting.

---

## What it solves

-   Social engineering is the #1 attack vector (fake meeting links, fake DMs, fake funding calls).
-   Wallet signatures prove ownership, but not trust or reputation.
-   Halo adds portable, onchain trust credentials so recipients can instantly see if a link or invite is safe.

---

## How it works

-   Connect Wallet: User connects their wallet via the AIR Account SDK.
-   Verify Credentials: User verify their credentials to create a Halo Link
-   Share: Sends halo.link through email
-   Recipient Verifies: Recipient’s Chrome extension detects the link and requires them to prove their own credentials.
-   Link Unlocks: Only after both sides prove who they are does the actual meeting link (Google Meet) unlock.
-   Trusted Meeting: Both parties meet knowing exactly who is on the other side.
