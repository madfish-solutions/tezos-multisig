import { execSync } from "child_process";
import { InMemorySigner } from "@taquito/signer";
import { TransactionOperation } from "@taquito/taquito/dist/types/operations/transaction-operation";
import accounts from "../accounts/accounts";
export const tezPrecision = 1e6;
export const standardDelay = 200000;
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export function getLigo(isDockerizedLigo: boolean): string {
  let path = "ligo";
  if (isDockerizedLigo) {
    path = "docker run -v $PWD:$PWD --rm -i ligolang/ligo:next";
    try {
      execSync(`${path}  --help`);
    } catch (err) {
      path = "ligo";
      execSync(`${path}  --help`);
    }
  } else {
    try {
      execSync(`${path}  --help`);
    } catch (err) {
      path = "docker run -v $PWD:$PWD --rm -i ligolang/ligo:next";
      execSync(`${path}  --help`);
    }
  }
  return path;
}

export async function prepareProviderOptions(
  name: string = "alice"
): Promise<{ signer: InMemorySigner; config: object }> {
  const secretKey = accounts[name].sk.trim();
  return {
    signer: await InMemorySigner.fromSecretKey(secretKey),
    config: {
      confirmationPollingTimeoutSecond: 100000,
    },
  };
}

export function calculateFee(
  operations: TransactionOperation[],
  address: string
): number {
  return operations.reduce((prev, current) => {
    let trxFee = current.fee;
    let internalFees = current.operationResults.reduce((prev, current) => {
      let balanceUpdates = current.metadata.operation_result.balance_updates;
      if (balanceUpdates) {
        return (
          prev +
          balanceUpdates.reduce(
            (prev, current) =>
              prev -
              (current.kind === "contract" && current.contract === address
                ? parseInt(current.change)
                : 0),
            0
          )
        );
      }
      return prev;
    }, 0);
    return prev + trxFee + internalFees;
  }, 0);
}

export async function bakeBlocks(count: number) {
  for (let i = 0; i < count; i++) {
    let operation = await tezos.contract.transfer({
      to: await tezos.signer.publicKeyHash(),
      amount: 1,
    });
    await operation.confirmation();
  }
}

export async function updateAddressInInvoke(address: string) {
  const file = "../../testSrc/partial/invoke.ligo";
  const path = join(__dirname, file);
  const data = await readFileSync(path, "utf8");
  const newTokenStr = 'token : address = ("' + address + '"';
  const result = data.replace(/token : address = \("[\w\d]+"/g, newTokenStr);
  await writeFileSync(path, result, "utf8");
}

export async function updateRequireData(address: string, count: number) {
  const file = "../../testSrc/partial/require.ligo";
  const path = join(__dirname, file);
  const data = await readFileSync(path, "utf8");
  const newMultisigStr = 'multisig : address = ("' + address + '"';
  const newCountStr = "count : nat = " + count + "n";
  const result = data
    .replace(/multisig : address = \("[\w\d]+"/g, newMultisigStr)
    .replace(/count : nat = [\d]+n/g, newCountStr);
  await writeFileSync(path, result, "utf8");
}

export async function updateControlData(
  address: string,
  allowed: boolean,
  manager: string
) {
  const file = "../../testSrc/partial/control.ligo";
  const path = join(__dirname, file);
  const data = await readFileSync(path, "utf8");
  const newMultisigStr = 'multisig : address = ("' + address + '"';
  const newManagerStr = 'manager : address = ("' + manager + '"';
  const newAllowedStr =
    "allowed : bool = " + (allowed ? "True" : "False") + ";";
  const result = data
    .replace(/multisig : address = \("[\w\d]+"/g, newMultisigStr)
    .replace(/manager : address = \("[\w\d]+"/g, newManagerStr)
    .replace(/allowed : bool = [\w]+;/g, newAllowedStr);
  await writeFileSync(path, result, "utf8");
}
