import { Multisig } from "./proxies/multisig";
import multisigStorage from "./storage/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks, tezPrecision } from "./proxies/utils";

const CMultisig = artifacts.require("Multisig");
const CTTokensResender = artifacts.require("TTokensResender");

contract("Default()", function () {
  let multisig: Multisig;

  before(async function () {
    const multisigContract = await CMultisig.new(multisigStorage);
    multisig = await Multisig.init(multisigContract.address.toString());
  });

  it("should receive tokens from implicit account", async function () {
    await multisig.updateProvider("alice");
    const amount = 1000000;
    const multisigAddress = multisig.contract.address;
    const initialBalance = await tezos.tz.getBalance(multisigAddress);
    await multisig.default(amount);
    const filalBalance = await tezos.tz.getBalance(multisigAddress);
    strictEqual(
      initialBalance.toNumber() + amount,
      filalBalance.toNumber(),
      "The balance should increase"
    );
  });

  it("should receive tokens from explicit account", async function () {
    await multisig.updateProvider("alice");
    const amount = 1000000;
    const tokensResender = await CTTokensResender.new(undefined);
    const multisigAddress = multisig.contract.address;
    const initialBalance = await tezos.tz.getBalance(multisigAddress);
    await tokensResender.main(multisigAddress, {
      amount: amount / tezPrecision,
    });
    const filalBalance = await tezos.tz.getBalance(multisigAddress);
    strictEqual(
      initialBalance.toNumber() + amount,
      filalBalance.toNumber(),
      "The balance should increase"
    );
  });
});
