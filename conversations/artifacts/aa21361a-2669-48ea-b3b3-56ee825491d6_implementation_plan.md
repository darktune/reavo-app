# STELCERA Terminal — Comprehensive Fix Plan

## Scope

1. **Fix blank chart** — data-driven viewport calculation
2. **iOS 26 glassmorphic icons** — STELCERA gold palette across all UI
3. **TradingView-standard drawing tools** — exact SVG icon set
4. **Fix balance/equity shaking** — stabilize the update loop
5. **MT5/Exness-style positions panel** — proper trade table with all fields

## Execution Order

### Phase 1: Fix Chart Viewport (P0)
- `backend_bridge.js` → `applyBlocks()` uses immediate calculation, not setTimeout
- `app.js` → `centerCamera()` / `centerCameraX()` safeguarded

### Phase 2: Fix Balance Shaking (P0)  
- `index.html` inline script → equity updater conflicting with `refreshBalanceDisplay()`
- Root cause: two competing intervals both writing to `balanceDisplay`

### Phase 3: MT5/Exness Positions Table (P1)
- `index.html` → replace simple `#activeTrade` div with proper table
- `style.css` → positions table styling
- `app.js` → `refreshCloseButtons()` generates table rows

### Phase 4: iOS 26 Glassmorphic Icons + Drawing Tools (P2)
- `style.css` → glassmorphic tool buttons, header items
- `index.html` → TradingView SVG icons for drawing toolbar

## Verification
- Start backend, open terminal, verify blocks visible
- Place demo trade, verify balance stable
- Verify positions panel shows MT5-style rows
