import { ContractAbstraction, ContractProvider } from "@taquito/taquito";
import { TransactionOperation } from "@taquito/taquito/dist/types/operations/transaction-operation";
import { MultisigStorage } from "./types";
import { prepareProviderOptions } from "./utils";
import { tezPrecision } from "./utils";
import BigNumber from "bignumber.js";

export class Multisig {
  public contract: ContractAbstraction<ContractProvider>;
  public storage: MultisigStorage;

  constructor(contract: ContractAbstraction<ContractProvider>) {
    this.contract = contract;
  }

  static async init(multisigAddress: string): Promise<Multisig> {
    return new Multisig(await tezos.contract.at(multisigAddress));
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
      managers: storage.last_updated,
      id_count: storage.earnings_end,
      required: storage.total_staked,
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
    proposal: string,
    approve: boolean,
    expired: number
  ): Promise<TransactionOperation> {
    const operation = await this.contract.methods
      .propose(proposal, approve, expired)
      .send();
    await operation.confirmation();
    await this.updateStorage();
    return operation;
  }

  async approve(id: string): Promise<TransactionOperation> {
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
