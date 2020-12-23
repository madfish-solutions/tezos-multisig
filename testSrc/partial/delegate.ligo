const delegate : key_hash = ("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6" : key_hash);

function call(const u : unit) : list(operation) is 
  list[
    Tezos.set_delegate(Some(delegate))
  ]

#include "../../contracts/Multisig.ligo"