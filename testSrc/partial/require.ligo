const multisig : address = ("KT1DyhEsDQg98yW4RYcQQicv8urY6TDPcsbt" : address);
const count : nat = 1n;
type retquire_type is Set of nat

function get_multisig_contract(const multisig_address : address) : contract(retquire_type) is 
  case (Tezos.get_entrypoint_opt("%require", multisig_address) : option(contract(retquire_type))) of 
    Some(contr) -> contr
    | None -> (failwith("Call/ill-contract") : contract(retquire_type))
  end;

function call(const u : unit) : list(operation) is 
  list[
    Tezos.transaction(Set (count), 
      0tz, 
      get_multisig_contract(multisig)
    );]

#include "../../contracts/Multisig.ligo"