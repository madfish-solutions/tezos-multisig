declare type _contractTest = (accounts: string[]) => void;
declare let contract: ContractFunction;

interface ContractFunction {
  (title: string, fn: (this: any) => void): any;
  (title: string): any;
  only: any;
  skip: any;
}

declare interface TransactionMeta {
  from: string;
}

declare interface Contract<T> {
  "new"(storage: any): Promise<T>;
  deployed(): Promise<T>;
  at(address: string): T;
  address: string;
}

declare interface Artifacts {
  require(name: "Multisig"): Contract<MultisigContractInstance>;
  require(name: "TTokensResender"): Contract<TTokensResenderContractInstance>;
  require(name: "TFA12"): Contract<TFA12ContractInstance>;
}

declare interface MultisigContractInstance {
  address: string;
  control(allowed: boolean, manager: string): any;
  propose(proposal: string, approve: boolean, expired: number): any;
  default(): any;
  approve(id: number): any;
  require(confirms: number): any;
  execute(id: number): any;
}
declare interface TTokensResenderContractInstance {
  address: string;
  main(address: string, options: any): any;
}

declare interface TFA12ContractInstance {
  address: string;
  storage(): any;
  transfer(sender: string, receiver: string, amount: number): any;
  approve(spender: string, amount: number): any;
  getBalance(owner: string, contract: any): any;
  getAllowance(owner: string, spender: string, contract: any): any;
  getTotalSupply(unit: any, contract: any): any;
}

declare var artifacts: Artifacts;
declare var tezos: any;
