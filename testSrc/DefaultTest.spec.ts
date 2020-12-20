import { Multisig } from "./proxies/multisig";
import { defaultAccountTokenInfo } from "./constants";
import { strictEqual, ok, notStrictEqual, rejects } from "assert";
import { bakeBlocks } from "./proxies/utils";

const CMultisig = artifacts.require("Multisig");
contract("Default()", function () {
  beforeEach(async () => {
    this.multisig = await Multisig.init((await CMultisig.deployed()).address);
  });

  it("should fail if not permitted", async function () {});
});
