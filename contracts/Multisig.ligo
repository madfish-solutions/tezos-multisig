type proposal_entry is record [
  actions     : unit -> list(operation);
  expired     : timestamp;
]

type proposal is option(proposal_entry);

type storage is record [
  proposal    : proposal;
  required    : nat;
  approved    : set(address) ;
  keys_set    : set(address) ;
]

type return is list (operation) * storage

type action is
  | Propose of proposal_entry
  | Approve of unit
  | Execute of unit

function check_owners (const owners : set(address)) : unit is 
  if not Set.mem(Tezos.sender, owners) then 
    (failwith("Multisig/not-permitted"): unit)
  else Unit;

function propose (const new_proposal : proposal_entry ; const s : storage) : return is
  block { 
    case s.proposal of
      | None -> block {
        s.approved := (set[] : set(address));
        s.proposal := Some(new_proposal)
      } 
      | Some (proposal) -> block {
        if proposal.expired < Tezos.now then
          block {
            s.approved := (set[] : set(address));
            s.proposal := Some(new_proposal)
          }
        else failwith ("Multisig/proposal-exist")
      }
    end;
  } with ((nil : list(operation)), s)

function approve (const s : storage) : return is
  block {
    const proposal : proposal = s.proposal;
    case proposal of
      | None -> failwith("Multisig/proposal-not-exist")
      | Some (p) -> 
        if Set.mem(Tezos.sender, s.approved) then 
          s.approved := Set.add(Tezos.sender, s.approved)
        else failwith("Multisig/proposal-approved")
      end;
  } with ((nil : list(operation)), s)

function execute (const s : storage) : return is
  block {
    const operations : list(operation) = (list [] : list(operation));
    case s.proposal of
      | None -> failwith("Multisig/not-enough-approvals")
      | Some (proposal) -> if size(s.approved) = s.required then 
          operations := proposal.actions(Unit)
        else skip
    end;
  } with (operations, s)

function main (const action : action; const s : storage) : return is
  block {
    check_owners(s.keys_set);
  } with (
    case action of
      | Propose(params) -> propose(params, s)
      | Approve -> approve(s)
      | Execute -> execute(s)
    end)