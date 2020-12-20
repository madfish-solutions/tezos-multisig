## General Requirements:

1. Only active members are allowed to interact with contract (exept pure XTZ transfers)
2. Receive XTZ from any source
3. Add/remove new operators only if confirmed by reqired amount of owners
4. Change number of required keys only if confirmed by reqired amount of owners
5. A few proposal can be considered at the time
6. Proposal can be remove after expiration period
7. Min/max expiration time is delimited
8. Proposal can be executed after enough confirmations only
9. Proccess both transactions to contracts and transfers
10. Ensure tokens can be delegated.

## Test cases

### Test Item: Default Entrypoint

Scope: Test various ways to transfer tokens to the contract.
Action: Invoke the Default entrypoint.
Test Notes and Preconditions: Make sure the transfers from implicit and explicit contracts do well.
Verification Steps: Verify the balance of the contract grows.

Scenario 1: Test transfer from implicit account

Scenario 2: Test transfer from another contract

### Test Item: Propose Entrypoint

Scope: Test propose from users with different permissions.
Action: Invoke the Propose entrypoint.
Test Notes and Preconditions: Make sure the only proposals from admins will be accepted.
Verification Steps: Verify the operation only from authorized users are permitted.

Scenario 1: Test make proposal:

- from one of the admins
- from one without admin permissions
