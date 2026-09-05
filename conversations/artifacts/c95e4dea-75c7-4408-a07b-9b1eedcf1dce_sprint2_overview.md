# SPACE · DMEX Universal Vault — Sprint 2 Status & Recommendations

> **Date:** 7 April 2026 · **Chain:** Scroll Sepolia (534351)

---

## Current State Summary

| Layer | Status | Key File |
|---|---|---|
| **Solidity Contracts** | ✅ Deployed & live | [UniversalVault.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/src/UniversalVault.sol), [FairValueGuard.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/src/FairValueGuard.sol) |
| **Unit Tests** | ✅ 3 unit + 1 fuzz test passing | [Vault.t.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/test/Vault.t.sol) |
| **Invariant Tests** | ✅ 5 invariants + handler written | [VaultInvariant.t.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/test/VaultInvariant.t.sol) |
| **Chainlink Functions** | ✅ JS source written, contract ready | [gameAssetSource.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/chainlink-functions/gameAssetSource.js) |
| **AI Guardian** | ✅ REST + WebSocket + 4-node risk engine | [guardian.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/guardian/guardian.js), [riskEngine.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/guardian/riskEngine.js) |
| **Frontend** | ✅ 4-step wizard, glass UI, AI overlay | [index.html](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/frontend/index.html), [app.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/frontend/app.js) |
| **Market Research** | ✅ Complete (7 platforms analysed) | [MARKET_RESEARCH.md](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/MARKET_RESEARCH.md) |

---

## Sprint 2 Tasks — Readiness Assessment

### 1. ✅ Foundry Invariant Tests — `VaultInvariant.t.sol`

**Status: Already written (283 lines).** Contains:
- 5 invariants: Vault Solvency, No Double Finalization, Executed Irreversibility, Non-Zero Initiator, Expiry Monotonicity
- Handler with 4 actions: `commitSwap`, `executeSwap`, `refundSwap`, `warpTime`
- Ghost variable tracking for solvency proof

> [!IMPORTANT]
> **Needs verification:** We should run `forge test --match-contract VaultInvariant` to confirm it compiles and all invariants pass. A previous conversation mentioned a compilation error that may or may not have been fixed.

**Remaining work:**
- Add 2 fuzz tests to the invariant file (e.g., fuzz the AI score threshold boundary, fuzz multi-asset bundle sizes)
- Verify compilation on current Foundry version

---

### 2. 🔶 Chainlink Functions Wiring

**Status: JS source complete, Solidity contract complete, NOT wired together.**

What exists:
- `gameAssetSource.js` — Reservoir → CoinGecko → Mock fallback chain (121 lines)
- `FairValueGuard.sol` — Full Chainlink Functions consumer with staleness checks (255 lines)
- `riskEngine.js` — Already has `_fetchOnChainUsdValue()` calling FairValueGuard's `getValuationSafe()`

What's missing:
- **FairValueGuard is not deployed** — `FAIR_VALUE_GUARD_ADDRESS` in riskEngine.js is `null`
- No Chainlink Functions subscription created on Scroll Sepolia
- No integration test connecting the JS source → DON → contract → riskEngine

**Decision needed:** Deploy FairValueGuard with mock valuations (testnet-safe) or set up a real Chainlink Functions subscription?

---

### 3. 🔶 UI Polish — AI Decision Toast, Swap Timeline, Markets Sidebar

**Status: Structural HTML exists, but needs visual polish.**

What exists:
- AI Decision Overlay (`#ai-overlay`) with animated score ring — ✅ Working
- Swap Status Timeline (`#swapTimeline`) with 4 stages — ✅ Structure exists
- Comparable Markets sidebar (`<section class="markets-panel">`) — ✅ 4 platform cards

What needs polish:
- **AI Decision Toast**: Currently using basic `showToast()` — should show a richer glass toast with score/decision preview
- **Swap Timeline**: CSS animations for stage transitions are minimal; needs pulse/glow effects
- **Markets sidebar**: Cards are functional but could use hover animations and better visual hierarchy
- **General**: Some CSS variables may need tuning for the frosted glass depth on the new elements

---

### 4. ✅ MARKET_RESEARCH.md

**Status: Complete** (206 lines, 7 platforms analysed, competitive matrix, feature gap table, data source recommendations).

No further work needed unless you want to add more platforms.

---

## Recommended Sprint 2 Execution Order

| Priority | Task | Effort | Dependencies |
|---|---|---|---|
| **1** | Verify invariant tests compile & pass | 15 min | Foundry installed |
| **2** | Add 2 fuzz tests to VaultInvariant.t.sol | 30 min | Task 1 |
| **3** | UI Polish (Toast, Timeline, Markets) | 1–2 hrs | None |
| **4** | Deploy FairValueGuard + wire Chainlink | 1–2 hrs | Scroll Sepolia ETH + LINK |

> [!TIP]
> **Recommended start:** Task 1 (verify invariant tests) — it's quick, gives confidence in the test suite, and unblocks Task 2. We can run it right now.

---

## Open Questions

1. **Invariant tests first?** Shall I run `forge test` now to verify everything compiles?
2. **Chainlink deployment strategy:** Do you want to deploy FairValueGuard with `setMockValuation()` for testnet, or set up a real Chainlink Functions subscription?
3. **UI polish scope:** Should I focus on the AI toast + timeline animations, or also redesign the markets sidebar?
