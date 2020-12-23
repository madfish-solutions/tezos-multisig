import { ContractAbstraction, ContractProvider } from "@taquito/taquito";
import { TransactionOperation } from "@taquito/taquito/dist/types/operations/transaction-operation";
import { MultisigStorage } from "./types";
import { getLigo, prepareProviderOptions } from "./utils";
import { tezPrecision } from "./utils";
import BigNumber from "bignumber.js";
import { execSync } from "child_process";

export class Multisig {
  public contract: ContractAbstraction<ContractProvider>;
  public storage: MultisigStorage;

  constructor(contract: ContractAbstraction<ContractProvider>) {
    this.contract = contract;
  }

  static async init(multisigAddress: string): Promise<Multisig> {
    const multisig = new Multisig(await tezos.contract.at(multisigAddress));
    await multisig.updateStorage();
    return multisig;
  }

  async updateProvider(accountName: string): Promise<void> {
    const config = await prepareProviderOptions(accountName);
    tezos.setSignerProvider(config.signer);
  }

  async updateStorage(
    maps: {
      pendings?: BigNumber[];
    } = {}
  ): Promise<void> {
    const storage: any = await this.contract.storage();
    this.storage = {
      pendings: {},
      managers: storage.managers,
      id_count: storage.id_count,
      required: storage.required,
    };
    for (let key in maps) {
      this.storage[key] = await maps[key].reduce(async (prev, current) => {
        try {
          return {
            ...(await prev),
            [current]: await storage[key].get(current),
          };
        } catch (ex) {
          return {
            ...(await prev),
          };
        }
      }, Promise.resolve({}));
    }
  }

  async control(
    allowed: boolean,
    manager: string
  ): Promise<TransactionOperation> {
    const operation = await this.contract.methods
      .control(allowed, manager)
      .send();
    await operation.confirmation();
    await this.updateStorage();
    return operation;
  }

  async propose(
    name: string,
    approve: boolean,
    expired: number
  ): Promise<TransactionOperation> {
    let ligo = getLigo(true);
    const stdout = execSync(
      `${ligo} compile-parameter --michelson-format=json $PWD/testSrc/partial/${name}.ligo main 'Propose(record actions = call; approve = ${
        approve ? "True" : "False"
      }; expired = ${expired}n; end)'`,
      { maxBuffer: 1024 * 500 }
    );
    const operation = await tezos.contract.transfer({
      to: this.contract.address,
      amount: 0,
      parameter: {
        entrypoint: "propose",
        value: JSON.parse(stdout.toString()).args[0].args[0],
      },
    });
    await operation.confirmation();
    await this.updateStorage();
    return operation;
  }

  async approve(id: number): Promise<TransactionOperation> {
    const operation = await this.contract.methods.approve(id).send();
    await operation.confirmation();
    await this.updateStorage();
    return operation;
  }

  async require(confirms: number): Promise<TransactionOperation> {
    const operation = await this.contract.methods.require(confirms).send();
    await operation.confirmation();
    await this.updateStorage();
    return operation;
  }

  async execute(id: number): Promise<TransactionOperation> {
    const operation = await this.contract.methods.execute(id).send();
    await operation.confirmation();
    await this.updateStorage();
    return operation;
  }

  async default(amount: number): Promise<TransactionOperation> {
    const operation = await tezos.contract.transfer({
      to: this.contract.address,
      amount: amount / tezPrecision,
    });
    await operation.confirmation();
    return operation;
  }
}
