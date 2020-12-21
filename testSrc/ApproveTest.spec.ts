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
});
