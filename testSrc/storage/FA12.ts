import { MichelsonMap } from "@taquito/michelson-encoder";
import accounts from "../accounts/accounts";

const totalSupply = "10000000";

export default {
  owner: accounts.alice.pkh,
  totalSupply: totalSupply,
  ledger: MichelsonMap.fromLiteral({
    [accounts.alice.pkh]: {
      balance: totalSupply,
      allowances: MichelsonMap.fromLiteral({}),
    },
  }),
};
