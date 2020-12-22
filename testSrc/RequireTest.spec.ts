import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import {
  bakeBlocks,
  tezPrecision,
  standardDelay,
  updateRequireData,
} from "./proxies/utils";
import BigNumber from "bignumber.js";

const CMultisig = artifacts.require("Multisig");

contract.only("Require()", function () {
  let multisig: Multisig;

  before(async function () {
    multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should update amount of required keys sent from wallet", async function () {
    const count = 1;
    const multisigAddress = multisig.contract.address;
    await updateRequireData(multisigAddress, count);
    await multisig.propose("require", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.required.toNumber(),
      count,
      "Number of required confirmations should be 1"
    );
    await multisig.updateProvider("alice");
  });

  it("shouldn't accept update amount of required keys sent from admin", async function () {
    const count = 1;
    await rejects(
      multisig.require(count),
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

  it("shouldn't accept update amount of required keys sent from unathorized user", async function () {
    const count = 1;
    await multisig.updateProvider("carol");
    await rejects(
      multisig.require(count),
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

  it("shouldn't update amount of required keys to 0", async function () {
    const count = 0;
    const multisigAddress = multisig.contract.address;
    await updateRequireData(multisigAddress, count);
    await multisig.propose("require", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await rejects(
      multisig.execute(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/invalid-require",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("shouldn't update amount of required keys to more then amount of admins", async function () {
    const count = 4;
    const multisigAddress = multisig.contract.address;
    await updateRequireData(multisigAddress, count);
    await multisig.propose("require", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await rejects(
      multisig.execute(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/invalid-require",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("should update amount of required keys to 2", async function () {
    const count = 2;
    const multisigAddress = multisig.contract.address;
    await updateRequireData(multisigAddress, count);
    await multisig.propose("require", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.required.toNumber(),
      count,
      "Number of required confirmations should be 2"
    );
    await multisig.updateProvider("alice");
  });

  it("should update amount of required keys to 1", async function () {
    const count = 1;
    const multisigAddress = multisig.contract.address;
    await updateRequireData(multisigAddress, count);
    await multisig.propose("require", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.execute(id);
    await multisig.updateStorage({ pendings: [new BigNumber(id)] });
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.required.toNumber(),
      count,
      "Number of required confirmations should be 1"
    );
    await multisig.updateProvider("alice");
  });
});
