# D-MEX Protocol: Cross-Game Integration Guide

This document provides a thorough technical breakdown of how the D-MEX protocol integrates external game ecosystems — **Counter-Strike 2 (CS2)**, **3D Design Engines (UGC)**, **Loot**, **Gods Unchained**, and **CryptoKitties** — into a unified, atomic barter system on the Scroll Sepolia testnet.

> [!IMPORTANT]
> **Core Design Principle**: D-MEX is a **universal barter protocol**. Any asset from any game can be swapped for any other asset from any other game. A CS2 skin can be swapped for a CryptoKitty. A Loot Bag can be swapped for a different CS2 skin of different value. The protocol does NOT restrict swaps to D-MEX native assets.

---

## 1. Counter-Strike 2 (CS2) Integration
### The "Steam-to-Protocol" Bridge

Since CS2 skins are proprietary digital assets living within Valve's Steam ecosystem, they cannot "leave" Steam natively. The D-MEX protocol uses a **Custodial Escrow-Commitment Pattern** to bridge these assets.

#### A. Security Considerations
> [!NOTE]
> **Will connecting a Steam ID cause security complications?**
> No. The `syncSteamInventory` function only performs **read-only** operations on the Steam Community Inventory endpoint. It does NOT require a Steam API key, nor does it request login credentials. The endpoint is public for any user whose inventory privacy is set to "Public":
> ```
> GET https://steamcommunity.com/inventory/<STEAMID64>/730/2?l=english&count=5000
> ```
> The D-MEX Guardian adds an additional layer: it validates the response structure and rejects malformed payloads to prevent injection attacks.

#### B. The Technical Flow (Production Architecture)
1.  **Inventory Discovery**: The user enters their Steam64 ID into the D-MEX frontend. The frontend calls `syncSteamInventory(steamId)` which fetches the public CS2 inventory.
2.  **Asset Selection**: The user selects skins to bridge (e.g., *AK-47 | Asiimov*, *AWP | Dragon Lore*).
3.  **Escrow Deposit (How It Works)**:
    *   The user initiates a **Steam Trade Offer** to the D-MEX Guardian Bot (a dedicated Steam account controlled by the protocol).
    *   The Guardian Bot receives the trade offer and programmatically verifies:
        - **Float Value**: The skin's wear rating (e.g., 0.21 = Field-Tested).
        - **Paint Seed**: The unique pattern index (critical for case-hardened knives).
        - **Sticker Composition**: Applied stickers and their positions.
    *   The Bot **accepts** the trade. The skin is now held in the Bot's inventory (the "Vault").
    *   The Guardian Server emits: `[BRIDGE] CS2 Skin "AK-47 | Asiimov (FT)" verified. Float: 0.21. Stickers: 4x Crown. Minting commit to Scroll...`
4.  **On-Chain Minting**: The Guardian Server signs a transaction allowing the `UniversalVault.sol` contract to recognize a "Synthetic CS2 Asset" (represented by our `CS_SKIN` mock ERC-721).
5.  **Barter Ready**: The skin is now "locked" and can be swapped for **any** asset in the protocol — a CryptoKitty, a Loot Bag, DGLD, a UE5 mesh, or even another CS2 skin of completely different value.

#### C. Cross-Skin Trading (CS2-to-CS2)
> **"Can we later improve it to be traded between users playing online on CS2?"**
>
> Yes. The architecture supports **CS2 ↔ CS2 swaps** natively. Example:
> - **User A** offers: AWP | Dragon Lore (Factory New) — valued at ~$1,200
> - **User B** offers: AK-47 | Fire Serpent (MW) + 500 DGLD — valued at ~$1,200
>
> The Guardian evaluates fairness (see §7 Fair Value Guard below) and the atomic swap executes. Both users' Steam inventories are updated by the Guardian Bot post-settlement.
>
> For **live in-game integration**, a future version would use a lightweight CS2 GSI (Game State Integration) plugin to detect in-game events and trigger swap proposals contextually.

#### D. API Reference
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `https://steamcommunity.com/inventory/{steamId}/730/2` | `GET` | Fetch public CS2 inventory |
| `https://api.steampowered.com/ISteamEconomy/GetAssetClassInfo/v1/` | `GET` | Get item metadata (name, icon, description) |
| `https://api.csfloat.com/` | `GET` | Get precise float/paint seed values |

