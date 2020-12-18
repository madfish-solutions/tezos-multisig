const Multisig = artifacts.require("Multisig");
const accounts = require("../scripts/sandbox/accounts");
module.exports = async (deployer, _network, _accounts) => {
  deployer.deploy(Multisig, {
    current_proposal: null,
    threshold: 2,
    approved_by: [],
    owners: [accounts.alice.pkh, accounts.bob.pkh, accounts.eve.pkh],
  });
  //   deployer.deploy(Multisig, {
  //     stored_counter: 0,
  //     threshold: 2,
  //     keys: [accounts.alice.pk, accounts.bob.pk, accounts.eve.pk],
  //   });
};
