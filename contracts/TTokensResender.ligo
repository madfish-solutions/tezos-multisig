(* Router *)
function main (const receiver : address; const s : unit) : (list(operation) * unit) is
  (list[
    Tezos.transaction(unit, 
      Tezos.amount, 
      (get_contract(receiver) : contract(unit))
      )], s)
  