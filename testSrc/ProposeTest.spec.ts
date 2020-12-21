import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks, tezPrecision, standardDelay } from "./proxies/utils";
import BigNumber from "bignumber.js";

const CMultisig = artifacts.require("Multisig");

contract.only("Propose()", function () {
  let multisig: Multisig;

  before(async function () {
    multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should accept one proposal", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.id_count.toNumber(),
      1,
      "The number of requests should increase"
    );
  });

  it("should accept more than one proposal", async function () {
    const count = 4;
    const initialStorage = multisig.storage;
    for (let i = initialStorage.id_count.toNumber(); i < count; i++)
      await multisig.propose("transfer", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.id_count.toNumber(),
      count,
      "The number of requests should increase"
    );
  });

  it("should accept proposal from admin", async function () {
    const initialStorage = multisig.storage;
    await multisig.propose("transfer", false, standardDelay);
    await multisig.updateStorage({ pendings: [new BigNumber(0)] });
    const finalStorage = multisig.storage;
    strictEqual(
      initialStorage.id_count.toNumber() + 1,
      finalStorage.id_count.toNumber(),
      "The number of requests should increase"
    );
  });

  it("shouldn't accept proposal from user without admin rights", async function () {
    const amount = 1000000;
    await multisig.updateProvider("carol");
    await rejects(
      multisig.propose("transfer", false, standardDelay),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/not-permitted",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
    await multisig.updateProvider("alice");
  });

  it("should accept transfer proposal", async function () {
    const initialStorage = multisig.storage;
    await multisig.propose("transfer", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      initialStorage.id_count.toNumber() + 1,
      finalStorage.id_count.toNumber(),
      "The number of requests should increase"
    );
  });

  it("should accept batch proposal", async function () {
    const initialStorage = multisig.storage;
    await multisig.propose("batch", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      initialStorage.id_count.toNumber() + 1,
      finalStorage.id_count.toNumber(),
      "The number of requests should increase"
    );
  });

  it("should accept proposal of invoking contract", async function () {
    const initialStorage = multisig.storage;
    await multisig.propose("invoke", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      initialStorage.id_count.toNumber() + 1,
      finalStorage.id_count.toNumber(),
      "The number of requests should increase"
    );
  });
});
