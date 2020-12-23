import { Multisig } from "./proxies/multisig";
import multisigStorage from "./storage/multisig";
import { strictEqual, rejects } from "assert";
import { standardDelay, updateControlData } from "./proxies/utils";
import accounts from "./accounts/accounts";

const CMultisig = artifacts.require("Multisig");

contract("Control()", function () {
  let multisig: Multisig;

  before(async function () {
    const multisigContract = await CMultisig.new(multisigStorage);
    multisig = await Multisig.init(multisigContract.address.toString());
  });

  it("should update admins if sent from wallet", async function () {
    await multisig.updateProvider("alice");
    const newAdmin = accounts.carol.pkh;
    const multisigAddress = multisig.contract.address;
    await updateControlData(multisigAddress, true, newAdmin);
    await multisig.propose("control", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.execute(id);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.managers.length,
      3,
      "Number of managers should be 3"
    );
    strictEqual(
      finalStorage.managers.includes(newAdmin),
      true,
      "The new admin should be added"
    );
  });

  it("shouldn't accept update update admins by admin", async function () {
    await multisig.updateProvider("alice");
    const newAdmin = accounts.carol.pkh;
    await rejects(
      multisig.control(true, newAdmin),
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

  it("shouldn't accept update update admins by unathorized user", async function () {
    await multisig.updateProvider("carol");
    const newAdmin = accounts.carol.pkh;
    await rejects(
      multisig.control(true, newAdmin),
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

  it("shouldn't add the existed admin", async function () {
    await multisig.updateProvider("alice");
    const newAdmin = accounts.carol.pkh;
    const multisigAddress = multisig.contract.address;
    await updateControlData(multisigAddress, true, newAdmin);
    await multisig.propose("control", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await rejects(
      multisig.execute(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/invalid-admin",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });

  it("should add the new admin", async function () {
    await multisig.updateProvider("alice");
    const newAdmin = accounts.eve.pkh;
    const multisigAddress = multisig.contract.address;
    const initialStorage = multisig.storage;
    await updateControlData(multisigAddress, true, newAdmin);
    await multisig.propose("control", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.execute(id);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.managers.length,
      initialStorage.managers.length + 1,
      "Number of managers should increase"
    );
    strictEqual(
      finalStorage.managers.includes(newAdmin),
      true,
      "The new admin should be added"
    );
  });

  it("should remove the existed admin", async function () {
    await multisig.updateProvider("alice");
    const oldAdmin = accounts.eve.pkh;
    const multisigAddress = multisig.contract.address;
    const initialStorage = multisig.storage;
    await updateControlData(multisigAddress, false, oldAdmin);
    await multisig.propose("control", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await multisig.execute(id);
    const finalStorage = multisig.storage;
    strictEqual(
      finalStorage.managers.length,
      initialStorage.managers.length - 1,
      "Number of managers should increase"
    );
    strictEqual(
      finalStorage.managers.includes(oldAdmin),
      false,
      "The new admin should be added"
    );
  });

  it("shouldn't remove the non-existed admin", async function () {
    await multisig.updateProvider("alice");
    const oldAdmin = accounts.eve.pkh;
    const multisigAddress = multisig.contract.address;
    await updateControlData(multisigAddress, false, oldAdmin);
    await multisig.propose("control", true, standardDelay);
    const id = multisig.storage.id_count.toNumber() - 1;
    await multisig.updateProvider("bob");
    await multisig.approve(id);
    await rejects(
      multisig.execute(id),
      (err) => {
        strictEqual(
          err.message,
          "Multisig/invalid-admin",
          "Error message mismatch"
        );
        return true;
      },
      "Should fail"
    );
  });
});
