# D-MEX Project Restructure, Documentation & Audit

## Goal

Reorganize the D-MEX Protocol repository into a clean, professional monorepo structure. Update all documentation to reflect everything built across 10+ development sprints. Run a full audit and test pass to verify the codebase integrity.

---

## 1. Current Problems

The project root is cluttered with:
- **Mixed concerns**: Foundry config, frontend files, mobile app, guardian server, design mockups, loose screenshots, stale implementation plans all at the same level
- **No README.md** at the root — anyone opening the repo has no entry point
- **Stale documentation**: `PROCESS_DOCUMENTATION.md` and `AUDIT.md` haven't been updated since mid-April and miss the latest features (Demo Mode, CS2 Bridge, UGC Minting, Peer Discovery marketplace, Friends List, Chat Widget)
- **Orphaned files**: `dmex_frontend_v2_demo_1774167795766.webp` screenshot sitting in root, `implementation_plan.md` from the first sprint still present
- **`stitch_remix_of_web_to_mobile_design/`** folder with 10 subdirectories of design docs scattered around
- **No `docs/` directory** — all docs are flat at root

---

## 2. Proposed File Structure

```
D_MEX PROTOCOL/
│
├── README.md                          # [NEW] Project entry point
├── CHANGELOG.md                       # [NEW] Sprint-by-sprint history
├── LICENSE                            # [NEW] MIT or project license
├── .gitignore
├── .gitmodules
├── .env                               # (gitignored)
├── foundry.toml                       # Foundry config (stays at root)
├── foundry.lock
├── package.json                       # Root OZ dependencies
├── package-lock.json
│
├── contracts/                         # Solidity source (Foundry `src` remapped)
│   ├── core/
│   │   ├── DMEXVault.sol              # ← moved from src/DMEXVault.sol
│   │   └── UniversalVault.sol         # ← stays (legacy reference)
│   ├── mocks/
│   │   └── MockGameAssets.sol         # ← moved from src/MockGameAssets.sol
│   ├── oracles/
│   │   └── FairValueGuard.sol         # ← stays
│   └── interfaces/
│       └── ChainlinkInterfaces.sol    # ← stays
│
├── test/                              # Foundry tests (unchanged)
│   ├── DMEXVault.t.sol
│   ├── DMEXVaultInvariant.t.sol
│   └── UniversalVault.t.sol
│
├── script/                            # Foundry deploy scripts (unchanged)
│   ├── DMEXDeploy.s.sol
│   └── DeployUniversalVault.s.sol
│
├── frontend/                          # Web frontend (unchanged)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   ├── vault-abi.js
│   ├── manifest.json
│   └── sw.js
│
├── guardian/                           # AI Guardian server
│   ├── guardian.js
│   ├── arbiter.js
│   ├── fairValueOracle.js
│   ├── test-arbiter.js
│   ├── package.json
│   └── package-lock.json
│
├── mobile/                            # ← RENAMED from dmex_mobile/
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   ├── theme/
│   │   └── widgets/
│   ├── pubspec.yaml
│   └── MOBILE_TESTING_GUIDE.md
│
├── docs/                              # [NEW] All documentation
│   ├── PROCESS_DOCUMENTATION.md       # ← moved & updated
│   ├── AUDIT.md                       # ← moved & updated
│   ├── GUARDIAN_RULES.md              # ← moved from guardian/
│   ├── ARCHITECTURE.md                # [NEW] System architecture deep-dive
│   ├── DEPLOYMENT.md                  # [NEW] Deployment instructions
│   ├── TESTING.md                     # [NEW] Test strategy & results
│   └── design/                        # ← moved from stitch_remix_of_web_to_mobile_design/
│       ├── cyber_arbiter/
│       ├── d_mex_dashboard/
│       ├── open_market/
│       ├── portfolio_settings/
│       ├── propose_intent_swap/
│       └── risk_breakdown/
│
├── assets/                            # [NEW] Screenshots & media
│   ├── screenshots/                   # ← moved from screenshots/
│   └── recordings/
│
├── lib/                               # Foundry dependencies (gitignored)
│   └── forge-std/
│
├── out/                               # Foundry build output (gitignored)
├── cache/                             # Foundry cache (gitignored)
├── broadcast/                         # Foundry broadcast logs (gitignored)
└── node_modules/                      # npm deps (gitignored)
```

---

## 3. Proposed Changes

### 3.1 File Restructuring

#### Move & Rename Operations

| Current Location | New Location | Action |
|---|---|---|
| `src/DMEXVault.sol` | `contracts/core/DMEXVault.sol` | Move |
| `src/MockGameAssets.sol` | `contracts/mocks/MockGameAssets.sol` | Move |
| `contracts/FairValueGuard.sol` | `contracts/oracles/FairValueGuard.sol` | Move |
| `contracts/UniversalVault.sol` | `contracts/core/UniversalVault.sol` | Move |
| `contracts/interfaces/` | `contracts/interfaces/` | Keep |
| `dmex_mobile/` | `mobile/` | Rename |
| `screenshots/` | `assets/screenshots/` | Move |
| `PROCESS_DOCUMENTATION.md` | `docs/PROCESS_DOCUMENTATION.md` | Move |
| `AUDIT.md` | `docs/AUDIT.md` | Move |
| `guardian/Guardian_Rules.md` | `docs/GUARDIAN_RULES.md` | Move |
| `stitch_remix_of_web_to_mobile_design/` | `docs/design/` | Move (remove `_updated_nav` duplicates) |
| `implementation_plan.md` | DELETE (stale) | Remove |
| `deploy_log.txt` | `docs/deploy_log.txt` | Move |
| `dmex_frontend_v2_demo_*.webp` | `assets/recordings/` | Move |

