# UI Enhancements & Testnet Testing Plan

## Proposed Changes

### 1. `frontend/index.html` & `frontend/styles.css`
- **Dashboard Redirect**: Once MetaMask is connected, we will reveal a new premium glass button/icon pointing to the `/dashboard`. This fulfills your request to have a "dashboard icon once connected" directly accessible from the "Connect to MetaMask" screen.
- **Run AI Evaluation Icon**: We will inject a custom, glass-illustrated SVG into the "Run AI Evaluation" button within the "Build Offer" step.

### 2. `guardian/dashboard.html`
- **Simulate Swap Icon**: Update the "Simulate Swap" (Run AI Evaluation) button to use the new glass UI motif.
- **Attack Node Icons (L1, L2, L3, A3)**: 
  We will replace the default emojis (`📉`, `🔄`, `🖼️`, `👥`) inside the JS `renderNodeBreakdown` function with rich, raw SVGs featuring gradient fills and soft outer glows to match the general theme.
  - **L1 (Value Drain)**: A glass-styled wallet/coins.
  - **L2 (Reentrancy)**: Futuristic looping glass arrows.
  - **L3 (Metadata Fraud)**: A shattered or glowing glass picture frame.
  - **A3 (Sybil Pumping)**: A network map of glass nodes representing clustered accounts.

## Verification & Testing Plan

### Manual Verification
1. **Connect & Dashboard Navigation**: The user will launch `app/` locally (via the live guardian server `npm start`), click "Connect Wallet", confirm MetaMask connects to **Scroll Sepolia**, and verify that the stunning new "Go to Dashboard" icon appears. Clicking it should smoothly take them to the live dashboard.
2. **Review Icons**: The user will review the aesthetic of the L1, L2, L3, and A3 icons on the dashboard and ensure they match the premium "Space" theme.
3. **Multi-Account Testing**: 
   - **Yes, you can test this!** The application is deeply integrated with MetaMask.
   - You can simply connect `Account A` in MetaMask, use the frontend to create a swap and copy the `Swap ID`.
   - Then lock the secret, switch to `Account B` in MetaMask, go to the "Execute & Accept" tab, paste the `Swap ID` and the secret, and perform the counterparty execution.
   - You will test swapping ERC-20, ERC-721, and ERC-1155 (this requires you to have fake tokens/NFTs on those accounts on Scroll Sepolia, or we can deploy dummy ones for you to mint!).
