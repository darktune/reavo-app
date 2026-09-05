# Game Integration + UI Polish

Add a **Game Registry** to D-MEX that references real blockchain game contracts, expand the marketplace with cross-game trading, and polish remaining UI issues.

## User Review Required

> [!IMPORTANT]
> This integration uses **references** to real mainnet game contracts (Loot, Gods Unchained, CryptoKitties) to demonstrate cross-game trading. Since D-MEX is on Scroll Sepolia, actual asset transfers from those games won't work — but the UI will show how cross-game barter **would** work, and the existing mock contracts serve as stand-ins for the demo. This approach is ideal for an FYP viva because:
> - No mainnet ETH needed
> - No dependency on external game servers
> - You control the full demo flow

## Proposed Changes

### 1. Game Registry (`vault-abi.js`)

Add a `GAME_REGISTRY` object mapping real game contracts:

```javascript
const GAME_REGISTRY = {
    dmex: {
        name: 'D-MEX Native',
        chain: 'Scroll Sepolia',
        icon: '🛡️',
        assets: {
            dgld: { name: 'DGLD (Gold)', type: 'ERC-20', contract: CONTRACTS.DGLD, icon: 'G', iconClass: 'gold' },
            sword: { name: 'NFT Sword', type: 'ERC-721', contract: CONTRACTS.NFT_SWORD, icon: '⚔', iconClass: 'sword' },
            commodity: { name: 'Commodity', type: 'ERC-1155', contract: CONTRACTS.COMMODITY, icon: '◆', iconClass: 'commodity' }
        }
    },
    loot: {
        name: 'Loot (Adventurers)',
        chain: 'Ethereum Mainnet',
        icon: '🎒',
        mainnetContract: '0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7',
        assets: {
            loot_bag: { name: 'Loot Bag', type: 'ERC-721', contract: CONTRACTS.NFT_SWORD, icon: '🎒', iconClass: 'loot' }
        }
    },
    gods: {
        name: 'Gods Unchained',
        chain: 'Ethereum / IMX',
        icon: '⚡',
        mainnetContract: '0x0E3A2A1f2146d86A604adc220b4967A898D7Fe07',
        assets: {
            god_card: { name: 'God Card', type: 'ERC-721', contract: CONTRACTS.NFT_SWORD, icon: '🃏', iconClass: 'gods' }
        }
    },
    cryptokitties: {
        name: 'CryptoKitties',
        chain: 'Ethereum Mainnet',
        icon: '🐱',
        mainnetContract: '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d',
        assets: {
            kitty: { name: 'CryptoKitty', type: 'ERC-721', contract: CONTRACTS.NFT_SWORD, icon: '🐱', iconClass: 'kitty' }
        }
    }
};
```

#### [MODIFY] [vault-abi.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/vault-abi.js)
- Add `GAME_REGISTRY` constant with 4 games
- Add new icon CSS classes for each game

---

### 2. Expanded Asset Dropdown (`app.js`)

#### [MODIFY] [app.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/app.js)
- Expand `ASSETS` object to include Loot, Gods Unchained, CryptoKitties assets
- Add `game` property to each asset for filtering
- Update `updateAssetUI()` to show game origin badge
- Add game assets to swap suggestions

---

### 3. Cross-Game Marketplace Listings (`guardian.js`)

#### [MODIFY] [guardian.js](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/guardian/guardian.js)
- Add cross-game marketplace listings (e.g., "Loot Bag #42", "God Card — Demogorgon")
- Add game tag/badge to each listing
- Show which game each asset originates from

---

### 4. UI Updates (`index.html` + `styles.css`)

#### [MODIFY] [index.html](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/index.html)
- Add game filter tabs above marketplace ("All Games" / "D-MEX" / "Loot" / "Gods Unchained" / "CryptoKitties")
- Add game origin badges on asset cards

#### [MODIFY] [styles.css](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/frontend/styles.css)
- Add game-specific icon colors (Loot = brown, Gods = blue, CryptoKitties = pink)
- Add game origin badge styling
- Minor polish: fix any remaining alignment issues

---

## Verification Plan

### Browser Tests
1. Asset dropdown shows all 6+ assets with game badges
2. Marketplace shows cross-game listings with game tags
3. Swap from Loot Bag → DGLD works without errors
4. Game filter tabs filter marketplace correctly
5. Swap suggestions include cross-game combinations
