const Multisig = artifacts.require("Multisig");
const accounts = require("../scripts/sandbox/accounts");
module.exports = async (deployer, _network, _accounts) => {
  deployer.deploy(Multisig, {
    proposal: null,
    required: 2,
    approved: [],
    keys_set: [accounts.alice.pkh, accounts.bob.pkh, accounts.eve.pkh],
  });
};