---

## 2. 3D Engine (UGC) Integration
### UE5, Blender, Unity, and Maya Pipeline

User Generated Content (UGC) involves bridging creative software outputs directly into the GameFi economy.

#### A. The "Mint-to-Vault" Pipeline
1.  **Creative Export**: A creator exports a `.fbx`, `.obj`, or Unreal `.uasset` from their software.
2.  **D-MEX Upload**: The user "uploads" the asset file via the D-MEX frontend Upload Modal.
3.  **Metadata Extraction**: The protocol analyzes the asset:
    *   **UE5 Nanite**: Verified as a high-poly mesh. Triangle count extracted.
    *   **Blender Scene**: Verified as a set of rigged models. Object count parsed.
4.  **Protocol Valuation**: The `FairValueOracle.js` assigns a `baseValue` based on asset complexity (e.g., a "Maya Rig" is valued higher than a simple "Unreal Mesh").
5.  **Atomic Mint**: The protocol creates a local "Commitment Token" (ERC-1155). The creator can now barter their 3D work for **any asset in any game** — DGLD, a CS2 skin, a CryptoKitty, a God Card, or a Loot Bag.

#### B. Asset Categories
| Asset Type | Origin Engine | Protocol ID | Valuation Logic |
| :--- | :--- | :--- | :--- |
| **UE5 Nanite Mesh** | Unreal Engine 5 | `ugc:unreal_mesh` | Quality-based (High Poly) |
| **Blender Scene** | Blender | `ugc:blender_scene` | Scene Complexity |
| **Maya Rig** | Autodesk Maya | `ugc:maya_rig` | Skeletal Hierarchies |
| **Unity Prefab** | Unity | `ugc:unity_prefab` | Component Count |

---

## 3. CryptoKitties Integration
### Historical NFT Ancestry & Genetics

CryptoKitties is the original crypto collectible. Each Kitty is an ERC-721 NFT with unique genetic traits.

#### A. Technical Integration Steps
1.  **Ownership Verification**: The protocol calls `ownerOf(tokenId)` on the KittyCore contract to confirm the user owns the Kitty.
2.  **DNA Extraction**: The protocol calls `getKitty(tokenId)` to retrieve the Kitty's `genes` (a `uint256` encoding all genetic traits).
3.  **Cattributes Mapping**: The `genes` value is decoded into human-readable "Cattributes" (e.g., *Jaguar*, *Spock*, *Lemonade*).
4.  **Valuation Anchor**: Value is anchored to:
    - **Generation**: Gen 0 Kitties have the highest `baseValue`.
    - **Cooldown**: Lower cooldown = higher breeding utility = higher value.
    - **Fancy/Exclusive traits**: Rare patterns command premium.
5.  **Protocol Mapping**:
    - **Contract**: `CK_MOCK` (ERC-721 on Scroll Sepolia)
    - **Flow**: User approves D-MEX Vault → Vault escrows Kitty → Synthetic Kitty minted on Scroll → **Tradeable for any asset** (CS2 skins, Loot Bags, DGLD, etc.)

#### B. API Reference
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `https://api.cryptokitties.co/kitties/{id}` | `GET` | Get Kitty metadata, image, cattributes |
| `https://api.cryptokitties.co/kitties?owner_wallet_address={addr}` | `GET` | List all Kitties owned by a wallet |
| **On-Chain**: `0x06012c8cf97BEaD5deAe237070F9587f8E7A266d` | `getKitty(uint256)` | Returns genes, birthTime, generation |

---

## 4. Gods Unchained Integration
### Immutable X, Shared Order Book & Bittensor

Gods Unchained cards live on **Immutable X (IMX)**, an L2 ZK-rollup designed for NFT gaming.