#### Foundry Config Update

Update `foundry.toml` to reflect the new contract organization:

```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["node_modules", "lib"]
evm_version = "cancun"
```

> [!IMPORTANT]
> The `contracts/` directory currently has a flat structure. The move to `contracts/core/`, `contracts/mocks/`, `contracts/oracles/` subdirectories requires updating the Foundry `src` path and ensuring all import paths still resolve. We'll test compilation after moves.

---

### 3.2 Documentation Overhaul

#### [NEW] README.md
Root-level entry point covering:
- Project tagline & badges
- Quick architecture diagram (ASCII)
- Quick start (prerequisites, install, test, run)
- Links to docs/ subdirectory
- Tech stack summary
- Live deployment addresses
- Team / License

#### [NEW] CHANGELOG.md
Sprint-by-sprint record of everything built:
- Sprint 1: Guardian Server, Profile Modal, Wallet Connection
- Sprint 2: Process Documentation, Multi-asset Fuzz Tests
- Sprint 3: Peer Discovery, Chat Widget, Friends List
- Sprint 4: Chainlink Oracle, Analytics, SafeERC20 fix, isActive fix
- Sprint 5: Cross-game Assets (Loot, Gods Unchained, CryptoKitties)
- Sprint 6: CS2 Steam Bridge, UGC Mint Simulation
- Sprint 7: RPC Failover, Network Resilience
- Sprint 8: Marketplace Persistence, Demo Mode Seeder
- Sprint 9: Mobile Flutter Prototype
- Sprint 10: Arbiter Severity Scoring, UI Polish

#### [MODIFY] docs/PROCESS_DOCUMENTATION.md
Update to include:
- Cross-game asset integration (Loot, Gods Unchained, CryptoKitties, CS2)
- Peer Discovery marketplace tab
- Real-time negotiation chat widget
- Friends list with historical swap tracking
- Demo Mode seeder functionality
- CS2 Steam Bridge simulation
- UGC Upload-to-Mint simulation
- RPC failover mechanism
- Marketplace persistence (vault + API merge)
- Mobile Flutter prototype
- Severity scoring in Guardian API

#### [MODIFY] docs/AUDIT.md
Update to include:
- Current test counts & results
- Any new test coverage from recent sprints
- Updated risk matrix
- Demo Mode security implications
- Cross-game contract mapping audit notes

#### [NEW] docs/ARCHITECTURE.md
Deep-dive system architecture:
- Component diagram (Frontend ↔ Guardian ↔ Contracts ↔ Scroll)
- Data flow for each swap phase
- Cross-game asset mapping table
- WebSocket event schema
- API endpoint reference

#### [NEW] docs/DEPLOYMENT.md
Step-by-step deployment guide:
- Prerequisites (Node.js, Foundry, MetaMask)
- Environment variables (.env setup)
- Contract deployment commands
- Guardian server startup
- Frontend serving
- Mobile prototype testing

#### [NEW] docs/TESTING.md
Test strategy document:
- Foundry test suite (unit, fuzz, invariant)
- Guardian API testing (test-arbiter.js)
- Frontend manual testing checklist
- Browser test scenarios
- Gas profiling results

---

### 3.3 Audit & Testing

#### Foundry Test Suite
```bash
forge test -vv                                    # Full suite
forge test --match-contract DMEXVaultInvariant -vv # Invariants only
forge test --match-test "testFuzz" -vv             # Fuzz tests only
```

#### Guardian Server Verification
```bash
cd guardian && node guardian.js                     # Verify startup
```

#### Frontend Browser Test
- Open `frontend/index.html` via the Guardian's Express static server
- Verify wallet connection (MetaMask + Direct RPC fallback)
- Verify marketplace populates with demo assets
- Verify swap proposal flow
- Verify analytics dashboard updates

---

## 4. Open Questions

> [!IMPORTANT]
> **Q1: Foundry `src` path** — Currently `foundry.toml` has `src = "contracts"`. If we introduce subdirectories (`core/`, `mocks/`, `oracles/`), Foundry should still discover all `.sol` files recursively. Should I keep the flat structure instead for simplicity?

> [!IMPORTANT]
> **Q2: Stitch Remix designs** — The `stitch_remix_of_web_to_mobile_design/` folder has both original and `_updated_nav` variants. Should I keep only the `_updated_nav` versions (latest) or archive both?

> [!NOTE]
> **Q3: License** — Do you want a LICENSE file added? If so, which license (MIT, Apache 2.0, or proprietary)?

---

## 5. Verification Plan

### Automated Tests
1. Run `forge build` after file moves to verify compilation
2. Run `forge test -vv` to verify all 14 tests still pass
3. Run `cd guardian && node -e "require('./guardian.js')"` to verify Guardian imports

### Manual Verification
1. Start Guardian server and verify all API endpoints respond
2. Open frontend in browser and verify it loads correctly
3. Check that all documentation links resolve correctly
4. Verify git status shows clean moves (not delete+create)
