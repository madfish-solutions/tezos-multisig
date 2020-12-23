const multisig : address = ("KT1LV8XyNMVjXgemiKF4u49kvJrLRm2TNfXU" : address);
const allowed : bool = False;
const manager : address = ("tz1R2oNqANNy2vZhnZBJc8iMEqW79t85Fv7L" : address);
type operator_info is record [
  allowed     : bool;
  manager     : address;
]
type set_type is Set of operator_info

function get_multisig_contract(const multisig_address : address) : contract(set_type) is 
  case (Tezos.get_entrypoint_opt("%control", multisig_address) : option(contract(set_type))) of 
    Some(contr) -> contr
    | None -> (failwith("Call/ill-contract") : contract(set_type))
  end;

function call(const u : unit) : list(operation) is 
  list[
    Tezos.transaction(Set (record [
        allowed = allowed;
        manager = manager;
      ]),
      0tz, 
      get_multisig_contract(multisig)
    );]

#include "../../contracts/Multisig.ligo"