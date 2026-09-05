# Goal Description
Significantly expand the D-MEX Discovery & Asset Marketplace tabs to reflect realistic population conditions. We will generate 50 robust mock peer identities and listings, integrate comprehensive 3D game engine token classes (Blender, Unity, Unreal, etc.) as "User Generated Content" (UGC) assets, build an upload-to-mint simulation interface, and introduce "perceived market value" scaling. 

## User Review Required
> [!IMPORTANT]
> The SDK Packaging and Flutter tasks have explicitly been put on hold to tackle this UI/UX pivot logic natively within the web protocol. Please verify that this plan perfectly matches your requirement for 50 diverse peer listings and 3D Asset minting workflows!

## Proposed Changes

### 1. DCC Game Engine Tokens (`vault-abi.js`)
We will expand the `GAME_REGISTRY` with a designated `ugc` (User Generated Content) suite reflecting the various modeling engines you specified:
- `UE5_Nanite_Mesh` (Unreal)
- `Blender_Scene` (Blender)
- `Maya_Rig` (Maya)
- `Unity_Prefab` (Unity)
- `CC5_Avatar` (Character Creator 4/5)
- `Marvelous_Designer_Fabric` (Marvelous Designer)
*Each asset will have varying `baseValue` definitions to demonstrate monetary worth.*

### 2. The 50-Mock Seeder (`app.js` & `guardian.js`)
Instead of 5 hardcoded arrays, we will introduce a mathematical seeder function:
- Generates 50 Mock EVM addresses natively.
- Assigns them randomized trust scores (reputation 20-100%).
- Randomly allocates holdings from the absolute entirety of `GAME_REGISTRY` (DGLD, CS2, Cryptokitties, Gods Unchained, and UGC items).
- The Guardian Node will auto-generate 50 active listings corresponding precisely to those addresses featuring an algorithmic "Perceived Market Value" which fluctuates ±15% off the `baseValue` per asset.

### 3. Marketplace Filter & User UI Overhaul (`index.html` & `app.js`)
- The "Asset Marketplace" grid rendering logic will be updated to display the `suggested holders` layout directly inside the listing card, matching the aesthetic currently used in Peer Discovery.
- The `All Games`/`ERC` category filters will be patched to aggressively filter through all 50 items instantly.

### 4. Upload & Mint Asset Modal Simulation (`index.html` & `app.js`)
- A new UI mechanism (button/modal) simulating the "Minting" process. You can "upload" a 3D asset file representation, bind a token value to it, and mint it to your direct EVM balance, letting it mathematically interact with your portfolio holdings immediately for open marketplace bartering.

## Open Questions
> [!WARNING]
> Do you want the "Mint Asset" feature to simply mock the minting to the frontend state (saving it directly to memory/localStorage so you can barter it immediately in the demo), or do you want the smart contract `DMEXVault.sol` updated to theoretically support natively minting these assets first? *(I strongly recommend frontend state simulation for demo fluidity).*

## Verification Plan
### Automated Tests
- Refresh the browser and verify the Marketplace Tab renders strictly 50 listings containing assets completely beyond DGLD.
- Verify `GUARDIAN_API/api/marketplace` response size equals 50.

### Manual Verification
- Execute a search using the keyword "Blender" to verify filters instantly drop array contents down to Blender assets.
- Open the Mint UI, create an "Unreal Mesh" and observe it updating the user balance dynamically.
