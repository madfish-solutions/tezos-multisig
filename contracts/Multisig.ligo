type operator_info is record [
  maanger     : address;
  allowed     : bool;
]

type proposal is record [
  actions     : unit -> list(operation);
  expired     : timestamp;
  approve     : set(address);
]

type storage is record [
  pendings    : big_map(nat, proposal);
  managers    : set(address);
  id_count    : nat;
  required    : nat;
]

type return is list (operation) * storage

type action is
| Control of operator_info
| Propose of proposal
| Approve of unit
| Execute of unit
| Default of unit
| Require of nat

// function check_owners (const owners : set(address)) : unit is 
//   if not Set.mem(Tezos.sender, owners) then 
//     (failwith("Multisig/not-permitted"): unit)
//   else Unit;

// function propose (const new_proposal : proposal_entry ; const s : storage) : return is
//   block { 
//     case s.proposal of
//       | None -> block {
//         s.approved := (set[] : set(address));
//         s.proposal := Some(new_proposal)
//       } 
//       | Some (proposal) -> block {
//         if proposal.expired < Tezos.now then
//           block {
//             s.approved := (set[] : set(address));
//             s.proposal := Some(new_proposal)
//           }
//         else failwith ("Multisig/proposal-exist")
//       }
//     end;
//   } with ((nil : list(operation)), s)

// function approve (const s : storage) : return is
//   block {
//     const proposal : proposal = s.proposal;
//     case proposal of
//       | None -> failwith("Multisig/proposal-not-exist")
//       | Some (p) -> 
//         if Set.mem(Tezos.sender, s.approved) then 
//           s.approved := Set.add(Tezos.sender, s.approved)
//         else failwith("Multisig/proposal-approved")
//       end;
//   } with ((nil : list(operation)), s)

// function execute (const s : storage) : return is
//   block {
//     const operations : list(operation) = (list [] : list(operation));
//     case s.proposal of
//       | None -> failwith("Multisig/not-enough-approvals")
//       | Some (proposal) -> if size(s.approved) = s.required then 
//           operations := proposal.actions(Unit)
//         else skip
//     end;
//   } with (operations, s)

function control (const action : operator_info; const s : storage) : storage is
  block {
    if Tezos.sender = Tezos.self_address then skip
    else failwith("Multisig/not-permitted");
    s.managers := if action.allowed then Set.add(action.maanger, s.managers)
    else Set.remove(action.maanger, s.managers);
  } with s

function require (const new_required : nat; const s : storage) : storage is
  block {
    if Tezos.sender = Tezos.self_address then skip
    else failwith("Multisig/not-permitted");
    s.required := new_required;
  } with s

function main (const action : action; const s : storage) : return is
  case action of
    | Control(params) -> ((nil : list(operation)), control(params, s))
    | Propose(params) -> ((nil : list(operation)), s)
    | Approve(params) -> ((nil : list(operation)), s)
    | Execute(params) -> ((nil : list(operation)), s)
    | Default(params) -> ((nil : list(operation)), s)
    | Require(params) -> ((nil : list(operation)), require(params, s))
  end