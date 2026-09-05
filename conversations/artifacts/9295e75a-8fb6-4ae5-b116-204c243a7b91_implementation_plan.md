# SPACE Barter UI Overhaul (iOS Glass Wizard)

## Goal
The user desires the previous 4-step "Space Barter Wizard", but with a comprehensive "iOS Glass" aesthetic applied globally. Every component (input, button, card, dashboard panel) must possess a premium glass hover and shine effect, making the UI tactile and exceptionally modern, without sacrificing the underlying 4-step flow and direct MetaMask integration.

## Proposed Changes

### Component 1: Reverse AppKit & Restore Wizard (`frontend/index.html` & `app.js`)
- Revert the structure back to the 4-step guided wizard (`.wizard-step`, etc.).
- Remove Reown AppKit CDN imports and custom initialization logic.
- Re-implement a direct MetaMask connection inside `app.js`.

### Component 2: Global iOS Glassmorphism (`frontend/styles.css` & `dashboard.html`)
- **Theme:** Establish a deep dark background populated with soft glowing orbs.
- **Master Effects:** Build custom `.glass-box`, `.asset-card`, `.wizard-card`, and `.sim-input` logic relying on heavy CSS backdrop filters and multi-layered inset shadows.
- **Interactions:** Whenever the user hovers or focuses on any input, card, or button across the dApp or Dashboard, the glass effect must elevate (`translateY`), brighten, and cast a larger drop shadow, conveying tactical feedback.

## Verification Plan
1. Launch the frontend and navigate to both `http://localhost:3000/app` and `http://localhost:3000/dashboard`.
2. Inspect the global alignment of the iOS glass styling.
3. Hover across elements to verify the "shine" animations.
4. Test the MetaMask connectivity in Step 1.
