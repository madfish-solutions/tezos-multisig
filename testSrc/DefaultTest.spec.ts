import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks, tezPrecision } from "./proxies/utils";

const CMultisig = artifacts.require("Multisig");
contract("Default()", function () {
  let multisig: Multisig;

  beforeEach(async function () {
    this.multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should fail if not permitted", async function () {
    const amount = 1000000;
    const aliceAddress = await tezos.signer.publicKeyHash();
    const multisigAddress = this.multisig.contract.address;
    const initialBalance = await tezos.tz.getBalance(multisigAddress);
    await this.multisig.default(amount);
    const filalBalance = await tezos.tz.getBalance(multisigAddress);
    strictEqual(
      initialBalance.toNumber() + amount,
      filalBalance.toNumber(),
      "The balance should increase"
    );
  });
});
