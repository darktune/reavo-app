# D-MEX Protocol Implementation Plan

## Goal Description
Create a new workspace for the D-MEX Protocol, a Hybrid-Synthetic GameFi Exchange. D-MEX builds upon the UniversalVault logic but introduces a robust Peg-Defense & Monetary Policy, Synthetic Liquidity Pools (SLPs) for instant exits, and comprehensive Circuit Breakers (Anti-Spiral logic) handled by an AI Arbiter Guardian.

## Proposed Changes

### Workspace & Project Setup
- **Directory**: Create `c:\Users\USER\OneDrive\Documents\Desktop\FYP\d-mex`
- **Setup**: Initialize a new Foundry project, setup node modules for Guardian.

### D-MEX Gamified Frontend
#### [NEW] `frontend/index.html`
- A clean, state-of-the-art D-MEX dashboard serving as an "Intent-Based Barter Board".
- Features an asset selector mimicking iOS 26 dynamic island widgets.

#### [NEW] `frontend/styles.css`
- **Aesthetic**: Gamified "iOS 26" Glassmorphic. Utilizes `backdrop-filter: blur()`, rich translucent gradients (neon purples, deep blues), and modern typography (e.g. `Inter` or `Outfit`).
- Incorporates subtle micro-animations (hover effects, gradient shifting).

#### [NEW] `frontend/app.js`
- Handles UI interactions (switching tabs, mocking the "Connect Wallet" and "Propose Swap" logic).

### Core Smart Contracts
#### [NEW] `src/DMEXVault.sol` (Ported from `UniversalVault.sol`)
- **Base Architecture:** The framework and structure will identically match the previous project's `UniversalVault.sol` (including pull-payment pattern and batch swap structures), merely upgraded for the D-MEX GameFi niche.
- **Unified Executor:** Support batch atomic swaps of digital in-game assets (ERC-721 for unique items like swords/land, ERC-1155 for commodities) and game/crypto currencies (ERC-20). The core asset swapping mechanism remains intact but expanded.
- **Modifiers/Auth:** Enforce Arbiter signatures for all state-changing swaps/mints.
- **SLP Integration:** Add Synthetic Liquidity Pool mechanics for fractionalized ERC-20 shards to allow instant floor-price exits.
- **Time-Weighted Execution:** Enforce streaming execution limits for large-volume trades (e.g. users cannot dump maximum supply in one block, must stream over T periods).
- **Peg-Defense Hooks:** Process dynamic exit taxes instructed by the signed Guardian payload.

#### [NEW] `src/MockGameAssets.sol`
- Includes game assets (ERC20 for Gold/Gems, ERC721 for Unique Items, ERC1155 for Commodities) for testing the vault capabilities.

### Guardian & Arbiter Backend
#### [NEW] `guardian/arbiter.js`
- **Role 1 (Security):** Keep zkML-driven threat detection and structural checks. Add "Soft Pause" capability to halt the vault if active threat detected.
- **Role 2 (Game-State Arbiter):** Validate Barter Board intents (Ownership verification, Anti-botting heuristics).
- **Peg-Defense Engine:** Implement Sovereign Peg logic (Target $0.10). 
  - *Dynamic Exit Taxes:* Exponential tax increases on sells during de-pegging events (> 2% deviation from peg).
  - *Protocol Owned Liquidity (POL) Rebalancing:* Automated buy-backs via protocol reserves to maintain floors.
- **Circuit Breakers (Anti-Spiral):** Halt SLP issuance/trading if Velocity > 5% pool depth, Volatility > 20%, or if Asset Diversity Ratios indicate collection-specific contagion (mass sell-offs of specific NFT collections).

## Phase 2: Web3 Integration & Scroll Deployment

### [Deployment Scripts (`script/`)]
*   **[NEW] `script/DMEXDeploy.s.sol`**: A Foundry broadcast script to orchestrate the deployment of `DMEXVault.sol` and the `MockGameAssets.sol` (ERC20, ERC721, ERC1155) directly to the testnet.

### [Frontend Web3 Upgrades]
*   **[MODIFY] `frontend/index.html`**: Import the `ethers.js` v6 library via CDN to enable blockchain communication. Add a new script link to `vault-abi.js`.
*   **[NEW] `frontend/vault-abi.js`**: Store the compiled JSON ABIs and live deployed addresses for the Vault and Mock Assets.
*   **[MODIFY] `frontend/app.js`**:
    *   **Wallet Connection**: Replace the mocked timer with a real `window.ethereum` call to prompt MetaMask.
    *   **Signature Mocking**: Port a lightweight version of the `Arbiter` signing logic directly into the frontend (acting as a local mock oracle backend) to generate valid `ArbiterPayload` signatures for testing.
    *   **Transaction Execution**: Wire up the "Sign & Propose Swap" button to execute a real `executeBatchSwap` transaction on the deployed `DMEXVault` contract using the player's MetaMask wallet.

## Verification Plan

### Automated Tests
- Create and run `forge test` on `test/DMEXVault.t.sol` to verify:
  - Atomic multi-token transfers.
  - Time-weighted streaming limits.
  - Arbiter signed tax collection.
- Unit tests for `guardian/arbiter.js` Peg-Defense calculations ensuring tax exponentiation works correctly.

### Manual Verification
- Deploy standard mock tokens to local `anvil` node.
- Spin up `arbiter.js` locally.
- Execute a simulated "Anti-Spiral" scenario by crafting transactions that attempt to dump large volumes of assets, verifying that the Arbiter rejects the signature or applies the exponential dynamic penalty, and that the Vault correctly enforces it.
