# Comprehensive User Profile & UI Evolution Plan

This plan details the creation of a foolproof User Profile, an informative Wallet Selection flow, and a visual overhaul of game iconography and live guardian analytics.

## Proposed Changes

### [Web Frontend UI Overhauls]

#### 1. Universal Wallet Connection Modal
Instead of just a single "Connect MetaMask" button, clicking "Connect Wallet" will now open a visually striking **"Connect Web3 Identity"** modal. This modal will present the three wallet architectures with their Pros & Cons (Trade-offs) clearly explained.

#### 2. Cross-Game Portfolio & Custom UGC Pricing
- **Cross-Game Integration**: The Profile's **"Portfolio & Assets"** tab will display simulated holdings for all mapped game protocols (Loot, Gods Unchained, etc.).
- **UGC Asset "Perceived Value"**: In the "Minted UGC Assets" section, each item will have a **"Set Value"** button to allow manual price overrides of the mock floor price.

#### 3. iOS 26 x GameFi Iconography Redesign
Redesign all asset icons to use a **Merged Aesthetic**:
- **Design Language**: iOS 26 Glassmorphism (High-blur frosting, subtle outer glows, 1px borders).
- **Game Iconography**: Integrate specific symbols (e.g., CS2 AK-47 silhouette, Loot Bag outline, CryptoKitty whiskers) into the glassmorphic backing.
- **Dynamic Accent Glows**: Each game group (Loot, CS2, etc.) will have a unique accent glow color (Mechanical Yellow for D-MEX, Cyan for CS2, Gold for Loot).

#### 4. Live Arbiter Guardian Stats
The "Arbiter Guardian V3.0" side panel will be wired to actual simulation metrics:
- **Network Velocity**: Linked to the frequency of raw transactions from the simulated Guardian WebSocket.
- **Volatility Index**: Tied to the average price skew detected during the latest 10 evaluations.
- **Exit Tax**: Dynamically calculated based on the current Network Velocity (anti-run logic).

### [File Modifications]

#### [MODIFY] [index.html](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/index.html)
- Add IDs to the Arbiter sidebar elements for JS targeting.
- Add the markup for the new Wallet Selection Modal.

#### [MODIFY] [styles.css](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/styles.css)
- Implement `.game-icon-glass` base classes for the new iconography.
- Add specific game-theme variables (e.g., `--cs2-accent`).
- Style the new Wallet selection cards and UGC value editor.

#### [MODIFY] [app.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/app.js)
- Implement `updateArbiterSidebar()` to refresh the sidebar stats during every WebSocket broadcast.
- Update the icon rendering logic to use the new CSS-based glass icons instead of just text/background colors.
- Wire the Wallet Modal choices and UGC customization logic.

## Verification Plan

### Manual Verification
1. **Wallet Selection**: Click "Connect" and evaluate the feature/trade-off list for each wallet type.
2. **Iconography**: Browse the "Open Market" and ensure CS2/Loot icons look like premium glassmorphic objects.
3. **Arbiter Live Stats**: Propose a swap and watch the "Network Velocity" and "Volatility Index" bars in the sidebar react.
4. **UGC Value**: Mint an asset, set its value to $1000 in the profile, and verify that the "Create Swap" dropdown reflects this new value.
