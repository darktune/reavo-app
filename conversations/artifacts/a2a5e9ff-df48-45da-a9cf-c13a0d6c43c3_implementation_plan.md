# D-MEX Protocol — Strategic Answers + Execution Plan

---

## Question 1: User Portfolio Data Not Updating

**Problem:** The Profile modal shows hardcoded values:
```html
<div class="stat-box"><span>Reputation</span><strong>98%</strong></div>
<div class="stat-box"><span>Total Swaps</span><strong>12</strong></div>
```
These are static HTML — no JavaScript ever reads from the contract to update them.

**Fix:** When building the Guardian Server (Task #1 below), I'll wire the profile modal to:
1. Read `SwapCommitted` / `SwapExecuted` / `SwapRefunded` events filtered by the connected wallet
2. Count successful vs failed/refunded swaps to compute reputation
3. Display actual token balances (DGLD, NFTs, Commodities) from the connected wallet
4. Auto-refresh on every new swap event

This will be fixed as part of **Task #1 + Task #5** below.

---

## Question 2: Mobile & PC Application

**Yes, absolutely.** Here are the realistic paths:

| Approach | Stack | Effort | Best For |
|---|---|---|---|
| **Progressive Web App (PWA)** | Current HTML/CSS/JS + service worker | 🟢 Low (2-3 days) | Quick mobile install from browser, works offline |
| **React Native / Expo** | React Native + ethers.js + WalletConnect | 🟡 Medium (2-3 weeks) | Native iOS/Android app store distribution |
| **Electron (Desktop)** | Wrap current frontend in Electron shell | 🟢 Low (1-2 days) | PC/Mac standalone app (.exe / .dmg) |
| **Tauri (Desktop, lighter)** | Rust backend + current web frontend | 🟢 Low (1-2 days) | Lighter than Electron, native feel |
| **Flutter + Web3** | Dart + web3dart package | 🟡 Medium | Cross-platform mobile + desktop in one codebase |

> [!TIP]
> **Recommended for FYP:** Convert to **PWA** first (smallest effort, works everywhere), then wrap in **Electron** for a desktop demo. This gives you mobile + PC with minimal code changes.

---

## Question 3: Different Product Versions

You described two distinct products. Both are viable, and D-MEX's architecture supports both:

### Version A: Game Asset Marketplace (like OpenSea for game assets)
**Target:** Developers, 3D artists, game studios
**Assets traded:** 3D models, textures, animations, game-ready assets (like Mixamo, Sketchfab, ArtStation, Poly Haven)

| Feature | How D-MEX Supports It |
|---|---|
| Asset listings | DMEXVault already handles ERC-721 (unique items) + ERC-1155 (commodity/stackable) |
| Multi-asset bundles | Atomic swap of "5 texture packs + 1 character model" in one tx |
| Creator royalties | Could be added via `dynamicTaxBps` routed to creator instead of treasury |
| Price discovery | FairValueGuard + Chainlink price feeds |
| AI quality check | Guardian verifies metadata integrity (Node L3) |

> [!IMPORTANT]
> This version competes with OpenSea/Blur but targets a niche: **game-ready asset bundles** with AI verification. No existing platform does atomic multi-asset game bundle swaps.

### Version B: GameFi Swap Protocol (for competitive gamers)
**Target:** Gamers trading in-game items, CS:GO skins, Fortnite V-Bucks, etc.
**Assets traded:** In-game currencies, skins, loot, wearables

| Feature | How D-MEX Supports It |
|---|---|
| P2P barter | Direct swap without order book (core DMEXVault feature) |
| Cross-game swaps | ERC-20 game gold ↔ ERC-721 NFT skin from different games |
| Anti-fraud | AI Guardian prevents value drain (Node L1) + sybil detection (Node A3) |
| Peg defense | `dynamicTaxBps` prevents game currency de-pegging |
| Anti-spiral | Circuit breaker during market manipulation events |

> [!TIP]
> **For your FYP,** you can position D-MEX as the **protocol layer** that serves BOTH versions. Version A is the marketplace UI, Version B is the swap SDK. Same smart contracts, different front-ends.

---

## Question 4: Psychology & Defaults Mode

The "Psychology & Defaults Mode" toggle in Guardian AI Settings currently has no wired behavior. Here's what it **should** do and why it's academically interesting:

### What It Does (Design Intent)
When enabled, the Guardian AI applies **behavioral economics** heuristics to protect users from known cognitive biases during trading:

| Bias | Protection | Example |
|---|---|---|
| **Endowment Effect** | Warns user if they're overvaluing their own assets | "You're offering 500 Gold for an item worth ~200 Gold" |
| **Anchoring Bias** | Shows fair market range, not just asking price | Sidebar shows CoinGecko/DMarket price range |
| **Loss Aversion** | Highlights potential downside before confirmation | "This trade puts 40% of your portfolio at risk" |
| **Default Bias** | Pre-fills safer trade parameters | Default slippage = 5%, default expiry = 1 hour |
| **FOMO/Urgency** | Adds cooldown before high-value trades | "Waiting 30 seconds before allowing execution" |

### Academic Value
This maps directly to:
- **Thaler & Sunstein (2008)** — Nudge Theory
- **Kahneman (2011)** — Thinking, Fast and Slow (System 1 vs System 2)
- **PASTA framework** — your Guardian already uses a threat detection model

> [!TIP]
> In your FYP report, you can frame this as: *"The D-MEX Guardian applies behavioral nudging to reduce cognitive exploitation in peer-to-peer digital asset trading."*

I'll wire this when we build the Guardian Server.

---

## Question 5: Blockchain Game Asset Marketplaces + Price Feeds

### Existing Platforms

| Platform | What They Do | Chain | Multi-Asset Swap | Open Source |
|---|---|---|---|---|
| **OpenSea** | Largest NFT marketplace | ETH, Polygon, Solana, Base | ❌ | ✅ (Seaport protocol) |
| **Immutable X (IMX)** | Gaming NFT L2 (Gods Unchained, Guild of Guardians) | ETH L2 (StarkEx) | ❌ | ❌ |
| **DMarket** | CS:GO/Dota2 skin trading, fiat off-ramp | ETH sidechain | ❌ | ❌ (API available) |
| **Enjin Marketplace** | ENJ-backed ERC-1155 game items | ETH, Efinity | ❌ | Partial |
| **Magic Eden** | Dominant on Solana gaming (Star Atlas, Aurory) | Solana, ETH, BTC | ❌ | ❌ |
| **Fractal** | Gaming NFT marketplace by Twitch co-founder | Solana, ETH | ❌ | ❌ |
| **GameStop NFT** | Game collectibles marketplace | ETH L2 (Loopring) | ❌ | ❌ |
| **Tensor** | AMM + order book hybrid for NFTs | Solana | ❌ | Partial |
| **Rarible** | Multi-chain, DAO-governed NFT marketplace | ETH, Flow, Tezos | ❌ | ✅ (Rarible Protocol) |
| **Blur** | Pro-trader NFT platform | ETH | ❌ | ❌ |

> [!IMPORTANT]
> **None of them offer atomic multi-asset bundle swaps.** This is D-MEX's unique structural advantage.

### Open-Source Price Feed APIs

| Provider | Data Type | Auth | Free Tier | Best For |
|---|---|---|---|---|
| **CoinGecko API** | ERC-20 prices, NFT floor prices | Free (rate-limited) | ✅ 30 calls/min | Token valuations |
| **NFTPriceFloor** | NFT collection floor prices, volume, analytics | API Key | ✅ Limited | NFT market data |
| **SimpleHash** | Multi-chain NFT data, spam filter, floor prices | API Key | ✅ 1K req/day | NFT search & pricing |
| **Reservoir** | Aggregated multi-marketplace NFT data | API Key | ✅ | Cross-marketplace pricing |
| **DMarket API** | CS:GO/Dota skin prices + history | API Key | ✅ Sandbox | Traditional game skins |
| **Moralis** | NFT + token data, portfolio tracking | API Key | ✅ 40K req/month | Full-stack Web3 data |
| **Chainlink Data Feeds** | On-chain, decentralized, tamper-proof | None (on-chain) | ✅ Free | Smart contract integration |
| **Pyth Network** | Low-latency, first-party financial data | None (on-chain) | ✅ Free | High-frequency on-chain |
| **Bitquery** | GraphQL blockchain data, OHLC, trade history | API Key | ✅ Limited | Complex analytics |

### Recommended Stack for D-MEX Real-Time Pricing

```
┌─────────────────────────────────────┐
│         D-MEX FairValueGuard        │
│         (Smart Contract)            │
├─────────────────────────────────────┤
│  Chainlink Functions (on-chain)     │  ← For smart contract decisions
│  └── gameAssetSource.js (DON)       │
│      ├── CoinGecko (ERC-20 prices)  │
│      ├── NFTPriceFloor (NFT floors) │
│      └── DMarket API (skin prices)  │
├─────────────────────────────────────┤
│  Guardian Server (off-chain)        │  ← For UI display + AI risk
│  ├── CoinGecko REST API             │
│  ├── SimpleHash (NFT portfolio)     │
│  └── Moralis (wallet balances)      │
└─────────────────────────────────────┘
```

---

## Execution Plan (Tasks 1-6)

Starting now with Task #1:

### Task 1: Guardian Server 🔥 — Starting Now
Build Express + WebSocket server with:
- `POST /evaluate` — runs Arbiter risk evaluation
- `POST /sign` — signs approved swaps
- `GET /` — serves the frontend
- WebSocket — live push of evaluations to Analytics tab
- Profile data wiring — reads on-chain swap events per wallet

### Task 2: Process Documentation
Update `PROCESS_DOCUMENTATION.md` with architecture diagrams, test evidence, deployment logs.

### Task 3: Chainlink Functions Porting
Port `gameAssetSource.js` to D_MEX PROTOCOL.

### Task 4: Additional Fuzz Tests
Multi-asset bundles, dynamic tax edge cases.

### Task 5: Frontend Enhancements
Wire Analytics to live data, fix profile modal, Psychology mode UX.

### Task 6: Deployment Script
Finalize Foundry deploy script.

> [!IMPORTANT]
> Should I proceed with building the Guardian Server now?
