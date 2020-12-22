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
11. Proposal can be confirmed or not during the suggestion of the proposal.

## Test cases

### Test Item: Default Entrypoint

Scope: Test various ways to transfer tokens to the contract.
Action: Invoke the Default entrypoint.
Test Notes and Preconditions: Make sure the transfers from implicit and explicit contracts do well.
Verification Steps: Verify the balance of the contract grows.

Scenario 1: Test transfer from implicit account

[x] send from Alice

Scenario 2: Test transfer from another contract

[x] send from Carol

### Test Item: Propose Entrypoint

Scope: Test propose from users with different permissions.
Action: Invoke the Propose entrypoint.
Test Notes and Preconditions: Make sure the only proposals from admins will be accepted.
Verification Steps: Verify the operation only from authorized users are permitted.

Scenario 1: Test make proposal:

[x] from one of the admins
[x] from one without admin permissions

Scope: Test different amount of proposals.
Action: Invoke the Propose entrypoint.
Test Notes and Preconditions: Make sure the any amount of proposals can be kept.
Verification Steps: Verify the proposal is added even the others aren't executed.

Scenario 1: Test make proposal:

[x] 1 proposal
[x] 4 proposals

Scope: Test different kinds of proposals.
Action: Invoke the Propose entrypoint.
Test Notes and Preconditions: Make sure the transfer, invoke smat contract and batch of operations can be proposed.
Verification Steps: Verify the proposal is added regardless of the content.

Scenario 1: Test make proposal of:

[x] transfer
[x] invoke contract
[x] batch of operations

Scope: Test different expiration period of proposals.
Action: Invoke the Propose entrypoint.
Test Notes and Preconditions: Make sure the expiration period is in the bound.
Verification Steps: Verify the proposal is added only if the expiration timeout is correct.

Scenario 1: Test make proposal with the expiration period of:

[x] 20000000 seconds
[x] 1000 seconds
[x] 3600 seconds
[x] 15552000 seconds
[x] 200000 seconds

Scope: Test confirm option of the proposal suggestion.
Action: Invoke the Propose entrypoint.
Test Notes and Preconditions: Make sure the confirmation is done only if the user set the option.
Verification Steps: Verify the proposal is confirmed by sender if the option is set.

Scenario 1: Test make proposal:

[x] with approve=true
[x] with approve=false

### Test Item: Approve Entrypoint

Scope: Test approve from users with different permissions.
Action: Invoke the Approve entrypoint.
Test Notes and Preconditions: Make sure the proposals can be approved by admins only.
Verification Steps: Verify the approvals only from authorized users are permitted.

Scenario 1: Test approve:

[x] from one of the admins
[x] from one without admin permissions

Scope: Test approve in delay range.
Action: Invoke the Approve entrypoint.
Test Notes and Preconditions: Make sure the expired proposals cann't be approved.
Verification Steps: Verify the expired transaction is approved if is valid or removed if it is approved after expiration.

Scenario 1: Test approve:

[x] before deadline
[] after deadline

Scope: Test approve of non-existent proposal.
Action: Invoke the Approve entrypoint.
Test Notes and Preconditions: Make sure the non-existed proposals cann't be approved.
Verification Steps: Verify the approve of non-existed fails.

Scenario 1: Test approve:

[x] existed proposal
[x] non-existed proposal

Scope: Test approve twice.
Action: Invoke the Approve entrypoint.
Test Notes and Preconditions: Make sure the admin can't submit approval twice.
Verification Steps: Verify the second approve fails.

Scenario 1: Test approve:

[x] approve twice
[x] approve after submission without approve
[x] approve after submission with approve

### Test Item: Execute Entrypoint

Scope: Test execute from users with different permissions.
Action: Invoke the Execute entrypoint.
Test Notes and Preconditions: Make sure the proposals can be executed by admins only.
Verification Steps: Verify the approvals only from authorized users are permitted.

Scenario 1: Test execute:

[x] from one of the admins
[x] from one without admin permissions

Scope: Test execute with different confirmations.
Action: Invoke the Execute entrypoint.
Test Notes and Preconditions: Make sure the proposals can be executed by admins only.
Verification Steps: Verify the approvals only from authorized users are permitted.

Scenario 1: Test execute:

[x] with no confiramation
[x] with not enough confirmations
[x] with enough confirmations
[] with more confirmations

Scope: Test different kinds of proposals.
Action: Invoke the Execute entrypoint.
Test Notes and Preconditions: Make sure the transfer, invoke smat contract and batch of operations can be executed.
Verification Steps: Verify the proposal is executed regardless of the content.

Scenario 1: Test make proposal of:

[x] transfer
[x] invoke contract
[x] batch of operations

Scope: Test execute with different expiration period of proposals.
Action: Invoke the Execute entrypoint.
Test Notes and Preconditions: Make sure the expiration period is in the bound during the execution stage.
Verification Steps: Verify the proposal is executed only if the expiration timeout is correct.

Scenario 1: Test make proposal with the expiration period of:

[x] before deadline
[] after deadline

Scope: Test execute of non-existent proposal.
Action: Invoke the Execute entrypoint.
Test Notes and Preconditions: Make sure the non-existed proposals cann't be executed.
Verification Steps: Verify the execute of non-existed proposal fails.

Scenario 1: Test execute:

[x] existed proposal
[x] non-existed proposal

Scope: Test execute twice.
Action: Invoke the Execute entrypoint.
Test Notes and Preconditions: Make sure the admin can't execute proposal twice.
Verification Steps: Verify the second execute request fails.

Scenario 1: Test execute:

[x] twice
