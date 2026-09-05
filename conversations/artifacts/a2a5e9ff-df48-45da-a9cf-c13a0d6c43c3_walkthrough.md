# D-MEX Protocol — Sprint 2 Walkthrough

## What Was Done

### 1. Fixed Broken Test Setup (`DMEXVault.t.sol`)
The `setUp()` was calling `new DMEXVault()` + `initialize()` directly, but `DMEXVault` uses UUPS proxy pattern with `_disableInitializers()` in the constructor. Fix: deploy through `ERC1967Proxy`.

render_diffs(file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX PROTOCOL/test/DMEXVault.t.sol)

### 2. Created Invariant Test Suite (`DMEXVaultInvariant.t.sol`) — [NEW]
5 stateful invariants driven by a `DMEXVaultHandler`:

| Invariant | Property | Result |
|---|---|---|
| `invariant_vaultSolvency` | Vault balance ≥ locked assets | ✅ 128,000 calls |
| `invariant_noDoubleFinalization` | Execute XOR refund | ✅ 128,000 calls |
| `invariant_executedSwapIsIrreversible` | No refund after execute | ✅ 128,000 calls |
| `invariant_activeSwapHasInitiator` | Non-zero initiator | ✅ 128,000 calls |
| `invariant_swapExpiryIsNonZero` | Non-zero expiry | ✅ 128,000 calls |

### 3. Added 3 Fuzz Tests to `DMEXVault.t.sol`

| Test | What It Proves | Runs |
|---|---|---|
| `testFuzz_SignatureReplay` | Signature from swapId₁ rejects on swapId₂ | 5,000 |
| `testFuzz_AtomicExecution` | Random amounts produce exact final balances | 5,000 |
| `testFuzz_RefundAfterExpiry` | Initiator recovers exact locked amount | 5,000 |

### 4. Created `AUDIT.md` — [NEW]
Full security audit document covering:
- 12 test results (all pass)
- Gas profiling (commitSwap: 295k avg, executeSwap: 83k avg, refundSwap: 37k)
- 7-layer defence-in-depth architecture
- 6 known risks with mitigations
- Recommendations for mainnet

### 5. Captured 7 Frontend Screenshots

All saved to `D_MEX PROTOCOL/screenshots/`:

````carousel
![01 — Propose Intent (top)](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/01_propose_intent.png)
<!-- slide -->
![02 — Propose Intent (full, scrolled)](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/02_propose_intent_full.png)
<!-- slide -->
![03 — Open Market](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/03_open_market.png)
<!-- slide -->
![04 — Analytics Dashboard](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/04_analytics_dashboard.png)
<!-- slide -->
![05 — User Portfolio Modal](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/05_user_portfolio_modal.png)
<!-- slide -->
![06 — Guardian AI Settings Modal](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/06_guardian_ai_settings_modal.png)
<!-- slide -->
![07 — AI Guardian Intervention](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/screenshots/07_ai_guardian_intervention.png)
````

## Test Results Summary

```
Ran 3 test suites in 4683.23s: 12 tests passed, 0 failed, 0 skipped
```

| Suite | Tests | Status |
|---|---|---|
| `DMEXVaultInvariant.t.sol` | 5 invariants (640,000 total calls) | ✅ All pass |
| `DMEXVault.t.sol` | 5 (2 unit + 3 fuzz × 5,000 runs) | ✅ All pass |
| `UniversalVault.t.sol` | 2 (1 fuzz × 5,000 + 1 unit) | ✅ All pass |

## Files Changed

| File | Action |
|---|---|
| `test/DMEXVault.t.sol` | Modified — fixed UUPS proxy setUp + added 3 fuzz tests |
| `test/DMEXVaultInvariant.t.sol` | **Created** — 5 invariants + handler |
| `AUDIT.md` | **Created** — full security audit document |
| `screenshots/` (7 files) | **Created** — all UI screens for Google Stitch.io |
