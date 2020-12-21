import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks, tezPrecision } from "./proxies/utils";
import BigNumber from "bignumber.js";

const CMultisig = artifacts.require("Multisig");
const CTTokensResender = artifacts.require("TTokensResender");

contract("Propose()", function () {
  let multisig: Multisig;

  before(async function () {
    multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should accept proposal from admin", async function () {
    const amount = 1000000;
    const aliceAddress = await tezos.signer.publicKeyHash();
    const multisigAddress = multisig.contract.address;
    await multisig.updateStorage();
    const initialStorage = multisig.storage;
    await multisig.propose("transfer", false, 200000);
    await multisig.updateStorage({ pendings: [new BigNumber(0)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.id_count.toNumber(),
      1,
      "The number of requests should increase"
    );
    strictEqual(
      finalStorage.pendings[0].approve.length,
      0,
      "The number of approves should be 0"
    );
  });
});
