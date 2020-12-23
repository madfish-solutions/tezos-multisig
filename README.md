# Description

This project contains the Multisig wallet implementation on Ligo that enables both.

# Project structure

```
.
├──  contracts/ # contracts
├──  testSrc/ # test cases
├──  storage/ # initial storage for contract origination
├──  README.md # current file
├──  .gitignore
├──  package.json
```

# Prerequisites

- Installed NodeJS (tested with NodeJS v12+)
- Installed Truffle:

```
npm install -g truffle@tezos

```

- Installed ganache-cli:

```
npm install -g ganache-cli@tezos

```

- Installed Ligo:

```
curl https://gitlab.com/ligolang/ligo/raw/dev/scripts/installer.sh | bash -s "next"
```

- Installed node modules:

```
cd tezos-multisig && yarn
```

- Configure `truffle-config.js` if [needed](https://www.trufflesuite.com/docs/tezos/truffle/reference/configuring-tezos-projects).

# Quick Start

To compile and deploy contracts to Delphinet run:

```
yarn migrate-delphinet
```

For the development network:

```
yarn migrate # development
```

# Usage

Contracts are processed in the following stages:

1. Compilation
2. Deployment
3. Configuration
4. Interactions on-chain

## Compilation

To compile the contracts run:

```
yarn compile
```

Artifacts are stored in the `build/contracts` directory.

## Deployment

For deployment step the following command should be used:

```
yarn migrate
```

Addresses of deployed contracts are displayed in terminal.

For other networks:

```
yarn migrate-delphinet
```

# Contracts

The main contract is `Multisig` with the following interface:

```
type operator_info is record [
  allowed     : bool;
  manager     : address;
]

type proposal_info is record [
  actions     : unit -> list(operation);
  approve     : bool;
  expired     : nat;
]

type action is
| Control of operator_info
| Propose of proposal_info
| Default of unit
| Approve of nat
| Execute of nat
| Require of nat
```

## Control

The entrypoint is used to add or remove the new wallet managers. Can only be called by the wallet itself.

`allowed` : whether add or remove the maanger;
`manager` : address of the updated manager.

## Require

The entrypoint is used to set the required number of confirmmations. Can only be called by the wallet itself.

`count` : required amount of proposal confirmations to enable execution.

## Default

The entrypoint to receive XTZ payments. No parameters are required.

## Propose

The entrypoint is used to propose the specific operations to be executed. Can only be called by mangers.

`actions` : lambda that returns the operations that should be executed;
`approve` : whether the sender confirms the proposal;
`expired` : the time until the proposal is valid and can be executed.

## Approve

The entrypoint is used to approve the specific proposal. Can only be called by mangers.

`id` : identifier of the proposal to be approved.

## Execute

The entrypoint is used to execute the specific approved proposal. Can only be called by mangers.

`id` : identifier of the proposal to be executed.

# Testing

Truffle framework is used for testing. Run:

```
yarn test
```

NOTE: if you want to use a different provider, configure `truffle-config.js`.
More info about test coverage in `tests.md`
