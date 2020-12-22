const origin : address = ("tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb" : address);
const token : address = ("KT1CFnjDM2e45ypQyLBekDAniUrGCbu3KbKi" : address);
const value : nat = 100n;
const receiver : address = ("tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6" : address);
type send_type is Send of michelson_pair(address, "from", michelson_pair(address, "to", nat, "value"), "")

function get_token_contract(const token_address : address) : contract(send_type) is 
  case (Tezos.get_entrypoint_opt("%transfer", token_address) : option(contract(send_type))) of 
    Some(contr) -> contr
    | None -> (failwith("Call/ill-contract") : contract(send_type))
  end;

function call(const u : unit) : list(operation) is 
  list[
    Tezos.transaction(Send (origin, (receiver, value)), 
      0tz, 
      get_token_contract(token)
    );]

#include "../../contracts/Multisig.ligo"