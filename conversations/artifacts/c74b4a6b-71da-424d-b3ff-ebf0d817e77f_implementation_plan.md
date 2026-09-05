# Implementation Plan: Phase 19 — Trade Journaling Studio & Quantitative Copy-Trading Vaults

Equip STELCERA with institutional psychological trade attribution and alpha vault replication: an Institutional Trade Journaling & Execution Attribution Studio (`/journal`), and a Quantitative Social Copy-Trading Alpha Vaults Desk (`/copy`).

## User Review Required

> [!IMPORTANT]
> Phase 19 expands trader performance psychology and quantitative alpha replication:
> 1. **Trade Journaling & Execution Attribution Studio (`/journal`)**:
>    - **Tagging Engine**: Tag trade setups (`Planned Setup`, `Breakout Retest`, `Mean Reversion`, `FOMO / Impulse`, `News Scalp`).
>    - **Psychological Attribution**: Track emotional states (`Disciplined`, `Anxious`, `Greedy`, `Revenge`) and measure their direct impact on PnL.
>    - **Attribution Metrics**: Win Rate %, R:R multiples, and Net Profit breakdown across all setup categories.
>    - **1-Click Journal Logger**: Save interactive trade logs with notes and risk metrics.
> 2. **Quantitative Copy-Trading & Alpha Vaults Desk (`/copy`)**:
>    - **Top Trader Leaderboard**: Verified track records for quantitative strategies (*Apex Trend Quant*, *Delta Neutral Harvester*, *Mean Reversion Alpha*, *High-Beta Momentum*).
>    - **Institutional Performance Gauges**: 30D ROI %, Maximum Drawdown %, Sharpe Ratio, AUM ($M), and Copier Counts.
>    - **1-Click "Mirror Vault (Paper Simulation)"**: Instant allocation simulator to copy strategy trades in real-time.

---

## Proposed Changes

### 1. Journal & Copy-Trading Types
#### [MODIFY] [types.ts](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/lib/types.ts)
- Add `TradeJournalEntry` and `CopyTradingVault` models.

### 2. Trade Journaling UI
#### [NEW] [journal-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/journal-page.tsx)
#### [NEW] [app/journal/page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/journal/page.tsx)
- Journal Logger Form, Tag Attribution Charts, Emotional PnL Matrix, and History Cards.

### 3. Copy-Trading Alpha Vaults UI
#### [NEW] [copy-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/copy-page.tsx)
#### [NEW] [app/copy/page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/copy/page.tsx)
- Vault Leaderboards, Strategy Breakdown Cards, Sharpe/Drawdown Badges, and 1-Click Mirror Allocation Modals.

### 4. Navigation, Hub Directory & Styling
#### [MODIFY] [nav-bar.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/nav-bar.tsx)
- Add `/journal` and `/copy` navigation links.
#### [MODIFY] [hub-page.tsx](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/components/hub-page.tsx)
- Add `/journal` and `/copy` to the Master Hub Directory.
#### [MODIFY] [globals.css](file:///c:/Users/USER/OneDrive/Documents/WindowsPowerShell/frontend/app/globals.css)
- Add styles for Journal logs, psychological tags, Vault cards, and allocation meters.

---

## Verification Plan

### Automated / Build Checks
- Verify Next.js compilation across all 29 routes:
  ```powershell
  Invoke-WebRequest -Uri "http://localhost:3000/journal" -UseBasicParsing
  Invoke-WebRequest -Uri "http://localhost:3000/copy" -UseBasicParsing
  ```

### Manual Verification
1. **Trade Journal**: Open `/journal`, create a new journal entry tagged "Planned Setup", and inspect psychological attribution breakdown.
2. **Copy Trading**: Open `/copy`, click "Mirror Vault" on Apex Trend Quant, and verify paper allocation toast.
