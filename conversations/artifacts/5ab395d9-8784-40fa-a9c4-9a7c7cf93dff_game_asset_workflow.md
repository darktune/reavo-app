# D-MEX: 3D Game Asset Integration Workflow

> **Save this for later** when you have real game files (Blender, etc.) ready to test.

## How Game Assets Connect to D-MEX

The D-MEX protocol **does not store actual game files on-chain** (that would be impossibly expensive). Instead, the blockchain stores **tokens that represent ownership** of those assets. The actual 3D models, textures, etc. are stored off-chain and linked to the token via metadata.

## Workflow

1. **Create your 3D assets** in Blender (swords, armor, land plots, etc.)
2. **Export and upload** them to IPFS (using [Pinata](https://pinata.cloud) or [NFT.Storage](https://nft.storage))
3. **Create metadata JSON** pointing to the IPFS file:
   ```json
   {
     "name": "Legendary Sword of Fire",
     "description": "A rare weapon forged in the D-MEX realm.",
     "image": "ipfs://Qm.../sword_preview.png",
     "animation_url": "ipfs://Qm.../sword_model.glb",
     "attributes": [
       { "trait_type": "Damage", "value": 150 },
       { "trait_type": "Rarity", "value": "Legendary" }
     ]
   }
   ```
4. **Mint ERC-721/ERC-1155 tokens** that point to the IPFS metadata
5. **Trade those tokens on D-MEX** — when someone receives the NFT, they can load the linked 3D asset into their game client

## Reference Projects
- **The Sandbox** and **Decentraland** use this exact pattern.
- File formats: `.glb` / `.gltf` (3D), `.png` (previews), `.json` (metadata).
