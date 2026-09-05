# Execution Plan: EIP-1271 Multi-Sig Support

This plan outlines the steps to upgrade `DMEXVault.sol` to support EIP-1271 smart contract signatures, resolving the last major critical security item mapped inside your `AUDIT.md`. This is a vital architecture step before deploying to mainnet, as it enables your AI Guardian's private key to be managed by a robust Gnosis Safe multi-sig, eliminating single-point-of-failure risks.

## User Review Required

> [!WARNING]  
> Modifying the vault requires altering core cryptographic pathways. I will replace the raw `ecrecover` logic with OpenZeppelin's highly vetted `SignatureChecker`, which deterministically checks if the signer is a Smart Contract Wrapper (EIP-1271) or a standard user Wallet (EOA).

## Proposed Changes

### 1. Smart Contract Upgrade (`src/DMEXVault.sol`)
The fundamental change shifts responsibility of signature verification away from raw EVM primitives to an abstraction standard.

#### [MODIFY] [DMEXVault.sol](file:///C:/Users/USER/OneDrive/Documents/Desktop/FYP/D_MEX%20PROTOCOL/src/DMEXVault.sol)
- **Import:** I will add `import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";` to expose standard EIP-1271 checking.
- **Library Application:** I will apply `using SignatureChecker for address;` to standardize verification syntax.
- **Refactoring Encryption:** Inside `_validateArbiterSignature()`, I will completely remove the custom `_splitSignature` and `ecrecover` assembly wrapper we current use. Instead, I will implement `require(guardianSigner.isValidSignatureNow(ethSignedMessageHash, signature), "Invalid Arbiter Signature");`.

### 2. Vault Re-Compilation
After shifting EVM byte-handlers, I must verify that Solidity compilation executes cleanly.

#### [MODIFY] Vault
- **Verification:** Execute `forge build` to confirm `SignatureChecker` accurately resolves dependencies and compilation finishes with zero errors.

---

## Open Questions

> [!IMPORTANT]  
> Are there any tests running inside `test/DMEXVault.t.sol` that aggressively target the old malformed `v, r, s` variables natively? If so, relying on OZ's checking limits those specific raw variable fuzzes, although it guarantees EVM compliance. 

**Are you ready for me to modify the Vault contract logic?**
