const value : tez = 1tz;
const receiver : address = ("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6" : address);

function call(const u : unit) : list(operation) is 
  list[
    Tezos.transaction(unit, 
      value, 
      (get_contract(receiver) : contract(unit))
    )]

#include "../../contracts/Multisig.ligo"