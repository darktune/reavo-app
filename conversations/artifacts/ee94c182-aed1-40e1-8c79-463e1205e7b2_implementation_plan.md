# Implementation Plan: Phase 20 & Phase 21 — Margin Stress Simulator, Subaccount Desk, MEV Radar & Flash Loan Arbitrage

Equip **STELCERA Institutional Trading Terminal** with 4 new high-frequency desks expanding risk management, multi-account capital deployment, mempool MEV surveillance, and atomic flash loan arbitrage.

---

## User Review Required

> [!IMPORTANT]
> **Phase 20 & Phase 21 Milestones**:
> 1. **Phase 20: Margin & Liquidation Stress Test Simulator (`/margin-sim`)**:
>    - Interactive cross-margin and isolated-margin stress tester.
>    - Simulate catastrophic market drawdowns ($-10\%$ to $-80\%$) and calculate maintenance margin requirements (MMR), liquidation price cushions, and auto-deleveraging (ADL) priority scores.
>    - 1-Click "Inject Volatility Shock" to preview real-time margin calls and liquidation cascades.
> 2. **Phase 20: Multi-Account Subaccount Manager (`/subaccounts`)**:
>    - Manage and allocate capital across separated accounts (*Main Institutional Alpha*, *Delta-Neutral Basis*, *High-Beta Momentum*, *Algo Execution*).
>    - Master aggregated PnL, collective margin utilization meter, and 1-Click Inter-Account Capital Transfer.
> 3. **Phase 21: Real-Time MEV & Sandwich Attack Radar (`/mev`)**:
>    - Live mempool inspector tracking Ethereum & Solana MEV transactions (Jito searcher bundles, Flashbots builder blocks, sandwich attacks, backrun arbitrage).
>    - Extracted MEV dollar volume ($24\text{h}$), victim slippage losses, and builder gas bribe telemetry.
> 4. **Phase 21: Flash Loan Arbitrage Simulator (`/flash-loans`)**:
>    - Zero-capital triangular flash loan arbitrage routing across Aave V3, Uniswap V3, Balancer, and Curve.
>    - Visual step-by-step transaction bundle flow: Borrow $\rightarrow$ Swap Venue A $\rightarrow$ Swap Venue B $\rightarrow$ Repay Loan + Retain Net Profit with gas fee viability checks.

---

## Proposed Changes

### 1. Type Definitions & Models
#### [MODIFY] [types.ts](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/lib/types.ts)
- Add `MarginStressScenario`, `SubaccountSummary`, `MEVTransaction`, and `FlashLoanRoute` interfaces.

---

### 2. Desk Pages & Interactive Components
#### [NEW] [margin-sim-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/margin-sim-page.tsx)
#### [NEW] [app/margin-sim/page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/margin-sim/page.tsx)
- Cross/Isolated margin leverage sliders ($1\times - 100\times$), market drawdown shock buttons ($-10\%$, $-25\%$, $-50\%$, $-80\%$), liquidation distance meters, and ADL warning gauges.

#### [NEW] [subaccounts-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/subaccounts-page.tsx)
#### [NEW] [app/subaccounts/page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/subaccounts/page.tsx)
- Account switcher cards, collective equity barometer, inter-account rebalancer modal, and active position matrix per subaccount.

#### [NEW] [mev-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/mev-page.tsx)
#### [NEW] [app/mev/page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/mev/page.tsx)
- Live streaming MEV block feed, sandwich attack visualizer, extracted volume charts, and top searcher bot leaderboard.

#### [NEW] [flash-loans-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/flash-loans-page.tsx)
#### [NEW] [app/flash-loans/page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/flash-loans/page.tsx)
- Triangular flash loan routing configurator, visual multi-hop execution flow diagram, net profit calculator after flash loan fee ($0.05\%$) and gas estimation, and 1-Click "Simulate Atomic Bundle" trigger.

---

### 3. Navigation & Master Hub Integration
#### [MODIFY] [nav-bar.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/nav-bar.tsx)
- Add `/margin-sim`, `/subaccounts`, `/mev`, and `/flash-loans` links.

#### [MODIFY] [hub-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/hub-page.tsx)
- Add the 4 new desks into the Command Center with quick filters, route tags, and descriptions.

#### [MODIFY] [globals.css](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/globals.css)
- Add specialized CSS styling for liquidation cushion meters, flash loan step nodes, MEV sandwich badges, and subaccount allocation bars.

---

## Verification Plan

### Automated / Build Checks
- Verify that all new pages compile without TypeScript or CSS errors:
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:3000/margin-sim" -UseBasicParsing
  Invoke-WebRequest -Uri "http://localhost:3000/subaccounts" -UseBasicParsing
  Invoke-WebRequest -Uri "http://localhost:3000/mev" -UseBasicParsing
  Invoke-WebRequest -Uri "http://localhost:3000/flash-loans" -UseBasicParsing
  ```

### Manual Verification
1. **Margin Stress Simulator (`/margin-sim`)**: Move leverage slider to $25\times$, click "$-25\%$ Shock", and verify calculated liquidation price and margin call alerts.
2. **Subaccount Desk (`/subaccounts`)**: Perform a paper funds transfer from Main Alpha to Delta-Neutral and verify updated balances.
3. **MEV Radar (`/mev`)**: Filter by "Sandwich Attacks" and inspect the victim loss and searcher bribe breakdown.
4. **Flash Loan Arbitrage (`/flash-loans`)**: Click "Simulate Atomic Bundle" on the ETH/USDC triangular route and inspect step-by-step fill logs.
