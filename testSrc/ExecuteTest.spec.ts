import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import {
  bakeBlocks,
  tezPrecision,
  standardDelay,
  updateAddressInInvoke,
} from "./proxies/utils";
import tokenStorage from "./storage/FA12";
import BigNumber from "bignumber.js";

const CMultisig = artifacts.require("Multisig");
const CTFA12 = artifacts.require("TFA12");

contract.only("Execute()", function () {
  let multisig: Multisig;

  before(async function () {
    multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should execute proposal from admin", async function () {
    const amount = tezPrecision;
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });

  it("shouldn't accept proposal from user without admin rights", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("carol");
    await rejects(
      multisig.execute(id),
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

  it("shouldn't execute proposal if there are no confirmations", async function () {
    await multisig.propose("transfer", false, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await rejects(
      multisig.execute(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/not-approved",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("shouldn't execute proposal if there is only 1 confirmation", async function () {
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await rejects(
      multisig.execute(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/not-approved",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("should accept proposal execution if there are enough confirmations", async function () {
    const amount = tezPrecision;
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });

  it("should execute existed proposal", async function () {
    const amount = tezPrecision;
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });

  it("shouldn't execute non-existed proposal", async function () {
    const id = multisig.storage.id_count.toNumber();
    await multisig.updateProvider("bob");
    await rejects(
      multisig.execute(id),
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

  it("shouldn't execute proposal twice", async function () {
    const amount = tezPrecision;
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await rejects(
      multisig.execute(id),
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

  it("should execute proposal before deadline", async function () {
    const amount = tezPrecision;
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });

  it("should execute transfer proposal", async function () {
    const amount = tezPrecision;
    await multisig.propose("transfer", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });

  it("should execute batch proposal", async function () {
    const amount = 3 * tezPrecision;
    await multisig.propose("batch", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.default(amount);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });

  it("should execute invoke proposal", async function () {
    const fa12 = await CTFA12.new(tokenStorage);
    await updateAddressInInvoke(fa12.address);
    const amount = 100;
    const multisigAddress = multisig.contract.address;
    await fa12.approve(multisigAddress, amount);
    await multisig.propose("invoke", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.pendings[id],
      undefined,
      "The executed transaction should be removed from map"
    );
    await multisig.updateProvider("alice");
  });
});
