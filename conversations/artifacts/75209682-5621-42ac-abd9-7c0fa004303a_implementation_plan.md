# DMEX Protocol: Atomic Multi-Asset Barter System Plan

This plan formalizes the construction of the `UniversalVault` via the Guardian Swap Algorithm.

## Proposed Changes

### Environment & Dependencies
- Initialize Foundry in `c:\Users\USER\OneDrive\Documents\Desktop\FYP\solidity`.
- Install `openzeppelin-contracts-upgradeable` for UUPS proxy support.
- Install Chainlink smart contract dependencies.

### Core Contracts

#### [NEW] [UniversalVault.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/src/UniversalVault.sol)
1. **Architecture & Upgradeability**: Implement the UUPS Proxy pattern.
2. **Security**: 
    - Utilize Transient Storage (`TSTORE`/`TLOAD`) in Solidity 0.8.24+ for the `ReentrancyGuard` to mitigate Node L2 (Reentrancy) efficiently.
    - Implement a Hashed Timelock Contract (HTLC) variant for the commitment phase and refundability.
3. **AI Guardian Interface**:
    - `checkRiskScore()`: Internal hook to validate swaps against the Attack Tree (Metadata Fraud, Fake Liquidity, Sybil Pumping).
4. **Valuation**:
    - `isFairTrade()`: Leverage Chainlink Oracles to ensure Bundle A value ≈ Bundle B value (mitigates Node L1 Value Drain).
5. **Execution**:
    - `batchTransfer`: Optimize the critical transfer loops using `yul` (Inline Assembly) to reduce gas overhead for multi-asset settlement. Strict atomicity (all or nothing).

#### [NEW] [AttackTreeSchema.json](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/schema/AttackTreeSchema.json)
- Define standard JSON schema representing Nodes A1-A3 and L1-L3 for the AI Supervisor to consume.

## Verification Plan

### Automated Tests
#### [NEW] [Vault.t.sol](file:///c:/Users/USER/OneDrive/Documents/Desktop/FYP/solidity/test/Vault.t.sol)
- Comprehensive Foundry Fuzz Test suite simulating 5,000 random heterogeneous asset trades.
- Invariants: Vault balance consistency, exact state rollback on failure, and HTLC expiry correctness.


