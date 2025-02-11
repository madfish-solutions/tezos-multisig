const { alice } = require("./scripts/sandbox/accounts");

module.exports = {
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  networks: {
    development: {
      host: "http://localhost",
      port: 8732,
      network_id: "*",
      secretKey: alice.sk,
      type: "tezos",
    },
    carthagenet: {
      host: "https://carthagenet.smartpy.io",
      port: 443,
      network_id: "*",
      type: "tezos",
    },
    delphinet: {
      host: "https://delphinet.smartpy.io",
      port: 443,
      network_id: "*",
      type: "tezos",
      secretKey: alice.sk,
    },
    mainnet: {
      host: "https://mainnet.smartpy.io",
      port: 443,
      network_id: "*",
      type: "tezos",
    },
    zeronet: {
      host: "https://zeronet.smartpy.io",
      port: 443,
      network_id: "*",
      type: "tezos",
    },
  },
};