#### A. Architecture: IMX Shared Order Book + Bittensor
> [!NOTE]
> **Yes, we discussed this variant.** The integration leverages three layers:
> 1. **Immutable X Shared Order Book**: IMX provides a global, aggregated order book. When a God Card is listed on IMX, that liquidity is visible across all IMX-connected marketplaces. D-MEX taps into this shared liquidity via the IMX Link SDK.
> 2. **Bittensor Decentralized Intelligence**: Bittensor's subnet architecture provides decentralized AI inference. D-MEX uses this for:
>    - **Card Valuation**: Querying Bittensor subnets for real-time competitive meta analysis (which cards are currently strong in the Gods Unchained meta → higher demand → higher value).
>    - **Fraud Detection**: Distributed ML models detect anomalous trading patterns (wash trading, price manipulation) without relying on a centralized server.
> 3. **D-MEX Guardian**: Sits between IMX and Scroll, synchronizing card state and preventing double-commitment.

#### B. Technical Integration Steps
1.  **IMX Sync**: The frontend interacts with the IMX Link/SDK to verify card ownership on the Immutable X L2.
2.  **Metadata Fetching**: The protocol fetches card stats via the Gods Unchained API:
    - Proto (card template ID), Quality (e.g., Meteorite, Shadow, Gold, Diamond), Attack, Health, Mana Cost, God affinity.
3.  **L2-to-L1 Mapping**: For the Scroll demo, cards are represented via `GODS_MOCK` (ERC-1155). ERC-1155 allows "stacking" of common cards (useful for bulk trades like "5 Common Cards for 1 Rare Skin").
4.  **Security**: The Guardian verifies the card's "Lock Status" on IMX before allowing it to be unlocked for barter on D-MEX.

#### C. API Reference
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `https://api.godsunchained.com/v0/card?user={address}` | `GET` | List all cards owned by a wallet |
| `https://api.godsunchained.com/v0/card/{id}` | `GET` | Get card metadata (proto, quality, stats) |
| `https://api.godsunchained.com/v0/proto/{protoId}` | `GET` | Get card template (name, god, rarity, set) |
| `https://api.x.immutable.com/v3/orders?sell_token_address={addr}` | `GET` | IMX shared order book listings |
| **On-Chain (Mainnet)**: `0x0E3A2A1f2146d86A604adc220b4967A898D7Fe07` | `balanceOf(addr,id)` | ERC-1155 balance check |

---

## 5. Loot (Adventurers) Integration
### On-Chain Metadata & Composition

Loot is unique because **all metadata is stored directly on the Ethereum blockchain** as text. There is no off-chain server or IPFS dependency.

#### A. Technical Integration Steps
1.  **On-Chain Read**: The protocol calls `tokenURI(tokenId)` on the Loot contract (`0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7`). This returns a `data:application/json;base64,...` URI containing the full metadata.
2.  **Item Parsing**: The Guardian decodes the Base64 JSON and extracts individual item slots:
    - `getWeapon(tokenId)` → e.g., "Katana of Brilliance"
    - `getChest(tokenId)` → e.g., "Divine Robe"
    - `getHead(tokenId)`, `getWaist(tokenId)`, `getFoot(tokenId)`, `getHand(tokenId)`, `getNeck(tokenId)`, `getRing(tokenId)`
3.  **Rarity Scoring**: The D-MEX Guardian identifies "Great Wonders" — items with rare prefixes/suffixes (e.g., "of Brilliance", "of Rage", "Divine"). Each modifier has a rarity weight.
4.  **Composite Valuation**: Unlike CS2 skins (single-item), a Loot Bag's value is the **sum of its 8 individual items**. The `FairValueOracle` computes a "Bag Score" reflecting cumulative rarity.
5.  **Protocol Mapping**:
    - **Contract**: `LOOT_MOCK` (ERC-721 on Scroll Sepolia)
    - **Aesthetic**: The D-MEX UI renders Loot Bags using the iconic black-and-white minimalist theme.

#### B. API Reference
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| **On-Chain**: `0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7` | `tokenURI(uint256)` | Returns full Base64-encoded JSON metadata |
| **On-Chain**: same contract | `getWeapon(uint256)` | Returns weapon string for a given bag |
| **On-Chain**: same contract | `getChest(uint256)` | Returns chest armor string |
| **On-Chain**: same contract | `ownerOf(uint256)` | Returns current owner address |

---

## 6. Universal Cross-Game Swaps
### Any Asset ↔ Any Asset

