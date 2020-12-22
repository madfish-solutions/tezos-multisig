import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks, tezPrecision, standardDelay } from "./proxies/utils";
import BigNumber from "bignumber.js";

const CMultisig = artifacts.require("Multisig");

contract("Propose()", function () {
  let multisig: Multisig;

  before(async function () {
    multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should accept one proposal", async function () {
    await multisig.updateProvider("alice");
    const initialStorage = multisig.storage;
    await multisig.propose("transfer", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.id_count.toNumber(),
      initialStorage.id_count.toNumber() + 1,
      "The number of requests should increase"
    );
  });

  it("should accept more than one proposal", async function () {
    await multisig.updateProvider("alice");
    const count = 4;
    const initialStorage = multisig.storage;
    for (let i = 0; i < count; i++)
      await multisig.propose("transfer", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.id_count.toNumber(),
      initialStorage.id_count.toNumber() + count,
      "The number of requests should increase"
    );
  });

  it("should accept proposal from admin", async function () {
    await multisig.updateProvider("alice");
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
  });

  it("should accept transfer proposal", async function () {
    await multisig.updateProvider("alice");
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
    await multisig.updateProvider("alice");
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
    await multisig.updateProvider("alice");
    const initialStorage = multisig.storage;
    await multisig.propose("invoke", false, standardDelay);
    const finalStorage = multisig.storage;
    strictEqual(
      initialStorage.id_count.toNumber() + 1,
      finalStorage.id_count.toNumber(),
      "The number of requests should increase"
    );
  });

  it("shouldn't accept proposal with too long delay", async function () {
    await multisig.updateProvider("alice");
    const longDelay = 20000000;
    await rejects(
      multisig.propose("transfer", false, longDelay),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/wrong-duration",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("shouldn't accept proposal with too short delay", async function () {
    await multisig.updateProvider("alice");
    const shortDelay = 1000;
    await rejects(
      multisig.propose("transfer", false, shortDelay),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/wrong-duration",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("should accept proposal with delay in range", async function () {
    await multisig.updateProvider("alice");
    await multisig.propose("invoke", false, standardDelay);
  });

  it("should accept proposal with minimal delay ", async function () {
    await multisig.updateProvider("alice");
    const minimalDelay = 3600;
    await multisig.propose("invoke", false, minimalDelay);
  });

  it("should accept proposal with maximal delay ", async function () {
    await multisig.updateProvider("alice");
    const maximalDelay = 15552000;
    await multisig.propose("invoke", false, maximalDelay);
  });

  it("shouldn't approve proposal during suggestion if flag isn't set", async function () {
    await multisig.updateProvider("alice");
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      0,
      "The number of confiramtions should 0"
    );
  });

  it("should approve proposal during suggestion if flag is set", async function () {
    await multisig.updateProvider("alice");
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      1,
      "The number of confiramtions should 1"
    );
  });
});
