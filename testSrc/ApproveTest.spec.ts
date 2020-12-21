import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks, tezPrecision, standardDelay } from "./proxies/utils";
import BigNumber from "bignumber.js";

const CMultisig = artifacts.require("Multisig");

contract.only("Approve()", function () {
  let multisig: Multisig;

  before(async function () {
    multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should accept proposal from admin", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.approve(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      1,
      "The number of confiramtions should 1"
    );
  });

  it("shouldn't accept proposal from user without admin rights", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("carol");
    await rejects(
      multisig.approve(id),
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

  it("should approve existed proposal", async function () {
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      2,
      "The number of confiramtions should 1"
    );
    await multisig.updateProvider("alice");
  });

  it("shouldn't approve non-existed proposal", async function () {
    const id = multisig.storage.id_count.toNumber();
    await multisig.updateProvider("bob");
    await rejects(
      multisig.approve(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/no-proposal",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
    await multisig.updateProvider("alice");
  });

  it("shouldn't approve twice", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.approve(id);
    await rejects(
      multisig.approve(id),
      (err) => {
        strictEqual(err.message, "Multisig/approved", "Error message mismatch");
        return true;
      },
      "Should fail"
    );
  });

  it("shouldn't approve if approved during suggestion stage", async function () {
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await rejects(
      multisig.approve(id),
      (err) => {
        strictEqual(err.message, "Multisig/approved", "Error message mismatch");
        return true;
      },
      "Should fail"
    );
  });

  it("should approve if not approved during suggestion", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.approve(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      1,
      "The number of confiramtions should 1"
    );
    await multisig.updateProvider("alice");
  });

  it("should approve before deadline", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.approve(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      1,
      "The number of confiramtions should 1"
    );
    await multisig.updateProvider("alice");
  });

  it("shouldn't approve after deadline", async function () {
    const minimalDeadline = 3600;
    await multisig.propose("transfer", false, minimalDeadline);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.approve(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id].approve.length,
      1,
      "The number of confiramtions should 1"
    );
    await multisig.updateProvider("alice");
  });
});
