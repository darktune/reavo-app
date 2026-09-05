# Implementation Plan: Universal Vault

This plan outlines the implementation of the `UniversalVault.sol` contract supporting Atomic Multi-Asset Barter using an Escrow-Commitment pattern, integrated with Chainlink Functions, and optimized with Yul.

## User Review Required
> [!IMPORTANT]
> The requested framework directory is `/contracts`, but standard Foundry setup in the existing workspace uses `/src` (and `src/` currently exists). This plan configures Foundry to use `contracts/` as the primary source directory by updating `foundry.toml`. Please confirm if this is acceptable.
> [!NOTE]
> The AI Supervisor flow requires an off-chain Guardian validating against `@Guardian_Rules.md`. I will add a cryptographic verification signature hook in `UniversalVault.sol` to allow only the Guardian to approve the atomic swap. Is this standard ECDSA signature approach sufficient for the Escrow-Commitment pattern?

## Proposed Changes

### Foundry Structure Configuration
Configure Foundry workspace in `c:\Users\USER\OneDrive\Documents\Desktop\FYP\D_MEX PROTOCOL`.
#### [MODIFY] [foundry.toml](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX PROTOCOL/foundry.toml)
Update `src` to `contracts`. Ensure dependencies (OpenZeppelin, Chainlink) are configured in `remappings.txt` or `foundry.toml`.

### Universal Vault Smart Contract
#### [NEW] [UniversalVault.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX PROTOCOL/contracts/UniversalVault.sol)
Core atomic multi-asset barter logic.
- **Escrow-Commitment Architecture:** Party A commits/locks assets -> AI Supervisor evaluates & signs the state -> Party B locks/accepts & provides signature -> Atomic Swap triggers natively (or reverts if invalid constraints/signature).
- **Chainlink Functions:** Integration points to query real-time external asset valuations during the lifecycle if needed, or Guardian can bring the valuation as part of the meta-transaction.
- **Yul Optimization:** `_batchTransfer` will feature an inline assembly loop for ERC20 and Native token transfers to maximize gas efficiency on L2s (Polygon/Base) over standard iterations.

### AI Guardian Rules
#### [NEW] [Guardian_Rules.md](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX PROTOCOL/Guardian_Rules.md)
Documentation for AI Supervisor heuristics and conditions needed to construct valid swap approvals.

## Verification Plan

### Automated Tests
#### [NEW] [UniversalVault.t.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX PROTOCOL/test/UniversalVault.t.sol)
Will be written using `forge-std`.
- We will execute `forge test --match-contract UniversalVault` to test the contract logic.
- **Atomic Swap Flow:** Test Escrow-Commitment logic securely locking and swapping assets based on correct Guardian signatures.
- **Invalid Signatures:** Test reversion upon lacking or forged AI Supervisor signatures.
- **Gas Profiling:** We will execute `forge test --gas-report` to benchmark the efficiency of the Yul-optimized `_batchTransfer`.

### Manual Verification
- Deploying on a local anvil node (`anvil`) and triggering a mock Multi-Asset Barter to monitor emitted events and swap states via cast.
