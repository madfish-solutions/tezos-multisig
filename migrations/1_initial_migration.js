const { MichelsonMap } = require("@taquito/michelson-encoder");
const Multisig = artifacts.require("Multisig");
const accounts = require("../scripts/sandbox/accounts");

module.exports = async (deployer, _network, _accounts) => {
  deployer.deploy(Multisig, {
    pendings: MichelsonMap.fromLiteral({}),
    required: 2,
    id_count: "0",
    managers: [accounts.alice.pkh, accounts.bob.pkh],
  });
};
