# Testing D-MEX Protocol

This plan outlines the steps to verify the functionality of the D-MEX Protocol, including the smart contracts, the AI Guardian server, and the frontend user experience.

## Proposed Changes

### [Phase 1] Smart Contract Testing
- Run the Foundry test suite to verify the core vault logic, including multi-token transfers, streaming limits, and arbiter-signed tax collection.
- **Command**: `forge test`

### [Phase 2] Guardian Logic Testing
- Run the standalone arbiter test script to verify the Peg-Defense and Anti-Spiral circuit breaker logic.
- **Command**: `node guardian/test-arbiter.js`

### [Phase 3] Integrated System Testing
- Start the Guardian server, which also serves the frontend.
- Launch the browser to interact with the application, testing:
    - Wallet connection.
    - Demo Mode initialization.
    - Asset marketplace population.
    - Trade proposal and Guardian evaluation.
- **Command**: `node guardian/guardian.js` (in the `guardian` directory)

## Verification Plan

### Automated Tests
- `forge test` for smart contracts.
- `node guardian/test-arbiter.js` for guardian logic.

### Manual Verification
- Use the browser tool to navigate to `http://localhost:3000`.
- Verify the Guardian Analytics dashboard shows "Online" status.
- Test the "Diversified Seeder" in the marketplace.
- Propose a trade and observe the Guardian's real-time evaluation via WebSockets.
