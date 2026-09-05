# Post-Deployment: Verification, Testing & AI Guardian

## What This Does
3 prioritized phases after successful on-chain deployment of `UniversalVault`.

---

## Phase 1 — Scrollscan Verification
Makes source code publicly readable on the block explorer (important for FYP demonstration).

No code changes. Requires a free `SCROLLSCAN_API_KEY` from [scrollscan.com](https://scrollscan.com).

---

## Phase 2 — Extended Test Suite

#### [MODIFY] [Vault.t.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/test/Vault.t.sol)
Adds 3 concrete tests on top of existing fuzz test:
- `test_CommitSwap_Success` — assets locked in vault after commitment
- `test_RefundSwap_AfterExpiry` — initiator recovers assets post-expiry
- `test_ExecuteSwap_HighRiskRejected` — AI score ≥ 50 reverts

---

## Phase 3 — AI Guardian Off-Chain Service

> [!IMPORTANT]
> The contract already verifies AI signatures on-chain (`_checkRiskScore`). This phase builds **the off-chain service that generates those signatures** using the existing `AttackTreeSchema.json`.

### Architecture

```
SwapCommitted event
       │
       ▼
  Guardian Service (Node.js)
       │
       ├─► L1_ValueDrain    → Chainlink oracle fair-value check
       ├─► L2_Reentrancy    → Static pattern analysis (off-chain mirror)
       ├─► L3_MetadataFraud → IPFS URI hash verification
       ├─► A3_SybilPumping  → Address age + tx history score
       │
       ▼
  Risk Aggregator (PASTA-inspired)
       │  • Composite score: weighted sum of attack node scores
       │  • Score < 50 → APPROVE + sign keccak(swapId, score)
       │  • Score ≥ 50 → REJECT + reason
       │
       ▼
  REST API: POST /sign → { aiScore, signature, riskReport }
       │
       ▼
  Dashboard (Express + Chart.js)
       • Per-swap risk breakdown (bar chart: score per attack node)
       • Cumulative protocol safety (pie chart: APPROVED vs REJECTED)
       • Attack node hit rate over time (line chart)
```

### Files

#### [NEW] [guardian/guardian.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/guardian/guardian.js)
Main Express service. Loads `AttackTreeSchema.json`, evaluates each attack node, computes composite risk score, signs approvals, records history.

#### [NEW] [guardian/riskEngine.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/guardian/riskEngine.js)
Pure risk-scoring logic for each AttackTree node:
| Attack Node | Method | Weight |
|---|---|---|
| `L1_ValueDrain` | Oracle price ratio | 35% |
| `L2_Reentrancy` | Call pattern static check | 20% |
| `L3_MetadataFraud` | IPFS URI hash comparison | 20% |
| `A3_SybilPumping` | Address tx count + age | 25% |

#### [NEW] [guardian/dashboard.html](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/guardian/dashboard.html)
Browser-based real-time dashboard showing:
- **Bar chart** — risk score per attack node per swap
- **Pie chart** — protocol-wide APPROVED vs REJECTED ratio
- **Risk badge** — colour-coded score (green < 25, orange 25–49, red ≥ 50)

#### [NEW] [guardian/package.json](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/guardian/package.json)
Dependencies: `ethers`, `express`, `node-fetch`

---

## Verification Plan

### Automated Tests
```powershell
forge test -vvvv
```

### Manual Verification
1. `cd guardian && npm install && node guardian.js`
2. Open `http://localhost:3000/dashboard` in browser — see live chart
3. `POST http://localhost:3000/sign` with a test swapId — verify signature
4. Use signature in `executeSwap` on Scrollscan

> [!NOTE]
> The PASTA approach and formal method concepts (Tamarin/ProVerif) will be **referenced in the FYP report** as the theoretical basis for the attack tree weights and node design. Implementing full Tamarin proofs is outside scope but the architecture is designed to be formally verifiable.
