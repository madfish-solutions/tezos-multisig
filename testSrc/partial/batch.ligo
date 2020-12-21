const value : tez = 100mutez;
const receiver0 : address = ("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" : address);
const receiver1 : address = ("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6" : address);
const receiver2 : address = ("tz1MnmtP4uAcgMpeZN6JtyziXeFqqwQG6yn6" : address);

function call(const u : unit) : list(operation) is 
  list[
    Tezos.transaction(unit, 
      value, 
      (get_contract(receiver0) : contract(unit))
    );
    Tezos.transaction(unit, 
      value, 
      (get_contract(receiver1) : contract(unit))
    );
    Tezos.transaction(unit, 
      value, 
      (get_contract(receiver2) : contract(unit))
    );]

#include "../../contracts/Multisig.ligo"