> [!IMPORTANT]
> **D-MEX does NOT restrict swaps to same-game or native-only assets.** The entire point of the protocol is universal barter.

#### Example Swap Scenarios
| User A Offers | User B Offers | Guardian Verdict |
| :--- | :--- | :--- |
| AK-47 \| Asiimov (CS2) | Gen 5 CryptoKitty (CK) | ✅ Approved (values within 15%) |
| AWP \| Dragon Lore (CS2) | AWP \| Fade (CS2) + 200 DGLD | ✅ Approved (cross-skin + top-up) |
| Loot Bag #42 (Divine Robe) | 3x God Cards (Shadow Quality) | ✅ Approved |
| UE5 Nanite Mesh | CS2 Case × 50 | ⚠️ Warning: Severity 72/100 |
| 1 CS2 Case ($2.50) | Maya Rig ($200.00) | 🔴 Warning: Severity 95/100 |

---

## 7. The Fair Value Guard: Severity Scoring System

> [!IMPORTANT]
> **The Fair Value Guard does NOT have the power to decline swaps.** It is an **advisory system** that warns users about value asymmetry. Users always retain the final decision.

#### A. Design Philosophy
Value is **subjective and contextual**. A user might urgently need a specific sword before an in-game event starting in 5 minutes — at that moment, the sword's value *to them* far exceeds its market price. The Fair Value Guard respects this by providing **severity scores**, not hard blocks.

#### B. Severity Scale
| Score | Level | UI Treatment | Example |
| :--- | :--- | :--- | :--- |
| **0 – 20** | 🟢 Fair Trade | Green checkmark, no interruption | Values within 15% of each other |
| **21 – 50** | 🟡 Mild Imbalance | Yellow banner with suggestion | "Consider asking for 50 more DGLD to balance." |
| **51 – 75** | 🟠 Significant Drain | Orange modal with breakdown | "You're offering $120 in assets for $45 in return." |
| **76 – 100** | 🔴 Critical Drain | Red full-screen intervention | "This trade loses 80%+ of value. Are you absolutely sure?" |

#### C. Countermeasure Actions (UI)
When the severity score is ≥ 21, the UI presents actionable suggestions:
1. **"Add Top-Up"**: Suggests the counterparty add DGLD or additional items to balance the swap.
2. **"Adjust Quantities"**: Recommends changing the amounts (e.g., "Reduce from 5 God Cards to 2").
3. **"Request Different Asset"**: Suggests an alternative asset from the counterparty's portfolio that would create a fairer trade.
4. **"Override & Proceed"**: Always available. The user can dismiss the warning and proceed with full knowledge of the imbalance.

#### D. How the Score is Computed
```
Severity = min(100, round(|offeredUSD - wantedUSD| / max(offeredUSD, wantedUSD) × 100))
```
- If `offeredUSD = $120` and `wantedUSD = $45`: Severity = `|120-45| / 120 × 100` = **62.5** (🟠 Significant Drain)
- If `offeredUSD = $50` and `wantedUSD = $47`: Severity = `|50-47| / 50 × 100` = **6** (🟢 Fair Trade)

---

## 8. The AI Guardian Security Layer
The bridge between external games and the D-MEX protocol is protected by the **AI Guardian**:

- **Sybil Prevention**: Tracks account age and reputation across platforms (Steam ID for CS2, Wallet Age for Loot/CK/GU).
- **Double-Spend Protection**: Ensures that if a source asset is moved on its native chain (e.g., a Kitty is sold on OpenSea mid-escrow), the D-MEX barter is instantly flagged and blocked.
- **Fair Value Guard**: Computes a **severity score** (0–100) for value asymmetry. Does NOT block swaps — only warns with escalating severity UI. Users always have final say.
- **Psychology Heuristics**: Detects cognitive biases (Endowment Effect, FOMO, Anchoring) and provides educational nudges.

---

> [!TIP]
> **To demonstrate these integrations:**
> Navigate to the "Open Market" or "Peer Discovery" tabs. You will find 50 mock traders populated with diverse portfolios containing CS2 skins, Loot Bags, Gods Unchained Cards, CryptoKitties, and UGC assets — all cross-tradeable with each other.
