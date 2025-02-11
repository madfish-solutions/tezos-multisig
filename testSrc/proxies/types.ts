import BigNumber from "bignumber.js";

export declare type Account = {
  actions: any;
  approve: string[];
  expired: number;
};

export declare type MultisigStorage = {
  pendings: { [key: string]: Account };
  managers: string[];
  id_count: BigNumber;
  required: BigNumber;
};
