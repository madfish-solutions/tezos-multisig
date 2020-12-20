import { MichelsonMap } from "@taquito/michelson-encoder";
import accounts from "../accounts/accounts";

export default {
  pendings: MichelsonMap.fromLiteral({}),
  managers: [accounts.alice, accounts.bob],
  id_count: "0",
  required: "2",
};
